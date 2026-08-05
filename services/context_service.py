from typing import List


def build_conversation_context(messages: List) -> str:
    """
    Builds the previous conversation history into a format
    that can be sent to Gemini.

    Example:

    User: Hi
    Assistant: Hello!

    User: What courses are offered?
    Assistant: We offer B.Tech...
    """

    if not messages:
        return ""

    conversation_history = []

    for message in messages:

        role = (
            "User"
            if message.role.lower() == "user"
            else "Assistant"
        )

        conversation_history.append(
            f"{role}: {message.content}"
        )

    return "\n".join(conversation_history)