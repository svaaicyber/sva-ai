from brain.modes.chat_mode import chat_mode
from brain.modes.code_mode import code_mode
from brain.modes.research_mode import research_mode
from brain.modes.creative_mode import creative_mode


def process_message(message,mode="Chat"):

    if mode=="Code":
        return code_mode(message)

    elif mode=="Research":
        return research_mode(message)

    elif mode=="Creative":
        return creative_mode(message)

    return chat_mode(message)