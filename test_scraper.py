from services.scraper_service import scrape_website

text = scrape_website("https://www.webandcrafts.com")

print(text[:100])