from openai import OpenAI
from dotenv import load_dotenv
from brain.prompts import SYSTEM_PROMPT
import os

load_dotenv()

client = OpenAI(
    api_key=os.getenv("SAMBANOVA_API_KEY"),
    base_url="https://api.sambanova.ai/v1"
)


def samba_chat(message, mode="Chat"):

    try:

        model = "gpt-oss-120b"

        if mode == "Code":
            model = "DeepSeek-V3.1"

        response = client.chat.completions.create(

            model=model,

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

        return response.choices[0].message.content

    except Exception as e:

        print("Samba Error:", e)

        return (
            "SVA cloud backup is unavailable ⚠"
        )