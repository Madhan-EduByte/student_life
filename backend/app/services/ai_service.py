"""
DestinAI — AI Service
Integration with Google Gemini, OpenAI, Meta (Llama), Perplexity, Grok, and DeepSeek.
Handles career guide generation, career simulation, college matching, and career ranking.
"""

import json
import logging
from typing import Any, Dict, List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """AI service for career guidance using multiple LLM providers."""

    def __init__(self):
        self.primary_model = settings.AI_PRIMARY_MODEL
        self.fallback_model = settings.AI_FALLBACK_MODEL

    def is_api_configured(self, provider: Optional[str] = None) -> bool:
        """Check if the selected AI provider's API key is configured and valid."""
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

        return bool(key) and "your-key" not in key.lower() and "your-api" not in key.lower() and key.strip() != ""

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
        """Generate response using Google Gemini API."""
        try:
            import google.generativeai as genai

            genai.configure(api_key=settings.GEMINI_API_KEY)
            model_name = settings.AI_MODEL_NAME if settings.AI_MODEL_NAME else "gemini-1.5-flash"
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            return self._parse_json_response(response.text)

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
        """Generates response using the EXACT provider selected in settings.AI_PRIMARY_MODEL."""
        provider = self.primary_model.lower()
        
        if not self.is_api_configured(provider):
            logger.warning(f"AI Provider '{provider}' API Key is not configured. Falling back to mock data.")
            return None

        if provider == "gemini":
            return await self.generate_with_gemini(prompt)
        elif provider == "openai":
            return await self.generate_with_openai_compatible(
                prompt, base_url="", api_key=settings.OPENAI_API_KEY, default_model="gpt-4o"
            )
        elif provider == "meta":
            return await self.generate_with_openai_compatible(
                prompt,
                base_url="https://api.together.xyz/v1",
                api_key=settings.META_API_KEY,
                default_model="meta-llama/Llama-3-8b-chat-hf"
            )
        elif provider == "perplexity":
            return await self.generate_with_openai_compatible(
                prompt,
                base_url="https://api.perplexity.ai",
                api_key=settings.PERPLEXITY_API_KEY,
                default_model="sonar-reasoning"
            )
        elif provider == "grok":
            return await self.generate_with_openai_compatible(
                prompt,
                base_url="https://api.x.ai/v1",
                api_key=settings.GROK_API_KEY,
                default_model="grok-beta"
            )
        elif provider == "deepseek":
            return await self.generate_with_openai_compatible(
                prompt,
                base_url="https://api.deepseek.com/v1",
                api_key=settings.DEEPSEEK_API_KEY,
                default_model="deepseek-chat"
            )
        else:
            logger.error(f"Unknown AI provider configured: {provider}")
            return None

    async def generate_mock_response(self, inputs: Dict[str, str]) -> Dict[str, Any]:
        """Generate a mock response when no API keys are configured."""
        stream = inputs.get("preferred_stream", "science")
        interest = inputs.get("interest_areas", "technology")

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

    async def predict_college_matches(self, colleges: List[Dict[str, Any]], criteria: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
        """Use the selected LLM to rank and score colleges based on criteria."""
        college_list_str = "\n".join([
            f"- ID: {c['id']}, Name: {c['name']}, University: {c.get('university') or 'N/A'}, NIRF Rank: {c.get('nirf_rank') or 'N/A'}, Placement Rate: {c.get('placement_rate') or 'N/A'}%, Average Package: {c.get('average_package') or 'N/A'} LPA, Fees Max: {c.get('fee_range_max') or 'N/A'}, City: {c.get('city') or 'N/A'}, State: {c.get('state') or 'N/A'}, Type: {c.get('type') or 'N/A'}"
            for c in colleges
        ])
        
        prompt = f"""You are DestinAI, an expert AI education counselor. Rank the following colleges based on the student's criteria.

## Student Criteria:
- Preferred Stream: {criteria.get('preferred_stream') or 'N/A'}
- Location Preference: {criteria.get('location') or 'N/A'}
- Budget Range: {criteria.get('budget_range') or 'N/A'}

## Available Colleges:
{college_list_str}

## Instructions:
1. Rank the top 10 matching colleges from the list.
2. For each ranked college, calculate a match_score (0-100) based on NIRF rank, location fit, budget fit, placements, and stream.
3. Provide 2-3 specific match_reasons for why this college is recommended.
4. Respond ONLY with valid JSON in this exact structure (no markdown formatting, no extra text):
[
    {{
        "college_id": 1,
        "match_score": 95,
        "match_reasons": ["Located in your preferred city", "NIRF Rank #10", "Affordable fees within budget"]
    }}
]

Respond ONLY with valid JSON."""

        result = await self.generate_with_selected_provider(prompt)
        if isinstance(result, list):
            return result
        elif isinstance(result, dict) and "matches" in result:
            return result["matches"]
        return None

    async def predict_career_matches(self, careers: List[Dict[str, Any]], criteria: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
        """Use the selected LLM to rank and score careers based on criteria."""
        career_list_str = "\n".join([
            f"- ID: {c['id']}, Title: {c['title']}, Stream: {c.get('stream') or 'N/A'}, Category: {c.get('category') or 'N/A'}, Demand: {c.get('demand_level') or 'N/A'}, Entry Salary: {c.get('average_salary_entry') or 'N/A'}, Growth Rate: {c.get('growth_rate') or 0}%"
            for c in careers
        ])
        
        prompt = f"""You are DestinAI, an expert AI career counselor. Rank the following careers based on the student's interests and profile.

## Student Profile:
- Interests: {criteria.get('interests') or 'N/A'}
- Strengths: {criteria.get('strengths') or 'N/A'}
- Preferred Stream: {criteria.get('preferred_stream') or 'N/A'}

## Available Careers:
{career_list_str}

## Instructions:
1. Rank the top 10 matching careers from the list.
2. For each ranked career, calculate a match_score (0-100) based on how well it fits their interests, strengths, and stream.
3. Provide 2-3 specific match_reasons for why this career is a good fit.
4. Respond ONLY with valid JSON in this exact structure (no markdown formatting, no extra text):
[
    {{
        "career_id": 1,
        "match_score": 95,
        "match_reasons": ["Matches your interest in technology", "Leverages your problem-solving strengths", "High growth rate and demand"]
    }}
]

Respond ONLY with valid JSON."""

        result = await self.generate_with_selected_provider(prompt)
        if isinstance(result, list):
            return result
        elif isinstance(result, dict) and "matches" in result:
            return result["matches"]
        return None


# Singleton instance
ai_service = AIService()
