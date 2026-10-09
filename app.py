import os
import streamlit as st

from tools.web_search import search_web
from tools.web_scraper import scrape_urls
from chains.summarize import summarize_article

from tools.pdf_generator import save_pdf
from tools.report_writer import save_markdown

from tools.memory import save_chat, load_chat
from tools.voice import listen_voice
from tools.tts import speak

from chains.rag import create_vector_store, rag_chat


# ---------------- PAGE CONFIG ----------------

st.set_page_config(
    page_title="AI Research Assistant",
    page_icon="🤖",
    layout="wide"
)


# ---------------- SESSION MEMORY ----------------

if "messages" not in st.session_state:
    st.session_state.messages = load_chat()

if "report" not in st.session_state:
    st.session_state.report = ""

if "db" not in st.session_state:
    st.session_state.db = None

if "sources" not in st.session_state:
    st.session_state.sources = []



# ---------------- SIDEBAR ----------------

with st.sidebar:

    st.header("🤖 AI Research Assistant")

    st.write("""
    Features:

    ✅ Web Research  
    ✅ AI Summary  
    ✅ RAG Chat  
    ✅ PDF Report  
    ✅ Markdown Export  
    ✅ Voice Assistant  
    ✅ Chat Memory
    """)


    st.divider()


    if st.session_state.db:

        st.success(
            "🟢 Knowledge Base Ready"
        )

    else:

        st.warning(
            "🟡 Generate report first"
        )


    if st.button("🗑 Clear Chat"):

        st.session_state.messages = []

        save_chat([])

        st.success(
            "Chat cleared"
        )

        st.rerun()



# ---------------- HEADER ----------------

st.title(
    "🤖 AI Research Assistant"
)


st.caption(
    "Web Search • AI Summary • RAG Chat • Voice Assistant"
)



# ---------------- RESEARCH ----------------

topic = st.text_input(
    "🔍 Enter Research Topic",
    placeholder="Example: Artificial Intelligence trends 2026"
)



if st.button("🚀 Generate Report"):


    if not topic:

        st.warning(
            "Please enter a research topic"
        )

        st.stop()


    try:

        with st.spinner("🔎 Searching web sources..."):

            results = search_web(topic)



        with st.spinner("📄 Reading articles..."):

            content = scrape_urls(results)



        with st.spinner("🧠 Creating AI report..."):

            report = summarize_article(content)



        st.session_state.report = report

        st.session_state.sources = results



        with st.spinner("📚 Building knowledge database..."):

            st.session_state.db = create_vector_store(
                report
            )



        save_markdown(report)

        save_pdf(report)



        st.success(
            "✅ Report Generated Successfully!"
        )


    except Exception as e:

        st.error(
            f"Error: {e}"
        )




# ---------------- REPORT ----------------


if st.session_state.report:


    st.divider()


    st.subheader(
        "📚 Research Report"
    )


    st.markdown(
        st.session_state.report
    )


    words = len(
        st.session_state.report.split()
    )


    st.info(
        f"📊 Report Size: {words} words"
    )



    st.subheader(
        "⬇️ Download Report"
    )


    col1, col2 = st.columns(2)



    pdf_path = "reports/report.pdf"

    md_path = "reports/report.md"



    if os.path.exists(pdf_path):

        with open(pdf_path,"rb") as file:

            col1.download_button(

                "📄 Download PDF",

                file,

                file_name="AI_Research_Report.pdf",

                mime="application/pdf"

            )



    if os.path.exists(md_path):

        with open(md_path,"rb") as file:

            col2.download_button(

                "📝 Download Markdown",

                file,

                file_name="AI_Research_Report.md",

                mime="text/markdown"

            )



    st.subheader(
        "🌐 Research Sources"
    )


    for url in st.session_state.sources:

        st.markdown(
            f"- {url}"
        )




# ---------------- TEXT CHAT ----------------


st.divider()


st.subheader(
    "💬 Ask AI About Research"
)


question = st.text_input(
    "Ask your question"
)



if st.button("Send"):


    if not question:

        st.warning(
            "Enter a question"
        )


    elif st.session_state.db is None:

        st.warning(
            "Generate report first"
        )


    else:


        with st.spinner("🤖 Thinking..."):


            answer = rag_chat(

                st.session_state.db,

                question

            )



        st.session_state.messages.append(

            {
                "role":"user",
                "content":question
            }

        )



        if answer:

            st.session_state.messages.append(

                {
                    "role":"assistant",
                    "content":answer
                }

            )


        save_chat(
            st.session_state.messages
        )


        speak(answer)




# ---------------- CHAT HISTORY ----------------


st.divider()


st.subheader(
    "📝 Chat History"
)



for msg in st.session_state.messages:


    with st.chat_message(
        msg["role"]
    ):

        st.write(
            msg["content"]
        )




# ---------------- VOICE CHAT ----------------


st.divider()


st.subheader(
    "🎤 Voice Question"
)



if st.button("🎙 Speak Question"):


    with st.spinner("🎤 Listening..."):

        voice_text = listen_voice()



    if not voice_text:

        st.warning(
            "No voice detected"
        )

        st.stop()



    st.write(
        "You:",
        voice_text
    )



    if st.session_state.db is None:


        st.warning(
            "Generate report first"
        )


    else:


        with st.spinner("🤖 Thinking..."):


            answer = rag_chat(

                st.session_state.db,

                voice_text

            )


        st.success(
            answer
        )



        st.session_state.messages.append(

            {
                "role":"user",
                "content":voice_text
            }

        )



        if answer:

            st.session_state.messages.append(

                {
                    "role":"assistant",
                    "content":answer
                }

            )



        save_chat(
            st.session_state.messages
        )


        speak(answer)




# ---------------- FOOTER ----------------


st.divider()


st.caption(
    "🤖 AI Research Assistant | Built with Streamlit + LangChain + RAG"
)
