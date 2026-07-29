from fastapi import FastAPI

from database import Base, engine
from routers.chat import router as chat_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StreamFlix AI Chatbot"
)

app.include_router(chat_router)