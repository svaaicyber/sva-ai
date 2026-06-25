# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import json

# EXACT IMPORT: Router se route_query function mangwa rahe hain
from brain.router import route_query 

app = FastAPI(title="SVA OMNI Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryPayload(BaseModel):
    message: str

@app.post("/api/chat/stream")
async def stream_chat(payload: QueryPayload):
    async def event_generator():
        try:
            # DIRECT ROUTING: User ka message yahan se router ko jayega
            async for chunk in route_query(payload.message):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                await asyncio.sleep(0.005) # Prevent socket flooding
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)