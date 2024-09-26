import os
import json
import subprocess
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from newscrawler.spiders.rbc import RbcSpider
import scrapy

def run_spider():
    process = CrawlerProcess(get_project_settings())
    scraped_data = []

    def crawler_results(item, response, spider):
        scraped_data.append(dict(item))

    process.crawl(RbcSpider)
    for spider in process.crawlers:
        spider.signals.connect(crawler_results, signal=scrapy.signals.item_scraped)

    process.start()
    return scraped_data

if __name__ == '__main__':
    data = run_spider()
    output_path = '/tmp/output.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)
    print(f"Сохраненные данные: {output_path}")