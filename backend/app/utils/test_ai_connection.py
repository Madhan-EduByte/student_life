"""
DestinAI — AI Connection Test Utility
Tests connectivity to Gemini and OpenAI APIs.
"""

import asyncio
import sys

from app.core.config import settings
from app.services.ai_service import ai_service


async def verify_connection():
    """Test AI API connections."""
    print("=" * 50)
    print("DestinAI — AI Connection Test")
    print("=" * 50)

    # Test Gemini
    print(f"\n🔑 Gemini API Key: {'✅ Set' if settings.GEMINI_API_KEY else '❌ Not set'}")
    if settings.GEMINI_API_KEY:
        print(f"   Key prefix: {settings.GEMINI_API_KEY[:10]}...")
        result = await ai_service.generate_with_gemini("Say hello in JSON format: {\"message\": \"hello\"}")
        if result:
            print(f"   ✅ Gemini connection successful: {result}")
        else:
            print("   ❌ Gemini connection failed")

    # Test OpenAI
    print(f"\n🔑 OpenAI API Key: {'✅ Set' if settings.OPENAI_API_KEY else '❌ Not set'}")
    if settings.OPENAI_API_KEY:
        print(f"   Key prefix: {settings.OPENAI_API_KEY[:10]}...")
        result = await ai_service.generate_with_openai_compatible("Say hello in JSON format: {\"message\": \"hello\"}", base_url="", api_key=settings.OPENAI_API_KEY, default_model="gpt-4o")
        if result:
            print(f"   ✅ OpenAI connection successful: {result}")
        else:
            print("   ❌ OpenAI connection failed")

    if not settings.GEMINI_API_KEY and not settings.OPENAI_API_KEY:
        print("\n⚠️  No AI API keys configured. The app will use mock responses.")
        print("   Set GEMINI_API_KEY or OPENAI_API_KEY in your .env file.")

    print("\n" + "=" * 50)


if __name__ == "__main__":
    asyncio.run(verify_connection())

