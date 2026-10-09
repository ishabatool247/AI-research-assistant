from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

llm = ChatOpenAI(
    model="gpt-5-nano",
    temperature=0
)

prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are an AI research assistant.

Answer questions ONLY using the provided research report.

If the answer is not in the report, say:
"I couldn't find that information in the report."
"""
    ),
    (
        "human",
        """
Research Report:

{report}

Question:

{question}
"""
    )
])

chain = prompt | llm


def chat_with_report(report, question):
    response = chain.invoke({
        "report": report,
        "question": question
    })

    return response.content