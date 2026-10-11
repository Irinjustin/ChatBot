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
    """
    Convert a list of Message ORM objects into a list of
    types.Content objects suitable for the Gemini API.
    """

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
    tools=None,
    tool_executor=None,
):
    """
    Generates a Gemini response, yielding text chunks for streaming.

    Supports two modes controlled by the `tools` parameter:

    ── RAG DISABLED (tools=None) ─────────────────────────────────────
      Direct streaming via generate_content_stream().
      Gemini answers entirely from its own knowledge + system prompt.

    ── RAG ENABLED (tools=[...], tool_executor={...}) ────────────────
      Turn 1  — generate_content() non-streaming.
                Gemini decides whether to call search_knowledge or
                answer directly.

      If Gemini calls search_knowledge:
        · Backend executes Milvus search via tool_executor.
        · Function response is appended as types.Part.from_function_response().
        · Turn 2 — generate_content_stream() with the enriched context.

      If Gemini answers directly (no function call):
        · Turn 1 text is yielded immediately (no second API call).

    Parameters
    ----------
    user_message : list[types.Content] | str
        Conversation history + current user turn as types.Content objects.
        Plain strings are also accepted for backward compatibility.
    system_prompt : str
        System instruction passed to Gemini.
    model_name : str
        Gemini model identifier.
    temperature : float
        Sampling temperature (0.0 – 2.0).
    max_tokens : int
        Maximum output tokens.
    tools : list[types.Tool] | None
        Registered tools. Pass None when rag_enabled is False.
    tool_executor : dict[str, callable] | None
        Maps function names to their Python implementations.
        Required when tools is not None.

    Yields
    ------
    str
        Text chunks as they are generated.
    """

    config_kwargs = dict(
        system_instruction=system_prompt,
        temperature=temperature,
        max_output_tokens=max_tokens,
    )

    try:

        if tools:

            # ──────────────────────────────────────────────────────
            # Turn 1: non-streaming — detect whether Gemini wants
            # to call a function or answer directly.
            # ──────────────────────────────────────────────────────

            logger.info(
                f"Turn 1 (function calling) → model={model_name}, "
                f"temp={temperature}, max_tokens={max_tokens}"
            )

            response = client.models.generate_content(
                model=model_name,
                contents=user_message,
                config=types.GenerateContentConfig(
                    **config_kwargs,
                    tools=tools,
                )
            )

            # Inspect the first candidate for a function_call part
            function_call = None
            candidate = (
                response.candidates[0]
                if response.candidates
                else None
            )

            if candidate and candidate.content and candidate.content.parts:
                for part in candidate.content.parts:
                    if part.function_call:
                        function_call = part.function_call
                        break

            if (
                function_call
                and tool_executor
                and function_call.name in tool_executor
            ):

                # ──────────────────────────────────────────────
                # Function call detected — execute it
                # ──────────────────────────────────────────────

                fn_name = function_call.name
                fn_args = dict(function_call.args)

                logger.info(
                    f"Gemini called function: {fn_name}({fn_args})"
                )

                fn = tool_executor[fn_name]
                fn_result = fn(**fn_args)

                logger.info(
                    f"Function '{fn_name}' executed. "
                    f"Result length: {len(fn_result) if fn_result else 0} chars"
                )

                # Build Turn 2 contents:
                #   [original history]
                #   + [model turn containing the function_call part]
                #   + [function response turn]
                updated_contents = list(user_message)
                updated_contents.append(candidate.content)
                # Build the function response Part, passing back the
                # call id so the API can correlate request ↔ response.
                # from_function_response() does not expose an id param,
                # so we construct FunctionResponse directly.
                updated_contents.append(
                    types.Content(
                        role="user",
                        parts=[
                            types.Part(
                                function_response=types.FunctionResponse(
                                    id=function_call.id,
                                    name=fn_name,
                                    response={
                                        "result": fn_result or "No relevant information found."
                                    },
                                )
                            )
                        ],
                    )
                )

                # ──────────────────────────────────────────────
                # Turn 2: streaming — final answer with context
                # ──────────────────────────────────────────────

                logger.info(
                    "Turn 2 → streaming final answer with function result"
                )

                # Turn 2 intentionally omits tools — Gemini must
                # synthesise a text answer from the retrieved context.
                # Keeping tools here would allow Gemini to issue a
                # second search_knowledge call, which our single-round
                # loop cannot handle and would produce a silent empty
                # response.
                response_stream = client.models.generate_content_stream(
                    model=model_name,
                    contents=updated_contents,
                    config=types.GenerateContentConfig(**config_kwargs),
                )

                for chunk in response_stream:
                    if chunk.text:
                        yield chunk.text

            else:

                # ──────────────────────────────────────────────
                # No function call — yield Turn 1 text directly
                # (avoids a second API call)
                # ──────────────────────────────────────────────

                logger.info(
                    "Gemini decided to answer directly (no function call)"
                )

                if response.text:
                    yield response.text

        else:

            # ──────────────────────────────────────────────────────
            # No tools — direct streaming (RAG disabled path)
            # ──────────────────────────────────────────────────────

            logger.info(
                f"Streaming (no tools) → model={model_name}, "
                f"temp={temperature}, max_tokens={max_tokens}"
            )

            response_stream = client.models.generate_content_stream(
                model=model_name,
                contents=user_message,
                config=types.GenerateContentConfig(**config_kwargs)
            )

            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text

        logger.info("Gemini response completed")

    except Exception as e:

        logger.error(f"Gemini Error: {e}")

        raise RuntimeError(
            f"Gemini Error: {str(e)}"
        )