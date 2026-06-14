import asyncio
import os
from google import genai
import time
from dotenv import load_dotenv

async def main():
    print("Testing direct async generation...")
    # Load .env file
    load_dotenv()
    
    # Get API key from LLL_PROVIDER environment variable
    lll_provider = os.getenv("LLL_PROVIDER", "")
    api_key = None
    if lll_provider.startswith("GEMINI:"):
        api_key = lll_provider.split(":", 1)[1]
        
    if not api_key:
        print("Error: LLL_PROVIDER not set or doesn't start with GEMINI:")
        return

    client = genai.Client(api_key=api_key)
    start = time.time()
    try:
        resp = await client.aio.models.generate_content(
            model="gemini-flash-lite-latest",
            contents="Predict 3 careers for high risk profile in JSON format: [{\"career\": \"name\", \"reason\": \"why\"}]"
        )
        print("Success in:", time.time() - start)
        print("Response text:", resp.text)
    except Exception as e:
        print("Failed in:", time.time() - start)
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
