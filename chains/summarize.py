from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0
)

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert research assistant. Summarize the article clearly in 200-300 words."
        ),
        (
            "human",
            "{article}"
        )
    ]
)

chain = prompt | llm


def summarize_article(article):
    response = chain.invoke({
        "article": article
    })

    return response.content