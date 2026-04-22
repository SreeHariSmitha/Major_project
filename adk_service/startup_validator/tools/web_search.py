"""Web Search Tool - Find real competitors, companies, market data from web."""

import asyncio
from typing import Optional
from duckduckgo_search import DDGS
import httpx
from bs4 import BeautifulSoup
import json


class WebSearchTool:
    """Search web for real company and market data."""

    def __init__(self):
        self.timeout = 10

    async def search_companies(self, query: str, limit: int = 5) -> list[dict]:
        """
        Search for competitor companies.

        Args:
            query: Search query (e.g., "AI startup validation tools")
            limit: Number of results to return

        Returns:
            List of companies with name, url, and snippet
        """
        try:
            ddgs = DDGS()
            results = []

            for r in ddgs.text(query, max_results=limit):
                results.append({
                    "name": r['title'],
                    "url": r['href'],
                    "snippet": r['body'][:200]  # First 200 chars
                })

            return results
        except Exception as e:
            return [{"error": str(e)}]

    async def fetch_company_info(self, url: str) -> dict:
        """
        Scrape company website for real info.

        Args:
            url: Company website URL

        Returns:
            Company info: title, description, headings, text preview
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url)
                soup = BeautifulSoup(resp.text, 'html.parser')

                desc_tag = soup.find('meta', {'name': 'description'})
                description = desc_tag.get('content') if desc_tag else "Unknown"

                return {
                    "url": url,
                    "title": soup.title.string if soup.title else "Unknown",
                    "description": description,
                    "headings": [h.text[:100] for h in soup.find_all(['h1', 'h2'])[:3]],
                    "text_preview": soup.get_text()[:500]
                }
        except Exception as e:
            return {"error": str(e), "url": url}

    async def search_news(self, query: str, limit: int = 5) -> list[dict]:
        """
        Search news for recent updates.

        Args:
            query: News search query (e.g., "startup funding 2026")
            limit: Number of results

        Returns:
            List of news articles
        """
        try:
            ddgs = DDGS()
            results = []

            for r in ddgs.news(query, max_results=limit):
                results.append({
                    "title": r['title'],
                    "source": r['source'],
                    "date": r['date'],
                    "url": r['href']
                })

            return results
        except Exception as e:
            return [{"error": str(e)}]

    async def search_market_size(self, market: str) -> dict:
        """
        Search for market size reports.

        Args:
            market: Market/industry to search (e.g., "AI startup tools market size")

        Returns:
            Market size estimates from web search
        """
        try:
            query = f"{market} market size 2026"
            results = await self.search_companies(query, limit=5)

            return {
                "query": query,
                "results": results,
                "note": "Parse these results to find market size estimates"
            }
        except Exception as e:
            return {"error": str(e)}

    def search_companies_sync(self, query: str, limit: int = 5) -> list[dict]:
        """Synchronous version (for non-async contexts)."""
        ddgs = DDGS()
        results = []

        for r in ddgs.text(query, max_results=limit):
            results.append({
                "name": r['title'],
                "url": r['href'],
                "snippet": r['body'][:200]
            })

        return results


# Global instance
web_search = WebSearchTool()


if __name__ == "__main__":
    # Test the tool
    print("[TEST] Testing Web Search Tool...\n")

    # Test 1: Search for startup validation tools
    print("[TEST 1] Searching for startup validation tools competitors")
    results = web_search.search_companies_sync("startup validation tools competitors", limit=5)
    print(json.dumps(results, indent=2))
    print("\n")

    # Test 2: Search for market size
    print("[TEST 2] Searching for SaaS market size 2026")
    results = web_search.search_companies_sync("SaaS market size 2026", limit=3)
    print(json.dumps(results, indent=2))
    print("\n")

    # Test 3: Search for funding news
    print("[TEST 3] Searching for AI startup funding 2026 news")
    results = web_search.search_companies_sync("AI startup funding 2026", limit=3)
    print(json.dumps(results, indent=2))
    print("\n")

    print("[SUCCESS] Web Search Tool tests complete!")
