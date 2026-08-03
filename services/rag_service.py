import crud
from services.milvus_service import search_chunks


# ------------------------------------
# Query Classification
# ------------------------------------

# Phrases that are clearly conversational (greetings, small talk, identity, etc.)
CONVERSATIONAL_PATTERNS = [
    # Greetings
    "hi", "hello", "hey", "howdy", "hiya", "yo", "sup", "what's up", "whats up",
    # Identity
    "who are you", "what are you", "are you a bot", "are you ai", "are you human",
    "what is your name", "what's your name", "whats your name",
    "what can you do", "what do you do", "how can you help", "how do you work",
    # Farewells
    "bye", "goodbye", "see you", "see ya", "later", "take care", "cya",
    # Thanks
    "thanks", "thank you", "thank you so much", "thanks a lot", "ty", "thx",
    "appreciate it", "appreciated",
    # Acknowledgements / small talk
    "ok", "okay", "sure", "got it", "i see", "understood", "makes sense",
    "good morning", "good afternoon", "good evening", "good night",
    "how are you", "how are you doing", "how do you do",
    "i'm good", "im good", "i am good", "doing well",
    "haha", "lol", "cool", "great", "awesome", "nice", "perfect", "wow",
    "interesting",
]

# Topics/keywords that are clearly off-topic general knowledge (not website queries)
GENERAL_TOPIC_KEYWORDS = [
    # Weather
    "weather", "temperature", "rain", "sunny", "cloudy", "forecast", "humidity",
    "snow", "wind", "storm", "climate",
    # Time / Date
    "time", "what time", "date", "today", "tomorrow", "yesterday", "day",
    "month", "year", "calendar",
    # Meta / bot complaints
    "slow", "taking so long", "taking so much time", "why are you", "so slow",
    "too slow", "late reply", "delayed", "why taking", "response time",
    # Sports / News / Entertainment
    "cricket", "football", "soccer", "sports", "news", "politics", "election",
    "movie", "film", "series", "show", "music", "song", "game",
    # General science / facts
    "capital of", "population of", "who is the president", "who is the pm",
    "prime minister", "president of",
]

# Minimum cosine similarity score to consider a Milvus result "relevant"
RELEVANCE_THRESHOLD = 0.40


def classify_query(question: str) -> str:
    """
    Classify the user's question into one of three categories:

    - "conversational": greetings, small talk, identity, thanks, etc.
      → Answer directly with Gemini. No Milvus. No fallback.

    - "general": off-topic general knowledge questions (weather, time, sports, etc.)
      → Answer directly with Gemini as a helpful AI. No Milvus. No website fallback.

    - "knowledge": questions that likely relate to website content.
      → Use RAG (Milvus search). Apply fallback if no relevant context found.
    """
    normalized = question.lower().strip().rstrip("!?.,'\"")

    # 1. Check conversational patterns (exact / prefix / suffix match)
    for pattern in CONVERSATIONAL_PATTERNS:
        if (normalized == pattern
                or normalized.startswith(pattern + " ")
                or normalized.endswith(" " + pattern)):
            return "conversational"

    # 2. Very short single-word messages are conversational
    if len(normalized.split()) <= 1 and len(normalized) <= 10:
        return "conversational"

    # 3. Check general off-topic keywords
    for keyword in GENERAL_TOPIC_KEYWORDS:
        if keyword in normalized:
            return "general"

    # 4. Default: treat as a website knowledge query
    return "knowledge"


# ------------------------------------
# Conversational Prompt Builder
# ------------------------------------

def build_conversational_prompt(messages, question: str) -> str:
    """
    Build a prompt for direct conversational/small-talk responses.
    Does NOT query Milvus. Gemini responds freely and naturally.
    """
    conversation_history = ""
    for message in messages:
        role = "User" if message.role == "user" else "Assistant"
        conversation_history += f"{role}: {message.content}\n"

    prompt = f"""Previous Conversation:

{conversation_history}

Current User Message:

{question}

Respond naturally and conversationally. You are a helpful AI assistant.
Do not reference or constrain your answer to any website content.
"""
    return prompt


# ------------------------------------
# General Knowledge Prompt Builder
# ------------------------------------

def build_general_prompt(messages, question: str) -> str:
    """
    Build a prompt for off-topic general knowledge questions (weather, time, sports, etc.).
    Does NOT query Milvus. Gemini answers as a general AI assistant.
    """
    conversation_history = ""
    for message in messages:
        role = "User" if message.role == "user" else "Assistant"
        conversation_history += f"{role}: {message.content}\n"

    prompt = f"""Previous Conversation:

{conversation_history}

Current User Question:

{question}

Answer this question helpfully as a general AI assistant.
You are not restricted to any website's content for this answer.
"""
    return prompt


# ------------------------------------
# RAG Prompt Builder (Website Queries)
# ------------------------------------

def build_rag_prompt(
    db,
    admin_id: int,
    messages,
    question: str,
):
    """
    Builds the complete RAG prompt for Gemini using:
    - Conversation history
    - Website context from Milvus (filtered by relevance threshold)

    Returns: (prompt, configuration, context_found: bool)
    """

    # Get agent configuration
    configuration = crud.get_agent_configuration(db, admin_id)

    if configuration is None:
        raise Exception("Agent configuration not found.")

    # Search Milvus
    search_results = search_chunks(
        admin_id=admin_id,
        question=question,
        top_k=3,
    )

    # Filter by relevance threshold
    relevant_results = [
        result for result in search_results
        if result.get("score", 0) >= RELEVANCE_THRESHOLD
    ]

    context_found = len(relevant_results) > 0

    # Build website context
    website_context = "\n\n".join(
        result["chunk"]
        for result in relevant_results
    )

    # Build conversation history
    conversation_history = ""
    for message in messages:
        role = "User" if message.role == "user" else "Assistant"
        conversation_history += f"{role}: {message.content}\n"

    prompt = f"""Previous Conversation:

{conversation_history}

Website Context:

{website_context}

Current User Question:

{question}
"""

    return prompt, configuration, context_found