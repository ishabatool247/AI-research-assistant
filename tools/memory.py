import json
import os


FILE = "chat_history.json"


def save_chat(messages):

    with open(FILE, "w", encoding="utf-8") as f:

        json.dump(
            messages,
            f,
            indent=4
        )


def load_chat():

    if os.path.exists(FILE):

        with open(FILE, "r", encoding="utf-8") as f:

            return json.load(f)

    return []