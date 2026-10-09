import trafilatura

def scrape_webpage(url):
    downloaded = trafilatura.fetch_url(url)

    if downloaded is None:
        raise Exception(f"Could not download {url}")

    text = trafilatura.extract(
        downloaded,
        include_comments=False,
        include_tables=False
    )

    if not text:
        raise Exception(f"Could not extract article from {url}")

    return text


def scrape_urls(urls):
    articles = []

    for url in urls:
        try:
            articles.append(scrape_webpage(url))
        except Exception as e:
            print(f"Skipping {url}: {e}")

    return "\n\n".join(articles)