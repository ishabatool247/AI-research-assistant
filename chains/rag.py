from dotenv import load_dotenv

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate

from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter


load_dotenv()


llm = ChatOpenAI(
    model="gpt-4.1-mini",
    temperature=0
)


prompt = ChatPromptTemplate.from_template("""
You are an AI research assistant.

Answer the question using ONLY the retrieved context.

If the answer is not found in the context, reply:
"I couldn't find that information in the report."

Context:
{context}

Question:
{question}
""")


chain = prompt | llm



def create_vector_store(report):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.create_documents(
        [report]
    )


    embeddings = OpenAIEmbeddings()


    db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="research_db"
    )


    return db



def rag_chat(db, question):

    # check database object
    if isinstance(db, str):
        raise TypeError(
            "RAG database is a string. Pass Chroma vector store object instead."
        )


    docs = db.similarity_search(
        question,
        k=3
    )


    context = "\n\n".join(
        doc.page_content
        for doc in docs
    )


    response = chain.invoke(
        {
            "context": context,
            "question": question
        }
    )


    return response.content