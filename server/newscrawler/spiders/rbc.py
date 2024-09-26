import scrapy


class RbcSpider(scrapy.Spider):
    categories = []
    name = "rbc"
    allowed_domains = ["rbc.ru"]
    url = "https://rbc.ru"

    def start_requests(self):
        yield scrapy.Request(url=self.url, callback=self.parse)

    def parse(self, response):
        news_items = response.css('div.main__feed.js-main-reload-item')
        for item in news_items:
            link = item.css('a::attr(href)').get()
            yield scrapy.Request(response.urljoin(link), callback=self.parse_article, meta={}, dont_filter=True)

    def parse_article(self, response):
        category = response.css('a.article__header__category::attr(content)').get()
        if response.url.startswith("https://pro."):
            category = "Финансы"
        title = response.css('h1.article__header__title-in::text').get().strip() if response.css('h1.article__header__title-in::text').get() else None
        if category:
            self.categories.append(dict(category=category, title=title))
        else:
            category = response.css('a.article__header__category::text').get()
        yield {
            'category': category,
            'title': title,
            'url': response.url
        }

    def closed(self, reason):
        pass
