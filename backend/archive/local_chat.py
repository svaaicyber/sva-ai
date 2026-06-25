import ollama

with open(
"brain/personality.txt",
"r",
encoding="utf-8"
) as f:

    SYSTEM_PROMPT=f.read()


def ollama_chat(message):

    response=ollama.chat(

    model="qwen2.5",

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

    return response["message"]["content"]