import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from urllib.parse import urljoin, urlparse

from models import AgentConfiguration
from crud import save_website_content


def scrape_website(url: str):
    """
    Downloads a webpage and extracts clean visible text.
    """
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/137.0.0.0 Safari/537.36"
            )
        }

        response = requests.get(
            url,
            headers=headers,
            timeout=15
        )

        response.raise_for_status()

        soup = BeautifulSoup(response.text, "lxml")

        # Remove unwanted elements
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()

        text = soup.get_text(separator=" ")

        clean_text = " ".join(text.split())

        return clean_text

    except requests.exceptions.RequestException as e:
        raise Exception(f"Error scraping website: {e}")


def get_internal_links(url: str):
    """
    Returns all internal links found on the homepage.
    """

    try:

        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/137.0.0.0 Safari/537.36"
            )
        }

        response = requests.get(
            url,
            headers=headers,
            timeout=15
        )

        response.raise_for_status()
        print(response.text[:1000])

        soup = BeautifulSoup(
            response.text,
            "lxml"
        )

        domain = urlparse(url).netloc.replace("www.", "")

        links = set()

        all_links = soup.find_all("a", href=True)

        print(f"Total <a> tags found: {len(all_links)}")

        for tag in all_links:
            print(tag["href"])

            href = tag["href"].strip()

            # Ignore empty links
            if not href:
                continue

            # Ignore anchors
            if href.startswith("#"):
                continue

            # Ignore email links
            if href.startswith("mailto:"):
                continue

            # Ignore phone links
            if href.startswith("tel:"):
                continue

            full_url = urljoin(url, href)

            parsed = urlparse(full_url)

            # Keep only same domain
            parsed_domain = parsed.netloc.replace("www.", "")

            if parsed_domain != domain:
                continue    

            clean_url = (
                parsed.scheme
                + "://"
                + parsed.netloc
                + parsed.path
            )

            # Ignore unwanted pages
            ignored_keywords = [
                "privacy",
                "terms",
                "policy",
                "login",
                "register",
                "signup",
                "signin",
                "cart",
                "checkout",
                "search",
                "saved",
                "wishlist",
                "account"
            ]

            # Ignore file types
            ignored_extensions = (
                ".pdf",
                ".jpg",
                ".jpeg",
                ".png",
                ".gif",
                ".svg",
                ".zip",
                ".doc",
                ".docx",
                ".xls",
                ".xlsx",
                ".ppt",
                ".pptx"
            )

            if clean_url.endswith(ignored_extensions):
                continue
            if any(keyword in clean_url.lower() for keyword in ignored_keywords):
                continue

            links.add(clean_url)

        return list(links)

    except Exception as e:
        raise Exception(f"Error fetching links: {e}")


def sync_website(db: Session, admin_id: int):
    """
    Scrapes multiple pages of the configured website
    and stores the combined content.
    """

    config = (
        db.query(AgentConfiguration)
        .filter(
            AgentConfiguration.admin_id == admin_id
        )
        .first()
    )

    if not config:
        raise Exception("Agent configuration not found.")

    if not config.website_url:
        raise Exception("Website URL is empty.")

    # ---------------------------------
    # Get all internal links
    # ---------------------------------

    links = get_internal_links(config.website_url)

    print("\n========== INTERNAL LINKS ==========")

    for link in links:
        print(link)

    print("====================================")

    # ---------------------------------
    # Limit pages
    # ---------------------------------

    links = links[:15]

    combined_content = ""

    print("\n========== SCRAPING PAGES ==========")

    for link in links:

        try:

            print(f"Scraping -> {link}")

            page_content = scrape_website(link)

            combined_content += (
                f"\n\n========== PAGE ==========\n"
                f"{link}\n\n"
                f"{page_content}"
            )

        except Exception as e:

            print(f"Skipped {link}")

            print(e)

    print("====================================")

    # ---------------------------------
    # Save combined content
    # ---------------------------------

    save_website_content(
        db=db,
        admin_id=admin_id,
        website_url=config.website_url,
        content=combined_content
    )

    return {
        "message": "Website synced successfully.",
        "website_url": config.website_url,
        "pages_scraped": len(links),
        "characters": len(combined_content)
    }