/**
 * SmartPioneer News Fetcher
 * Fetch news from official Pi Network sources using Firecrawl API
 * Sources: minepi.com, Stanford Engineering, KYB Pi, Pi Network Venture
 */

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-8b1454bf7cb644a5becc8a80a7b9c9ca';
const OUTPUT_FILE = 'src/data/news.json';

const SOURCES = [
  { name: 'minepi', url: 'https://minepi.com', priority: 1 },
  { name: 'stanford', url: 'https://engineering.stanford.edu/spotlight/pi-network', priority: 2 },
  { name: 'kyb-pi', url: 'https://kyb.pi', priority: 2 },
  { name: 'pi-network-venture', url: 'https://pinetworkventure.com', priority: 3 }
];

async function fetchPage(url) {
  const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
    },
    body: JSON.stringify({
      url: url,
      pageOptions: {
        onlyMainContent: true
      }
    })
  });

  if (!response.ok) {
    console.error(`Failed to fetch ${url}: ${response.status}`);
    return null;
  }

  return response.json();
}

async function extractNews(articles) {
  const news = [];
  
  for (const article of articles) {
    if (article.url && article.title) {
      news.push({
        title: article.title,
        description: article.description || article.excerpt || '',
        url: article.url,
        source: article.source || 'Pi Network',
        date: article.date || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });
    }
  }

  return news;
}

async function fetchNews() {
  console.log('🚀 Starting SmartPioneer news fetch...\n');
  
  const allNews = [];
  
  for (const source of SOURCES) {
    console.log(`📡 Fetching from ${source.name} (${source.url})...`);
    
    try {
      const data = await fetchPage(source.url);
      
      if (data && data.data) {
        const news = extractNews(data.data.articles || [data.data]);
        allNews.push(...news);
        console.log(`   ✓ Found ${news.length} articles\n`);
      } else {
        console.log(`   ⚠ No articles found\n`);
      }
    } catch (error) {
      console.error(`   ✗ Error: ${error.message}\n`);
    }
  }

  // Sort by date (newest first)
  allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Save to JSON
  const fs = await import('fs');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allNews, null, 2));
  console.log(`✅ Saved ${allNews.length} articles to ${OUTPUT_FILE}`);

  return allNews;
}

fetchNews().catch(console.error);