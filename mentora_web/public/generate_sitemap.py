import datetime

DOMAIN = "https://mentoralearn.ir"
pages = [
    {"path": "/", "priority": "1.0", "changefreq": "daily"},
    {"path": "/aboutus", "priority": "0.8", "changefreq": "monthly"},
    {"path": "/blog", "priority": "0.9", "changefreq": "daily"},
    {"path": "/signin", "priority": "0.6", "changefreq": "monthly"},
    {"path": "/login", "priority": "0.6", "changefreq": "monthly"},
    {"path": "/tutor", "priority": "0.9", "changefreq": "weekly"},
    {"path": "/practice", "priority": "0.8", "changefreq": "weekly"},
    {"path": "/planningassistant", "priority": "0.8", "changefreq": "weekly"},
    {"path": "/focustimer", "priority": "0.7", "changefreq": "monthly"},
    {"path": "/reports", "priority": "0.7", "changefreq": "weekly"},
    {"path": "/subscriptionplans", "priority": "0.6", "changefreq": "monthly"},
]

def generate_sitemap():
    date = datetime.datetime.now().strftime("%Y-%m-%d")
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for page in pages:
        xml += f'  <url>\n    <loc>{DOMAIN}{page["path"]}</loc>\n'
        xml += f'    <lastmod>{date}</lastmod>\n'
        xml += f'    <changefreq>{page["changefreq"]}</changefreq>\n'
        xml += f'    <priority>{page["priority"]}</priority>\n  </url>\n'
    
    xml += '</urlset>'
    
    with open("./sitemap.xml", "w") as f:
        f.write(xml)
    print("✅ Sitemap.xml updated based on App.js routes!")

if __name__ == "__main__":
    generate_sitemap()
