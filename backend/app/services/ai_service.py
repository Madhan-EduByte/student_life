"""
DestinAI — AI Service
Integration with Google Gemini (primary) and OpenAI GPT-4 (fallback).
Handles career roadmap generation, career simulation, and college matching.
"""

import json
import logging
from typing import Any, Dict, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """AI service for career guidance using Gemini/OpenAI."""

    def __init__(self):
        self.primary_model = settings.AI_PRIMARY_MODEL
        self.fallback_model = settings.AI_FALLBACK_MODEL

    def _build_career_prompt(self, inputs: Dict[str, str]) -> str:
        """Build a structured prompt for career roadmap generation."""
        return f"""You are DestinAI, an expert AI career counselor. Based on the following inputs from a student, generate a comprehensive, personalized career roadmap.

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
    "title": "Personalized roadmap title",
    "summary": "2-3 sentence summary of the roadmap",
    "recommended_stream": "science|commerce|arts|vocational",
    "confidence_score": 0-100,
    "future_proof_score": 0-100,
    "alternative_careers": ["career1", "career2", "career3"],
    "milestones": [
        {{
            "week_number": 1,
            "title": "Milestone title",
            "description": "Detailed description of what to do",
            "category": "learning|project|networking|skill|exam_prep",
            "priority": "high|medium|low",
            "estimated_hours": 5,
            "resources": ["resource1_url", "resource2_url"]
        }}
    ],
    "college_criteria": {{
        "preferred_courses": ["course1", "course2"],
        "preferred_streams": ["stream1"],
        "budget_range": "value",
        "location": "value"
    }}
}}

Generate exactly 12 milestones (covering 12 weeks / 3 months as an initial roadmap).
Be specific, actionable, and realistic. Consider Indian education system and job market.
Respond ONLY with valid JSON, no markdown formatting."""

    def _build_simulation_prompt(
        self, career_title: str, duration: str = "1_day"
    ) -> str:
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

    async def generate_with_gemini(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Generate response using Google Gemini API."""
        try:
            import google.generativeai as genai

            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)

            # Parse JSON from response
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]

            return json.loads(text.strip())

        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return None

    async def generate_with_openai(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Generate response using OpenAI GPT-4 API."""
        try:
            from openai import OpenAI

            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4",
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
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]

            return json.loads(text.strip())

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return None

    async def generate_mock_response(
        self, inputs: Dict[str, str]
    ) -> Dict[str, Any]:
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
            f"This roadmap will guide you through the next 12 weeks.",
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

    async def generate_roadmap(self, inputs: Dict[str, str]) -> Dict[str, Any]:
        """Generate a career roadmap. Tries primary model, then fallback, then mock."""
        prompt = self._build_career_prompt(inputs)

        # Try primary model
        if self.primary_model == "gemini" and settings.GEMINI_API_KEY:
            result = await self.generate_with_gemini(prompt)
            if result:
                result["_ai_model_used"] = "gemini"
                return result

        if self.primary_model == "openai" and settings.OPENAI_API_KEY:
            result = await self.generate_with_openai(prompt)
            if result:
                result["_ai_model_used"] = "openai"
                return result

        # Try fallback model
        if self.fallback_model == "openai" and settings.OPENAI_API_KEY:
            result = await self.generate_with_openai(prompt)
            if result:
                result["_ai_model_used"] = "openai"
                return result

        if self.fallback_model == "gemini" and settings.GEMINI_API_KEY:
            result = await self.generate_with_gemini(prompt)
            if result:
                result["_ai_model_used"] = "gemini"
                return result

        # Fallback to mock response
        logger.warning("No AI API keys configured. Using mock response.")
        result = await self.generate_mock_response(inputs)
        result["_ai_model_used"] = "mock"
        return result

    async def simulate_career(
        self, career_title: str, duration: str = "1_day"
    ) -> Dict[str, Any]:
        """Simulate a career experience."""
        prompt = self._build_simulation_prompt(career_title, duration)

        # Try primary model
        if settings.GEMINI_API_KEY:
            result = await self.generate_with_gemini(prompt)
            if result:
                result["ai_model_used"] = "gemini"
                result["career_title"] = career_title
                return result

        if settings.OPENAI_API_KEY:
            result = await self.generate_with_openai(prompt)
            if result:
                result["ai_model_used"] = "openai"
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


# Singleton instance
ai_service = AIService()
