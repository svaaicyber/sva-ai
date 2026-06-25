from sva_engine import sva_brain

print("--- AstraAI Engine Test ---")
while True:
    q = input("You: ")
    if q.lower() == "exit": break
    print("SVA: ", end="")
    for chunk in sva_brain.generate_stream(q):
        print(chunk, end="", flush=True)
    print("\n")