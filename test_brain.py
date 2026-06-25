from transformers import pipeline

# SVA ka sabse chota aur tez brain load kar rahe hain
print("🧠 SVA: Brain loading...")
pipe = pipeline("text-generation", model="HuggingFaceTB/SmolLM-135M-Instruct")

response = pipe("Hi SVA, who are you?", max_new_tokens=50)
print(response[0]['generated_text'])