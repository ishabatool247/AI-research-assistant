import os
import streamlit as st
from dotenv import load_dotenv

from chains.rag import create_vector_store
from chains.ragchat import rag_chat
from tools.web_search import search_web
from tools.web_scraper import scrape_urls
from chains.summarize import summarize_article
from tools.report_writer import save_markdown
from tools.pdf_generator import save_pdf
from tools.memory import save_chat, load_chat
from tools.voice import listen_voice
from tools.tts import speak


load_dotenv()


# ---------------- PAGE CONFIG ----------------

st.set_page_config(
    page_title="AI Research Assistant",
    page_icon="🤖",
    layout="wide"
)


# ---------------- CSS ----------------

st.markdown("""
<style>

.main {
    background-color:#0e1117;
}

h1 {
    color:#00c2ff;
}

.chat-user {
    background:#1f2937;
    padding:15px;
    border-radius:15px;
    margin:10px 0;
}

.chat-ai {
    background:#111827;
    padding:15px;
    border-radius:15px;
    margin:10px 0;
}

.sidebar-title {
    font-size:22px;
    font-weight:bold;
    color:#00c2ff;
}

.card {
    background:#161b22;
    padding:20px;
    border-radius:15px;
    border:1px solid #30363d;
}

</style>
""", unsafe_allow_html=True)



# ---------------- SESSION ----------------

if "messages" not in st.session_state:

    st.session_state.messages = load_chat()


if "db" not in st.session_state:

    st.session_state.db = None


if "report" not in st.session_state:

    st.session_state.report = None



# ---------------- SIDEBAR ----------------

with st.sidebar:


    st.markdown(
        '<div class="sidebar-title">🤖 AI Assistant</div>',
        unsafe_allow_html=True
    )


    st.divider()


    mode = st.selectbox(
        "Choose Mode",
        [
            "📚 Research Report",
            "💬 Chat With Document"
        ]
    )


    st.divider()


    uploaded = st.file_uploader(
        "Upload PDF",
        type=["pdf"]
    )


    st.divider()


    if st.button("🗑 Clear Chat"):

        st.session_state.messages = []

        save_chat([])

        st.rerun()



# ---------------- HEADER ----------------

st.title(
    "🤖 AI Research & Support Assistant"
)


st.caption(
    "Powered by LangChain • RAG • OpenAI • ChromaDB"
)



# ---------------- CARDS ----------------

col1, col2, col3 = st.columns(3)


with col1:

    st.markdown(
    """
    <div class="card">
    📄 <b>Document AI</b><br>
    Upload and ask questions
    </div>
    """,
    unsafe_allow_html=True
    )


with col2:

    st.markdown(
    """
    <div class="card">
    🔎 <b>Web Research</b><br>
    Search and summarize
    </div>
    """,
    unsafe_allow_html=True
    )


with col3:

    st.markdown(
    """
    <div class="card">
    🧠 <b>Memory</b><br>
    Context aware answers
    </div>
    """,
    unsafe_allow_html=True
    )



# ---------------- PDF ----------------

if uploaded:


    with open(
        "uploaded.pdf",
        "wb"
    ) as f:

        f.write(
            uploaded.read()
        )


    if st.button(
        "Create Knowledge Base"
    ):


        with st.spinner(
            "Creating AI memory..."
        ):


            st.session_state.db = create_vector_store(
                "uploaded.pdf"
            )


        st.success(
            "Knowledge base created ✅"
        )
        # ---------------- CHAT UI ----------------

st.subheader(
    "💬 Conversation"
)


# Display messages

for msg in st.session_state.messages:


    if msg["role"] == "user":


        st.markdown(
        f"""
        <div class="chat-user">
        👤 <b>You:</b><br>
        {msg["content"]}
        </div>
        """,
        unsafe_allow_html=True
        )


    else:


        st.markdown(
        f"""
        <div class="chat-ai">
        🤖 <b>AI:</b><br>
        {msg["content"]}
        </div>
        """,
        unsafe_allow_html=True
        )


        if msg.get("sources"):


            with st.expander("📚 Sources"):


                for source in msg["sources"]:

                    st.write(
                        "📄 " + str(source)
                    )



# ---------------- VOICE + TEXT INPUT ----------------


col1, col2 = st.columns(
    [1,4]
)


with col1:


    voice_button = st.button(
        "🎤 Speak"
    )



with col2:


    question = st.chat_input(
        "Ask something..."
    )



# Voice recording

if voice_button:


    with st.spinner(
        "Listening..."
    ):


        question = listen_voice()



    if question:


        st.success(
            f"You said: {question}"
        )



# ---------------- PROCESS QUESTION ----------------


if question:


    st.session_state.messages.append(
        {
            "role":"user",
            "content":question
        }
    )



    with st.spinner(
        "Thinking..."
    ):



        # DOCUMENT RAG MODE

        if mode == "💬 Chat With Document":



            if st.session_state.db:



                answer, sources = rag_chat(
                    question,
                    st.session_state.db
                )


            else:


                answer = (
                    "Please upload PDF and create knowledge base first."
                )


                sources = []



        # WEB RESEARCH MODE

        else:



            urls = search_web(
                question
            )


            if urls:


                content = scrape_urls(
                    urls
                )


                answer = summarize_article(
                    content
                )


                sources = urls


            else:


                answer = (
                    "No information found."
                )


                sources = []




    # Save AI answer
# Save AI answer

st.session_state.messages.append(
    {
        "role":"assistant",
        "content":answer,
        "sources":sources
    }
)


# 🔊 AI voice response

speak(answer)


# Save conversation memory

save_chat(
    st.session_state.messages
)



# ---------------- REPORT HISTORY ----------------

st.subheader(
    "📚 Report History"
)


if os.path.exists("reports"):


    for file in os.listdir("reports"):


        st.write(
            "📄 " + file
        )



# ---------------- EXPORT ----------------


if st.session_state.report:


    st.subheader(
        "📥 Export Report"
    )


    col1, col2 = st.columns(2)



    with col1:


        if st.button(
            "📝 Save Markdown"
        ):


            path = save_markdown(
                st.session_state.report
            )


            st.success(
                f"Saved: {path}"
            )



    with col2:


        if st.button(
            "📄 Save PDF"
        ):


            save_pdf(
                st.session_state.report
            )


            st.success(
                "PDF saved successfully ✅"
            )