from fastapi import FastAPI

from routers.chat import router as chat_router

from routers.auth import router as auth_router
from routers import agent

app = FastAPI(
    title="StreamFlix AI Chatbot",
    version="1.0.0"
)

# Routers
app.include_router(chat_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to StreamFlix AI Chatbot API"
    }

app.include_router(auth_router)
app.include_router(agent.router)