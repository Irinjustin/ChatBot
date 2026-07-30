import os
from dotenv import load_dotenv
from logger import logger

from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

SYSTEM_PROMPT = """
You are StreamFlix AI Assistant.

Your job is to help users with:

- Movie recommendations
- TV shows
- Genres
- Actors
- StreamFlix related questions

Be friendly.

Keep answers short.

If the user asks something unrelated to movies or StreamFlix,
politely answer but remind them that you specialize in StreamFlix.
"""


def build_contents(messages):

    contents = []

    for message in messages:

        contents.append(
            types.Content(
                role=message.role,
                parts=[
                    types.Part(
                        text=message.content
                    )
                ]
            )
        )

    return contents


def generate_response(
    messages,
    user_message,
    system_prompt=SYSTEM_PROMPT,
    model_name="gemini-flash-latest"
):

    contents = user_message

    try:
        logger.info("Sending request to Gemini")
        logger.info(f"Using model: {model_name}")
        logger.info(f"Contents: {contents}")
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt
            )
        )

        yield response.text

        logger.info("Gemini response generated successfully")

    except Exception as e:
        logger.error(f"Gemini Error: {e}")
        raise RuntimeError(f"Gemini Error: {str(e)}")