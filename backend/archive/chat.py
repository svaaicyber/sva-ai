from openai import OpenAI
from dotenv import load_dotenv
from brain.prompts import SYSTEM_PROMPT
from brain.formatter import clean_response
import os

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


def groq_chat(message):

    try:

        response = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[

                {
                    "role":"system",
                    "content":SYSTEM_PROMPT
                },

                {
                    "role":"user",
                    "content":message
                }

            ]

        )

        answer = response.choices[0].message.content

        return clean_response(
            answer
        )

    except Exception as e:

        print(
            "Groq Error:",
            e
        )

        return "SVA temporarily unavailable."