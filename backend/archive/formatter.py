def clean_response(text):

    text=text.strip()

    while "\n\n\n" in text:
        text=text.replace(
            "\n\n\n",
            "\n\n"
        )

    return text