from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from brain.router import process_message

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/chat")
async def chat(data:dict):

    message=data["message"]

    response=process_message(
        message
    )

    return{
        "response":response
    }