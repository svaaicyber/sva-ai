import asyncio
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(
    api_key=os.getenv("SAMBANOVA_API_KEY"),
    base_url="https://api.sambanova.ai/v1"
)

SVA_CODING_INSTRUCTION = """
You are SVA (Sigma Visual Assistant) v2 Core.

Provide optimized production-ready code.
Keep responses concise.
Return code in markdown.
"""


async def fetch_sambanova_stream(user_prompt):

    try:

        stream = await client.chat.completions.create(

            # replace if model name differs
            model="DeepSeek-V3.1",

            messages=[

                {
                    "role":"system",
                    "content":SVA_CODING_INSTRUCTION
                },

                {
                    "role":"user",
                    "content":user_prompt
                }

            ],

            stream=True
        )

        async for chunk in stream:

            if (
                chunk.choices
                and
                chunk.choices[0].delta.content
            ):

                print(
                    chunk.choices[0].delta.content,
                    end="",
                    flush=True
                )

    except Exception as e:

        print(
            "\nERROR:",
            e
        )


async def main():

    while True:

        prompt=input("\nYou: ")

        if prompt.lower()=="exit":
            break

        print("\nSVA: ",end="")

        await fetch_sambanova_stream(
            prompt
        )

        print("\n")


asyncio.run(main())