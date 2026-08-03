from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.chat import router as chat_router
from routers.auth import router as auth_router
from routers import agent, widget

app = FastAPI(
    title="AI Chatbot",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(chat_router)
app.include_router(auth_router)
app.include_router(agent.router)
app.include_router(widget.router)



@app.get("/")
def root():
    return {
        "message": "Welcome to AI Chatbot API"
    }