
import os

from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


def search_web(query, max_results=5):
    response = client.search(
        query=query,
        search_depth="advanced",
        max_results=max_results,
    )

    urls = []

    for result in response.get("results", []):
        if "url" in result:
            urls.append(result["url"])

    return urls


if __name__ == "__main__":
    urls = search_web("Artificial Intelligence")

    for url in urls:
        print(url)