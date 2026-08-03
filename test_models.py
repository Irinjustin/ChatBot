import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("API Key:", api_key)
print("Starts with AIza:", api_key.startswith("AIza") if api_key else False)
print("Length:", len(api_key) if api_key else None)