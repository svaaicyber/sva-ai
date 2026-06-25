import os
import urllib.parse
import random
from groq import Groq
from google.genai import Client


class SVACore:
    def __init__(self):
        self.groq = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.gemini = Client(api_key=os.getenv("GEMINI_API_KEY"))

    def route(self, query):
        q = query.lower()

        if any(k in q for k in ["image", "draw", "generate", "picture"]):
            return "image"

        if len(query) < 120:
            return "groq"

        return "gemini"

    # 🎨 IMAGE (WITH FALLBACK)
    def generate_image(self, prompt):
        encoded = urllib.parse.quote(prompt)
        poll_url = f"https://image.pollinations.ai/prompt/{encoded}"

        # fallback random image
        fallback = f"https://picsum.photos/seed/{random.randint(1,9999)}/600/400"

        return poll_url, fallback

    def generate_stream(self, query):

        engine = self.route(query)

        # 🎨 IMAGE MODE
        if engine == "image":
            poll, fallback = self.generate_image(query)

            yield f"__IMAGE__:{poll}|{fallback}"
            return

        # ⚡ GROQ
        if engine == "groq":
            try:
                stream = self.groq.chat.completions.create(
                    messages=[{"role": "user", "content": query}],
                    model="llama-3.3-70b-versatile",
                    stream=True,
                )

                for c in stream:
                    if c.choices[0].delta.content:
                        yield c.choices[0].delta.content
                return
            except:
                yield "⚠️ Groq failed → Gemini"

        # 🧠 GEMINI
        try:
            res = self.gemini.models.generate_content_stream(
                model="gemini-2.0-flash-exp",
                contents=query
            )

            for r in res:
                if r.text:
                    yield r.text

        except Exception as e:
            yield f"Error: {str(e)}"


sva_brain = SVACore()