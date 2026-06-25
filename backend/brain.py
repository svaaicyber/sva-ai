import os

from groq import Groq
from google.genai import Client
from dotenv import load_dotenv

load_dotenv()


class SVABrain:

    def __init__(self):

        self.groq = Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )

        self.gemini = Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

        self.history = []

    def route(self, query):

        if len(query) < 120:
            return "groq"

        return "gemini"

    def generate_stream(self, query):

        self.history.append({
            "role": "user",
            "content": query
        })

        engine = self.route(query)

        # GROQ
        if engine == "groq":

            try:

                stream = self.groq.chat.completions.create(
                    messages=self.history,
                    model="llama-3.3-70b-versatile",
                    stream=True
                )

                full_response = ""

                for chunk in stream:

                    if chunk.choices[0].delta.content:

                        text = chunk.choices[0].delta.content

                        full_response += text

                        yield text

                self.history.append({
                    "role": "assistant",
                    "content": full_response
                })

                return

            except Exception as e:

                yield f"Groq Error: {str(e)}"
                return

        # GEMINI
        try:

            responses = self.gemini.models.generate_content_stream(
                model="gemini-2.0-flash",
                contents=query
            )

            full_response = ""

            for response in responses:

                if response.text:

                    text = response.text

                    full_response += text

                    yield text

            self.history.append({
                "role": "assistant",
                "content": full_response
            })

        except Exception as e:

            yield f"Gemini Error: {str(e)}"


brain = SVABrain()