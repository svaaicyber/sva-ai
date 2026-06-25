# backend/services/groq_service.py
import os
from groq import Groq
import asyncio

# Fallback token if .env isn't parsed correctly during runtime setup
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "YOUR_FALLBACK_KEY_HERE")
client = Groq(api_key=GROQ_API_KEY)

async def fetch_groq_stream(prompt: str):
    # Running blocking synchronous SDK calls inside an execution thread pool
    loop = asyncio.get_event_loop()
    
    def get_stream():
        return client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            stream=True
        )
        
    completion = await loop.run_in_executor(None, get_stream)
    
    for chunk in completion:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content