from tools.web_search import search_web
from tools.web_scraper import scrape_webpage
from chains.summarize import summarize_article
from chains.ragchat import create_vector_store, rag_chat
from .models import ResearchReport


def generate_research_report(topic):
    urls = search_web(topic, max_results=5)

    summaries = []
    sources = []

    for url in urls:
        try:
            article = scrape_webpage(url)
            article = article[:4000]

            summary = summarize_article(article)

            summaries.append(summary)
            sources.append(url)

        except Exception as e:
            print(f"Skipping {url}: {e}")

    if not summaries:
        raise Exception(
            "Could not generate research from the available sources."
        )

    report = "\n\n".join(
        [
            f"Article {i + 1}\n{'-' * 50}\n{summary}"
            for i, summary in enumerate(summaries)
        ]
    )

    saved_report = ResearchReport.objects.create(
        topic=topic,
        report=report,
        sources=sources,
    )

    return {
        "id": saved_report.id,
        "topic": saved_report.topic,
        "report": saved_report.report,
        "sources": saved_report.sources,
        "created_at": saved_report.created_at,
    }


def chat_with_research(report_id, question):
    try:
        research = ResearchReport.objects.get(id=report_id)

    except ResearchReport.DoesNotExist:
        raise Exception("Research report not found.")

    vectorstore = create_vector_store(research.report, research.id)

    answer = rag_chat(vectorstore, question)

    return {
        "report_id": research.id,
        "question": question,
        "answer": answer,
    }