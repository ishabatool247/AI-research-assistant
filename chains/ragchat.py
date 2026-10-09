from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()


def create_vector_store(report, report_id):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
    )

    chunks = splitter.split_text(report)

    vectorstore = Chroma.from_texts(
        texts=chunks,
        embedding=embeddings,
        collection_name=f"research_report_{report_id}",
        persist_directory="research_db",
    )

    return vectorstore


def rag_chat(vectorstore, question):
    docs = vectorstore.similarity_search(
        question,
        k=4,
    )

    context = "\n\n".join(
        doc.page_content for doc in docs
    )

    llm = ChatGroq(
        model="openai/gpt-oss-20b",
        temperature=0,
    )

    prompt = f"""
You are an AI Research Assistant.

Answer the user's question using ONLY the research
context provided below.

Do not invent information.

If the answer cannot be found in the research,
say:

"I couldn't find that information in the research report."

Research Context:
----------------
{context}
----------------

User Question:
{question}

Give a clear and useful answer.
"""

    response = llm.invoke(prompt)

    return response.content