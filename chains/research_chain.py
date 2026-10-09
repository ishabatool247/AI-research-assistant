from tools.web_search import search_web
from tools.web_scraper import scrape_webpage
from chains.summarize import summarize_article


def research(topic):
    print(f"\nResearching: {topic}\n")

    results = search_web(topic)

    summaries = []
    sources = []

    for i, result in enumerate(results, start=1):

        print(f"Reading article {i}...")

        url = result["url"]

        try:
            article = scrape_webpage(url)

            # Limit article length to reduce token usage
            article = article[:8000]

            summary = summarize_article(article)

            summaries.append(summary)
            sources.append(url)

        except Exception as e:
            print(f"Skipped: {url}")
            print(e)

    report = "\n\n".join(
        [
            f"Article {i+1}\n{'-'*50}\n{summary}"
            for i, summary in enumerate(summaries)
        ]
    )

    report += "\n\nSources\n"
    report += "=" * 40 + "\n"

    for i, url in enumerate(sources, start=1):
        report += f"{i}. {url}\n"

    return report