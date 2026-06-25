from ddgs import DDGS


def web_search(query):
    
    try:

        results = []

        with DDGS() as ddgs:

            search_results = ddgs.text(
                query,
                max_results=5
            )

            for r in search_results:

                title = r.get("title", "")
                body = r.get("body", "")

                results.append(
                    f"{title}\n{body}"
                )

        return "\n\n".join(results)

    except Exception as e:

        print("Search Error:", e)

        return "No results found"