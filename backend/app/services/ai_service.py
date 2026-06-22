"""
DestinAI — AI Service
Integration with Google Gemini (google.genai SDK), OpenAI, Meta (Llama), Perplexity, Grok, and DeepSeek.
Handles career guide generation, career simulation, college matching, and career ranking.
"""

import json
import logging
from typing import Any, Dict, List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Prioritized list of Gemini model IDs to try (from cheapest/fastest to more powerful)
# The system will pick the first one that works for this API key
GEMINI_MODEL_PRIORITY = [
    "gemini-2.5-flash",          # Latest stable 2.5 flash (higher quota)
    "gemini-2.0-flash",          # Stable 2.0 flash
    "gemini-2.0-flash-lite",     # Ultra-fast, low quota usage
    "gemini-flash-lite-latest",  # Lite flash alias
    "gemini-flash-latest",       # Alias for latest flash (tiny daily free limit)
    "gemini-pro-latest",         # Pro (more powerful, higher quota)
]


class AIService:
    """AI service for career guidance using multiple LLM providers."""

    def __init__(self):
        self.primary_model = settings.AI_PRIMARY_MODEL
        self.fallback_model = settings.AI_FALLBACK_MODEL
        self._key_validity_cache = {}
        self._gemini_working_model: Optional[str] = None  # Cached working Gemini model name
        self.last_used_model = "mock"

    def is_api_configured(self, provider: Optional[str] = None) -> bool:
        """Check if the selected AI provider's API key is configured (i.e. not empty)."""
        settings.reload_from_env()
        self.primary_model = settings.AI_PRIMARY_MODEL
        self.fallback_model = settings.AI_FALLBACK_MODEL

        prov = (provider or self.primary_model).lower()
        key = ""
        if prov == "gemini":
            key = settings.GEMINI_API_KEY
        elif prov == "openai":
            key = settings.OPENAI_API_KEY
        elif prov == "meta":
            key = settings.META_API_KEY
        elif prov == "perplexity":
            key = settings.PERPLEXITY_API_KEY
        elif prov == "grok":
            key = settings.GROK_API_KEY
        elif prov == "deepseek":
            key = settings.DEEPSEEK_API_KEY

        return bool(key) and key.strip() != ""

    def is_api_key_placeholder(self, provider: Optional[str] = None) -> bool:
        """Check if the configured API key is just a placeholder."""
        settings.reload_from_env()
        self.primary_model = settings.AI_PRIMARY_MODEL
        self.fallback_model = settings.AI_FALLBACK_MODEL

        prov = (provider or self.primary_model).lower()
        key = ""
        if prov == "gemini":
            key = settings.GEMINI_API_KEY
        elif prov == "openai":
            key = settings.OPENAI_API_KEY
        elif prov == "meta":
            key = settings.META_API_KEY
        elif prov == "perplexity":
            key = settings.PERPLEXITY_API_KEY
        elif prov == "grok":
            key = settings.GROK_API_KEY
        elif prov == "deepseek":
            key = settings.DEEPSEEK_API_KEY

        return "your-key" in key.lower() or "your-api" in key.lower()

    def _get_provider_key_from_settings(self, provider: str) -> str:
        """Helper to get key value for a provider from settings."""
        prov = provider.lower()
        if prov == "gemini":
            return settings.GEMINI_API_KEY
        elif prov == "openai":
            return settings.OPENAI_API_KEY
        elif prov == "meta":
            return settings.META_API_KEY
        elif prov == "perplexity":
            return settings.PERPLEXITY_API_KEY
        elif prov == "grok":
            return settings.GROK_API_KEY
        elif prov == "deepseek":
            return settings.DEEPSEEK_API_KEY
        return ""

    async def verify_provider_key(self, provider: str) -> bool:
        """Perform a quick, lightweight connection test to verify if the API key is working."""
        settings.reload_from_env()
        self.primary_model = settings.AI_PRIMARY_MODEL
        self.fallback_model = settings.AI_FALLBACK_MODEL

        prov = provider.lower()

        # Validate that the provider is supported
        SUPPORTED_PROVIDERS = {"gemini", "openai", "meta", "perplexity", "grok", "deepseek"}
        if prov not in SUPPORTED_PROVIDERS:
            logger.warning(f"Unsupported AI provider '{prov}' requested. Supported providers are: {sorted(list(SUPPORTED_PROVIDERS))}")
            self._key_validity_cache[prov] = (False, "")
            return False

        current_key = self._get_provider_key_from_settings(prov)

        # Check validity cache with key value check
        if prov in self._key_validity_cache:
            cached_val, cached_key = self._key_validity_cache[prov]
            if cached_key == current_key:
                return cached_val

        if not self.is_api_configured(prov) or self.is_api_key_placeholder(prov):
            self._key_validity_cache[prov] = (False, current_key)
            return False

        try:
            logger.info(f"Performing live validation test for AI provider '{prov}'...")
            if prov == "gemini":
                # Use new google.genai SDK — try each model in priority order
                from google import genai as _genai
                client = _genai.Client(api_key=settings.GEMINI_API_KEY, http_options={'timeout': 15000})
                working_model = None
                has_quota_error = False
                fallback_model = None
                for model_name in GEMINI_MODEL_PRIORITY:
                    try:
                        resp = await client.aio.models.generate_content(model=model_name, contents="Ping")
                        if resp and resp.text:
                            working_model = model_name
                            break
                    except Exception as model_err:
                        err_str = str(model_err)
                        if "404" in err_str or "NOT_FOUND" in err_str:
                            continue  # Model not available for this key
                        elif "401" in err_str or "403" in err_str or "API_KEY_INVALID" in err_str:
                            # Key is invalid — stop trying
                            logger.warning(f"Gemini API key is invalid: {err_str[:100]}")
                            self._key_validity_cache[prov] = (False, current_key)
                            return False
                        elif "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                            # Quota exceeded on this model — but key IS valid, try next to find one with quota
                            logger.warning(f"Gemini quota exhausted for {model_name}, trying next...")
                            has_quota_error = True
                            if not fallback_model:
                                fallback_model = model_name
                            continue
                        elif "503" in err_str or "UNAVAILABLE" in err_str or "demand" in err_str.lower():
                            # Temporary service unavailable / high demand — key is valid
                            logger.warning(f"Gemini model {model_name} temporarily unavailable (503), trying next...")
                            has_quota_error = True
                            if not fallback_model:
                                fallback_model = model_name
                            continue
                        else:
                            logger.warning(f"Gemini model {model_name} error: {err_str[:100]}")
                            if not fallback_model:
                                fallback_model = model_name
                            continue

                if not working_model and has_quota_error:
                    working_model = fallback_model

                if working_model:
                    self._gemini_working_model = working_model
                    logger.info(f"Gemini validated with model: {working_model}")
                    self._key_validity_cache[prov] = (True, current_key)
                    return True
                else:
                    logger.warning("No working Gemini model found for this API key.")
                    # Do NOT cache False for transient or network failures unless API key is explicitly invalid
                    return False
            else:
                from openai import OpenAI
                api_key = ""
                base_url = ""
                default_model = "gpt-4o"
                if prov == "openai":
                    api_key = settings.OPENAI_API_KEY
                elif prov == "meta":
                    api_key = settings.META_API_KEY
                    base_url = "https://api.together.xyz/v1"
                    default_model = "meta-llama/Llama-3-8b-chat-hf"
                elif prov == "perplexity":
                    api_key = settings.PERPLEXITY_API_KEY
                    base_url = "https://api.perplexity.ai"
                    default_model = "sonar-reasoning"
                elif prov == "grok":
                    api_key = settings.GROK_API_KEY
                    base_url = "https://api.x.ai/v1"
                    default_model = "grok-beta"
                elif prov == "deepseek":
                    api_key = settings.DEEPSEEK_API_KEY
                    base_url = "https://api.deepseek.com/v1"
                    default_model = "deepseek-chat"

                model_name = settings.AI_MODEL_NAME if settings.AI_MODEL_NAME else default_model
                client_args = {"api_key": api_key}
                if base_url:
                    client_args["base_url"] = base_url
                client = OpenAI(**client_args)
                
                try:
                    response = client.chat.completions.create(
                        model=model_name,
                        messages=[{"role": "user", "content": "Ping"}],
                        max_tokens=5,
                    )
                    is_valid = response is not None and len(response.choices) > 0
                    self._key_validity_cache[prov] = (is_valid, current_key)
                    return is_valid
                except Exception as api_err:
                    err_str = str(api_err).lower()
                    is_bad_key = any(x in err_str for x in ["401", "403", "api_key_invalid", "unauthorized", "invalid key", "credential"])
                    if is_bad_key:
                        logger.warning(f"API key for provider '{prov}' is invalid: {api_err}")
                        self._key_validity_cache[prov] = (False, current_key)
                        return False
                    # Quota/Rate limits (429) or Service Unavailable (503) -> key is valid
                    is_transient_or_quota = any(x in err_str for x in ["429", "503", "rate_limit", "quota", "unavailable", "timeout", "connection"])
                    if is_transient_or_quota:
                        logger.warning(f"Provider '{prov}' returned quota/transient warning during validation: {api_err}")
                        self._key_validity_cache[prov] = (True, current_key)  # Key is working, try using it
                        return True
                    
                    logger.warning(f"Provider '{prov}' connection failed: {api_err}")
                    return False

        except Exception as e:
            logger.warning(f"Connection test failed for provider '{prov}': {e}")
            err_str = str(e).lower()
            is_bad_key = any(x in err_str for x in ["401", "403", "api_key_invalid", "unauthorized", "invalid key", "credential"])
            if is_bad_key:
                self._key_validity_cache[prov] = (False, current_key)
            return False

    async def get_active_validated_provider(self) -> Optional[str]:
        """Check primary provider first, and if invalid, fall back to any other configured and validated working provider."""
        settings.reload_from_env()
        self.primary_model = settings.AI_PRIMARY_MODEL
        self.fallback_model = settings.AI_FALLBACK_MODEL

        primary = self.primary_model.lower()
        if await self.verify_provider_key(primary):
            return primary

        # Search other providers in order of fallback
        for prov in ["gemini", "openai", "meta", "perplexity", "grok", "deepseek"]:
            if prov == primary:
                continue
            if await self.verify_provider_key(prov):
                logger.info(f"Fallback Active: Provider '{prov}' validated successfully. Reusing it for tasks.")
                return prov

        return None

    def _build_career_prompt(self, inputs: Dict[str, str]) -> str:
        """Build a structured prompt for career guide generation."""
        return f"""You are DestinAI, an expert AI career counselor. Based on the following inputs from a student, generate a comprehensive, personalized career guide.

## Student Inputs:
1. **Interest Areas:** {inputs.get('interest_areas', 'Not specified')}
2. **Strengths:** {inputs.get('strengths', 'Not specified')}
3. **Preferred Stream:** {inputs.get('preferred_stream', 'Not specified')}
4. **Education Level:** {inputs.get('education_level', 'Not specified')}
5. **Budget Range:** {inputs.get('budget_range', 'Not specified')}
6. **Location Preference:** {inputs.get('location_preference', 'Not specified')}
7. **Work-Life Balance Preference:** {inputs.get('work_life_balance', 'Not specified')}
8. **Risk Tolerance:** {inputs.get('risk_tolerance', 'Not specified')}
9. **Daily Interaction Style:** {inputs.get('interaction_style', 'Not specified')}

## Generate the following in JSON format:
{{
    "career_path": "Primary recommended career path",
    "title": "Personalized career guide title",
    "summary": "2-3 sentence summary of the career guide",
    "recommended_stream": "science|commerce|arts|vocational",
    "confidence_score": 85,
    "future_proof_score": 80,
    "alternative_careers": ["career1", "career2", "career3"],
    "milestones": [
        {{
            "week_number": 1,
            "title": "Milestone title",
            "description": "Detailed description of what to do",
            "category": "learning|project|networking|skill|exam_prep",
            "priority": "high|medium|low",
            "estimated_hours": 5,
            "resources": ["https://www.coursera.org", "https://www.udemy.com"]
        }}
    ],
    "college_criteria": {{
        "preferred_courses": ["course1", "course2"],
        "preferred_streams": ["stream1"],
        "budget_range": "value",
        "location": "value"
    }}
}}

Generate exactly 12 milestones (covering 12 weeks / 3 months as an initial career guide).
Be specific, actionable, and realistic. Consider Indian education system and job market.
Respond ONLY with valid JSON, no markdown formatting."""

    def _build_simulation_prompt(self, career_title: str, duration: str = "1_day") -> str:
        """Build a prompt for career simulation."""
        duration_text = {
            "1_day": "a typical day",
            "1_week": "a typical week",
            "1_month": "a typical month",
        }.get(duration, "a typical day")

        return f"""You are simulating {duration_text} in the life of a {career_title}.
Write a vivid, realistic first-person narrative that helps a student understand what this career is really like.

Respond in JSON format:
{{
    "simulation": "Detailed narrative of {duration_text} (500+ words)",
    "daily_tasks": ["task1", "task2", "task3", "task4", "task5"],
    "challenges": ["challenge1", "challenge2", "challenge3"],
    "rewards": ["reward1", "reward2", "reward3"],
    "typical_salary": 800000
}}

Respond ONLY with valid JSON."""

    def _parse_json_response(self, text: str) -> Optional[Dict[str, Any]]:
        """Clean and parse raw JSON text returned from LLMs."""
        try:
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            
            cleaned = text.strip()
            # Clean up trailing comma within lists/dicts if any
            return json.loads(cleaned)
        except Exception as e:
            logger.error(f"Failed to parse JSON response: {e}. Raw text was: {text[:200]}...")
            return None

    async def generate_with_gemini(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Generate response using Google Gemini API (google.genai SDK)."""
        try:
            from google import genai as _genai
            client = _genai.Client(api_key=settings.GEMINI_API_KEY, http_options={'timeout': 60000})

            # Use the cached working model from validation, or auto-detect
            model_candidates = [self._gemini_working_model] if self._gemini_working_model else []
            if settings.AI_MODEL_NAME and settings.AI_MODEL_NAME not in model_candidates:
                model_candidates.insert(0, settings.AI_MODEL_NAME)
            model_candidates.extend(m for m in GEMINI_MODEL_PRIORITY if m not in model_candidates)

            last_err = None
            for model_name in model_candidates:
                try:
                    logger.info(f"Gemini: Trying model '{model_name}'...")
                    resp = await client.aio.models.generate_content(model=model_name, contents=prompt)
                    result = self._parse_json_response(resp.text)
                    if result is not None:
                        self._gemini_working_model = model_name  # Cache the working model
                        self.last_used_model = f"gemini/{model_name}"
                        logger.info(f"Gemini generation succeeded with model: {model_name}")
                        return result
                    logger.warning(f"Gemini model {model_name} returned non-JSON response, trying next...")
                except Exception as model_err:
                    err_str = str(model_err)
                    last_err = model_err
                    if "404" in err_str or "NOT_FOUND" in err_str:
                        continue  # Model not available
                    elif "401" in err_str or "403" in err_str or "API_KEY_INVALID" in err_str:
                        logger.error(f"Gemini API key rejected: {err_str[:100]}")
                        return None  # Key invalid — don't try other models
                    elif "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                        logger.warning(f"Gemini quota exceeded for {model_name}: trying next...")
                        continue
                    else:
                        logger.warning(f"Gemini model {model_name} failed: {err_str[:120]}")
                        continue

            logger.error(f"All Gemini models failed. Last error: {last_err}")
            return None

        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return None

    async def generate_with_openai_compatible(
        self, prompt: str, base_url: str, api_key: str, default_model: str
    ) -> Optional[Dict[str, Any]]:
        """Generic handler for OpenAI-compatible providers (OpenAI, Meta, Perplexity, Grok, DeepSeek)."""
        try:
            from openai import OpenAI

            model_name = settings.AI_MODEL_NAME if settings.AI_MODEL_NAME else default_model
            
            # Setup OpenAI client parameters
            client_args = {"api_key": api_key}
            if base_url:
                client_args["base_url"] = base_url

            client = OpenAI(**client_args)
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are DestinAI, an expert career counselor. Respond only in valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=4000,
            )

            text = response.choices[0].message.content.strip()
            return self._parse_json_response(text)

        except Exception as e:
            logger.error(f"OpenAI-compatible API error on {base_url or 'default'}: {e}")
            return None

    async def generate_with_selected_provider(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Generates response using the first validated working provider."""
        provider = await self.get_active_validated_provider()
        if not provider:
            logger.warning("No working AI Provider API Key is validated. Falling back to mock data.")
            self.last_used_model = "mock"
            return None

        self.last_used_model = provider
        logger.info(f"Using validated AI provider '{provider}' for task.")

        result = None
        if provider == "gemini":
            result = await self.generate_with_gemini(prompt)
        elif provider == "openai":
            result = await self.generate_with_openai_compatible(
                prompt, base_url="", api_key=settings.OPENAI_API_KEY, default_model="gpt-4o"
            )
        elif provider == "meta":
            result = await self.generate_with_openai_compatible(
                prompt,
                base_url="https://api.together.xyz/v1",
                api_key=settings.META_API_KEY,
                default_model="meta-llama/Llama-3-8b-chat-hf"
            )
        elif provider == "perplexity":
            result = await self.generate_with_openai_compatible(
                prompt,
                base_url="https://api.perplexity.ai",
                api_key=settings.PERPLEXITY_API_KEY,
                default_model="sonar-reasoning"
            )
        elif provider == "grok":
            result = await self.generate_with_openai_compatible(
                prompt,
                base_url="https://api.x.ai/v1",
                api_key=settings.GROK_API_KEY,
                default_model="grok-beta"
            )
        elif provider == "deepseek":
            result = await self.generate_with_openai_compatible(
                prompt,
                base_url="https://api.deepseek.com/v1",
                api_key=settings.DEEPSEEK_API_KEY,
                default_model="deepseek-chat"
            )
        else:
            logger.error(f"Unknown AI provider configured: {provider}")
            result = None

        if result is None:
            logger.warning(f"AI Generation failed or returned empty for provider '{provider}'. Resetting last_used_model to 'mock'.")
            self.last_used_model = "mock"
        return result

    async def generate_mock_response(self, inputs: Dict[str, str]) -> Dict[str, Any]:
        """Generate a mock response when no API keys are configured."""
        stream = inputs.get("preferred_stream", "science").lower()
        interest_raw = inputs.get("interest_areas", "technology").lower()
        
        # Map common interest keywords to category keys
        interest = "default"
        if "tech" in interest_raw or "analy" in interest_raw:
            interest = "technology"
        elif "med" in interest_raw or "health" in interest_raw:
            interest = "medicine"
        elif "research" in interest_raw or "sci" in interest_raw:
            interest = "research"
        elif "finan" in interest_raw or "math" in interest_raw:
            interest = "finance"
        elif "business" in interest_raw or "manag" in interest_raw or "enter" in interest_raw:
            interest = "business"
        elif "design" in interest_raw or "creat" in interest_raw:
            interest = "design"
        elif "media" in interest_raw or "social" in interest_raw:
            interest = "media"

        career_map = {
            "science": {
                "technology": "Software Engineer",
                "medicine": "Doctor (MBBS)",
                "research": "Research Scientist",
                "default": "Data Scientist",
            },
            "commerce": {
                "finance": "Chartered Accountant",
                "business": "Business Analyst",
                "default": "Financial Analyst",
            },
            "arts": {
                "design": "UX Designer",
                "media": "Content Strategist",
                "default": "Graphic Designer",
            },
            "vocational": {
                "default": "Full Stack Developer",
            },
        }

        stream_careers = career_map.get(stream, career_map["science"])
        career = stream_careers.get(interest, stream_careers.get("default", "Software Engineer"))

        return {
            "career_path": career,
            "title": f"Your Path to Becoming a {career}",
            "summary": f"Based on your interests in {interest} and strengths, "
            f"we recommend pursuing a career as a {career}. "
            f"This career guide will guide you through the next 12 weeks.",
            "recommended_stream": stream,
            "confidence_score": 85.0,
            "future_proof_score": 78.0,
            "alternative_careers": [
                "Data Analyst",
                "Product Manager",
                "UX Researcher",
            ],
            "milestones": [
                {
                    "week_number": i + 1,
                    "title": f"Week {i + 1}: {'Foundation' if i < 4 else 'Building Skills' if i < 8 else 'Advanced Practice'}",
                    "description": f"Focus on {'fundamentals' if i < 4 else 'intermediate concepts' if i < 8 else 'real-world projects'} related to {career}.",
                    "category": "learning" if i < 4 else "project" if i < 8 else "networking",
                    "priority": "high" if i < 4 else "medium",
                    "estimated_hours": 10,
                    "resources": [
                        "https://www.coursera.org",
                        "https://www.udemy.com",
                    ],
                }
                for i in range(12)
            ],
            "college_criteria": {
                "preferred_courses": [f"B.Tech {interest}", f"BCA"],
                "preferred_streams": [stream],
                "budget_range": inputs.get("budget_range", "1-5L"),
                "location": inputs.get("location_preference", "Any India"),
            },
        }

    async def generate_career_guide(self, inputs: Dict[str, str]) -> Dict[str, Any]:
        """Generate a career guide. Tries configured selected provider, otherwise falls back to mock."""
        result = await self.generate_with_selected_provider(self._build_career_prompt(inputs))
        if result:
            result["_ai_model_used"] = self.primary_model
            return result

        # Fallback to mock response
        logger.warning("AI Generation failed or not configured. Using mock response.")
        result = await self.generate_mock_response(inputs)
        result["_ai_model_used"] = "mock"
        return result

    async def simulate_career(self, career_title: str, duration: str = "1_day") -> Dict[str, Any]:
        """Simulate a career experience."""
        prompt = self._build_simulation_prompt(career_title, duration)
        result = await self.generate_with_selected_provider(prompt)
        if result:
            result["ai_model_used"] = self.primary_model
            result["career_title"] = career_title
            return result

        # Mock simulation
        return {
            "career_title": career_title,
            "simulation": f"A day in the life of a {career_title}: "
            f"You start your morning reviewing tasks and planning your day. "
            f"The morning is spent on core technical work related to {career_title}. "
            f"After lunch, you collaborate with teammates and attend meetings. "
            f"The evening is for documentation and preparing for the next day.",
            "daily_tasks": [
                "Review daily objectives",
                "Core technical work",
                "Team collaboration",
                "Documentation",
                "Continuous learning",
            ],
            "challenges": [
                "Keeping up with industry changes",
                "Meeting tight deadlines",
                "Balancing multiple projects",
            ],
            "rewards": [
                "Solving complex problems",
                "Making an impact",
                "Continuous growth opportunities",
            ],
            "typical_salary": 800000,
            "ai_model_used": "mock",
        }

    def generate_mock_college_predictions(self, colleges: List[Dict[str, Any]], criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate high-quality mock college predictions with highly dynamic match scores (30-99%) and reasons."""
        scored_colleges = []

        metropolitan_hubs = {"mumbai", "delhi", "new delhi", "bangalore", "bengaluru", "chennai", "kolkata", "noida", "pune"}
        small_towns_t23 = {"pilani", "vellore", "tiruchirappalli", "trichy", "mangalore", "surathkal", "kanpur", "manipal"}

        def _map_budget(budget: Optional[str]) -> float:
            if not budget:
                return 10000000.0
            b_clean = budget.strip().lower()
            if b_clean in ["free", "zero/self-taught", "zero", "self-taught"]:
                return 10000.0
            elif b_clean in ["low", "below 1l", "below 1 lakh"]:
                return 100000.0
            elif b_clean in ["medium", "1-5l", "1-5 lakh", "1 to 5l"]:
                return 500000.0
            elif b_clean in ["high", "5-10l", "5-10 lakh", "5 to 10l"]:
                return 1000000.0
            elif b_clean in ["premium", "above 10l", "above 10 lakh"]:
                return 10000000.0
            return 1000000.0

        def _map_streams(pref_stream: Optional[str]) -> List[str]:
            if not pref_stream:
                return []
            s_clean = pref_stream.strip().lower()
            if "creative" in s_clean or "arts" in s_clean or "media" in s_clean:
                return ["arts", "vocational"]
            elif "tech" in s_clean or "it" in s_clean:
                return ["science", "vocational"]
            elif "health" in s_clean or "med" in s_clean:
                return ["science"]
            elif "business" in s_clean or "finance" in s_clean or "commerce" in s_clean:
                return ["commerce"]
            elif "engineer" in s_clean or "manufactur" in s_clean:
                return ["science"]
            elif "law" in s_clean or "policy" in s_clean:
                return ["arts", "commerce"]
            elif "trade" in s_clean or "vocational" in s_clean:
                return ["vocational"]
            if s_clean in ["science", "commerce", "arts", "vocational"]:
                return [s_clean]
            return [s_clean]

        for c in colleges:
            score = 45.0  # Dynamic base score
            reasons = []

            stream_penalty = 0.0
            budget_penalty = 0.0
            location_bonus_penalty = 0.0

            # 1. Stream matching
            pref_stream = criteria.get("preferred_stream")
            if pref_stream and pref_stream.strip():
                target_db_streams = _map_streams(pref_stream)
                # Offered streams are passed down in c["offered_streams"]
                offered_streams = [s.lower() for s in c.get("offered_streams", [])]
                
                # Check for match
                has_match = any(ts in offered_streams for ts in target_db_streams)
                if has_match:
                    score += 25.0
                    reasons.append(f"Offers your preferred stream ({pref_stream})")
                else:
                    stream_penalty = -25.0
                    reasons.append(f"Stream mismatch (No {pref_stream} courses)")
            else:
                score += 15.0

            # 2. Location matching
            loc_pref = criteria.get("location")
            if loc_pref and loc_pref.strip():
                loc_clean = loc_pref.strip().lower()
                c_city = (c.get("city") or "").lower()
                c_state = (c.get("state") or "").lower()

                if loc_clean in ["rural", "rural / small town"]:
                    if c_city in metropolitan_hubs:
                        location_bonus_penalty = -15.0
                        reasons.append("Located in metropolitan hub (unlike rural preference)")
                    elif c_city in small_towns_t23:
                        location_bonus_penalty = 20.0
                        reasons.append("Excellent non-metropolitan / small town campus environment")
                    else:
                        location_bonus_penalty = 5.0
                elif loc_clean in ["major_hub", "major tech/business hub"]:
                    if c_city in metropolitan_hubs:
                        location_bonus_penalty = 20.0
                        reasons.append("Great location for metropolitan corporate networking")
                    else:
                        location_bonus_penalty = 5.0
                elif loc_clean in ["mid_city", "mid-sized city"]:
                    if c_city in small_towns_t23 or c_city in ["pune", "noida"]:
                        location_bonus_penalty = 20.0
                        reasons.append(f"Convenient campus location in mid-sized {c.get('city')}")
                    else:
                        location_bonus_penalty = 5.0
                elif loc_clean in ["remote", "100% remote", "nomad", "global/nomad"]:
                    location_bonus_penalty = 12.0
                    reasons.append("Flexible location matching your remote/nomad preferences")
                elif loc_clean in ["any", "any india"]:
                    location_bonus_penalty = 12.0
                    reasons.append(f"Convenient campus location in {c.get('city')}")
                else:
                    if loc_clean in c_city or loc_clean in c_state:
                        location_bonus_penalty = 20.0
                        reasons.append(f"Located directly in your preferred location ({c.get('city')})")
                    else:
                        location_bonus_penalty = 4.0
                        reasons.append(f"National exposure outside your preferred location")
            else:
                location_bonus_penalty = 10.0
                reasons.append(f"Convenient campus location in {c.get('city')}")

            score += location_bonus_penalty

            # 3. Placement rate matching
            if c.get("placement_rate"):
                rate = float(c["placement_rate"])
                score += (rate / 100) * 12
                if rate > 80 and len(reasons) < 3:
                    reasons.append(f"Stellar campus placements: {rate}% placement rate")

            # 4. NIRF Rank matching
            rank = c.get("nirf_rank")
            if rank:
                rank_int = int(rank)
                if rank_int <= 100:
                    score += (100 - rank_int) / 100 * 8
                    if rank_int <= 10 and len(reasons) < 3:
                        reasons.append(f"Highly prestigious National Rank (NIRF #{rank_int})")
                elif rank_int <= 500:
                    score += 3
            
            # 5. Fee matching
            budget_pref = criteria.get("budget_range")
            if budget_pref and c.get("fee_range_max"):
                max_budget = _map_budget(budget_pref)
                fee_max = float(c["fee_range_max"])
                if fee_max <= max_budget:
                    score += 15.0
                    if len(reasons) < 3:
                        reasons.append("Comfortably within your preferred budget range")
                elif fee_max <= max_budget * 1.5:
                    score += 5.0
                else:
                    budget_penalty = -30.0
                    reasons.append("Fees exceed your target budget range")
            else:
                score += 8.0

            # Compute final compatibility score
            final_score = score + stream_penalty + budget_penalty

            # Apply multiplier scaling for severe misfits to drop compatibility down to 30-55%
            if stream_penalty < 0:
                final_score *= 0.60
            if budget_penalty < 0:
                final_score *= 0.65
            if location_bonus_penalty < 0:
                final_score *= 0.85

            final_score = max(30.0, min(round(final_score, 1), 99.0))
            
            scored_colleges.append({
                "college_id": c["id"],
                "match_score": int(final_score),
                "match_reasons": reasons[:3]
            })

        scored_colleges.sort(key=lambda x: x["match_score"], reverse=True)
        return scored_colleges

    def generate_mock_career_predictions(self, careers: List[Dict[str, Any]], criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate high-quality mock career predictions with match scores and reasons when LLM fails."""
        scored_careers = []
        
        # Check if we have meaningful criteria
        pref_stream = criteria.get("preferred_stream", "").strip()
        interests = criteria.get("interests", "").strip()
        strengths = criteria.get("strengths", "").strip()
        
        has_criteria = bool(pref_stream or interests or strengths)
        
        for c in careers:
            score = 45.0  # Base mock AI score (lower base for differentiation)
            reasons = []
            
            # Stream matching (30 points)
            if pref_stream and c.get("stream") and pref_stream.lower() in c["stream"].lower():
                reasons.append(f"Aligned with {c['stream']} stream")
                score += 30.0
                
            # Interest matching (25 points max)
            if interests:
                words = [w.strip().lower() for w in interests.split(",") if w.strip()]
                matched = []
                for w in words:
                    title_match = w in c["title"].lower()
                    cat_match = w in c.get("category", "").lower()
                    desc_match = w in c.get("description", "").lower()
                    if title_match or cat_match or desc_match:
                        matched.append(w)
                if matched:
                    reasons.append(f"Matches your interests: {', '.join(matched)}")
                    score += min(len(matched) * 12, 25)
                else:
                    reasons.append("Complementary to your interests")
                    score += 3.0
            elif has_criteria:
                # Has other criteria but no interests specified
                score += 2.0
            else:
                # No criteria at all - vary based on career popularity/demand
                demand_lower = (c.get("demand_level") or "").lower()
                if demand_lower == "high":
                    score += 15.0
                    reasons.append("High-growth industry demand")
                elif demand_lower == "medium":
                    score += 8.0
                    reasons.append("Steady industry demand")
                else:
                    score += 3.0
                
            # Strengths matching (20 points max)
            if strengths:
                strength_words = [w.strip().lower() for w in strengths.split(",") if w.strip()]
                matched_strengths = []
                for w in strength_words:
                    if w in c["title"].lower() or w in c.get("category", "").lower():
                        matched_strengths.append(w)
                if matched_strengths:
                    reasons.append(f"Leverages your strengths in {', '.join(matched_strengths)}")
                    score += min(len(matched_strengths) * 10, 20)
                
            # Demand level bonus (10 points)
            demand_lower = (c.get("demand_level") or "").lower()
            if demand_lower == "high" and not (interests or has_criteria and not pref_stream):
                if "High-growth" not in str(reasons):
                    reasons.append("High-growth industry demand")
                    score += 5.0
                
            # Salary bonus (8 points)
            if c.get("average_salary_entry") and int(c["average_salary_entry"]) > 600000:
                reasons.append("Lucrative entry-level compensation")
                score += 8.0
                
            # Growth rate bonus (5 points)
            if c.get("growth_rate") and float(c.get("growth_rate", 0)) > 15.0:
                reasons.append("Strong career growth potential")
                score += 5.0
                
            # Cap and round score
            score = min(score, 99.0)
            
            scored_careers.append({
                "career_id": c["id"],
                "match_score": int(score),
                "match_reasons": reasons[:3] if reasons else ["Matches your profile"]
            })
            
        scored_careers.sort(key=lambda x: x["match_score"], reverse=True)
        return scored_careers

    async def predict_college_matches(self, colleges: List[Dict[str, Any]], criteria: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
        """Use the selected LLM to rank and score colleges based on criteria."""
        college_list_str = "\n".join([
            f"- ID: {c['id']}, Name: {c['name']}, NIRF Rank: {c.get('nirf_rank') or 'N/A'}, "
            f"Placement Rate: {c.get('placement_rate') or 'N/A'}%, Avg Package: {c.get('average_package') or 'N/A'} LPA, "
            f"Fee Range: {c.get('fee_range_min') or 0}-{c.get('fee_range_max') or 'N/A'} INR/yr, "
            f"City: {c.get('city') or 'N/A'}, State: {c.get('state') or 'N/A'}, "
            f"Type: {c.get('type') or 'N/A'}, Streams: {c.get('offered_streams') or 'N/A'}, "
            f"Accreditation: {c.get('accreditation') or 'N/A'}"
            for c in colleges[:25]
        ])
        
        prompt = f"""You are DestinAI, an expert AI education counselor for Indian students. Analyze and rank colleges for this student.

## Student Profile:
- Preferred Stream: {criteria.get('preferred_stream') or 'Not specified'}
- Location Preference: {criteria.get('location') or 'Any'}
- Budget Range: {criteria.get('budget_range') or 'Any'}
- Career Interests: {criteria.get('interests') or 'Not specified'}

## Available Colleges (ID, Name, Key Metrics):
{college_list_str}

## Scoring Instructions:
For EACH college in the list, assign a match_score (0-100) based on:
- Stream alignment (30 pts): Does the college offer the student's preferred stream?
- Location fit (25 pts): How well does the location match preference?
- Budget fit (25 pts): Is the fee range within the student's budget?
- Placement quality (15 pts): Placement rate and average package
- NIRF rank bonus (5 pts): Prestige of institution

Return ALL {len(colleges[:25])} colleges scored. Then sort by match_score descending.
For each college, provide 1 specific, personalized match_reason (max 15 words, mentioning city/fees/placement).

Respond ONLY with valid JSON array (no markdown, no extra text):
[
    {{
        "college_id": 1,
        "match_score": 88,
        "match_reasons": ["Offers your preferred stream and budget fits Mumbai location"]
    }}
]"""

        result = await self.generate_with_selected_provider(prompt)
        if isinstance(result, list) and len(result) > 0 and "college_id" in result[0]:
            logger.info(f"LLM college prediction returned {len(result)} results via {self.last_used_model}")
            return result
        elif isinstance(result, dict) and "matches" in result:
            return result["matches"]
        elif isinstance(result, list) and len(result) > 0:
            # Sometimes LLM wraps result differently — try to find the right key
            first = result[0]
            if isinstance(first, dict) and any(k in first for k in ["id", "college_id", "collegeId"]):
                return [{"college_id": r.get("college_id") or r.get("id") or r.get("collegeId"),
                          "match_score": r.get("match_score", 50),
                          "match_reasons": r.get("match_reasons", [])} for r in result]
            
        # Fallback to high-quality rule-based predictions
        logger.warning(f"predict_college_matches LLM call failed (model: {self.last_used_model}). Using rule-based fallback.")
        return self.generate_mock_college_predictions(colleges, criteria)

    async def predict_career_matches(self, careers: List[Dict[str, Any]], criteria: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
        """Use the selected LLM to rank and score careers based on criteria."""
        career_list_str = "\n".join([
            f"- ID: {c['id']}, Title: {c['title']}, Stream: {c.get('stream') or 'N/A'}, "
            f"Category: {c.get('category') or 'N/A'}, Demand: {c.get('demand_level') or 'N/A'}, "
            f"Entry Salary: \u20b9{c.get('average_salary_entry') or 'N/A'}, Growth Rate: {c.get('growth_rate') or 0}% p.a."
            for c in careers[:25]
        ])
        
        prompt = f"""You are DestinAI, an expert AI career counselor. Analyze and score careers for this student based on their specific profile.

## Student Profile:
- Interests: {criteria.get('interests') or 'Not specified'}
- Strengths: {criteria.get('strengths') or 'Not specified'}
- Preferred Stream: {criteria.get('preferred_stream') or 'Not specified'}

## Available Careers (ID, Title, Key Metrics):
{career_list_str}

## Scoring Instructions:
For EACH career in the list, assign a match_score (0-100) based on:
- Interest alignment (35 pts): How closely does it match their stated interests?
- Strength alignment (25 pts): Does it leverage their stated strengths?
- Stream compatibility (20 pts): Is it in their preferred academic stream?
- Growth & salary (20 pts): Job market demand, salary, and growth rate

Return ALL {len(careers[:25])} careers scored. Sort by match_score descending.
For each career, provide 1 specific, personalized match_reason (max 15 words, mentioning their interests/strengths).

Respond ONLY with valid JSON array (no markdown, no extra text):
[
    {{
        "career_id": 1,
        "match_score": 91,
        "match_reasons": ["Directly aligns with your interest in technology and analytical strengths"]
    }}
]"""

        result = await self.generate_with_selected_provider(prompt)
        if isinstance(result, list) and len(result) > 0 and "career_id" in result[0]:
            logger.info(f"LLM career prediction returned {len(result)} results via {self.last_used_model}")
            return result
        elif isinstance(result, dict) and "matches" in result:
            return result["matches"]
        elif isinstance(result, list) and len(result) > 0:
            first = result[0]
            if isinstance(first, dict) and any(k in first for k in ["id", "career_id", "careerId"]):
                return [{"career_id": r.get("career_id") or r.get("id") or r.get("careerId"),
                          "match_score": r.get("match_score", 50),
                          "match_reasons": r.get("match_reasons", [])} for r in result]
            
        # Fallback to high-quality rule-based predictions
        logger.warning(f"predict_career_matches LLM call failed (model: {self.last_used_model}). Using rule-based fallback.")
        return self.generate_mock_career_predictions(careers, criteria)


# Singleton instance
ai_service = AIService()
