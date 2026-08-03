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
You are an AI website assistant.

Answer questions using the provided website context.

If the answer is not available in the website context,
politely tell the user that the information could not be found.

Be clear, concise and helpful.
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
    user_message,
    system_prompt=SYSTEM_PROMPT,
    model_name="gemini-3-flash-preview",
    temperature: float = 0.7,
    max_tokens: int = 1024,
):
    """
    Streams the Gemini response chunk-by-chunk using generate_content_stream.
    Yields text chunks as they arrive — no waiting for the full response.
    Supports temperature and max_tokens from agent configuration.
    """

    contents = user_message

    try:

        logger.info(f"Streaming request → model={model_name}, temp={temperature}, max_tokens={max_tokens}")

        response_stream = client.models.generate_content_stream(
            model=model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
        )

        for chunk in response_stream:
            if chunk.text:
                yield chunk.text

        logger.info("Gemini streaming response completed")

    except Exception as e:

        logger.error(f"Gemini Error: {e}")

        raise RuntimeError(
            f"Gemini Error: {str(e)}"
        )