import { writeFileSync } from 'fs';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || '';
const OUTPUT_FILE = 'src/data/news.json';

const SOURCES = [
  { name: 'minepi', url: 'https://minepi.com/blog' },
  { name: 'minepi-news', url: 'https://minepi.com/news' },
];

async function fetchWithFirecrawl(url) {
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
      onlyMainContent: true,
      maxDepth: 1,
    })
  });

  if (!res.ok) {
    console.error(`Firecrawl error ${res.status} for ${url}`);
    return null;
  }

  return res.json();
}

function extractArticles(markdown, sourceName, sourceUrl) {
  const articles = [];
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    // Look for markdown links with text
    const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const title = linkMatch[1].trim();
      let linkUrl = linkMatch[2].trim();
      
      // Skip navigation/footer links
      if (title.length < 10 || title.includes('Sign') || title.includes('Login') || title.includes('Privacy')) continue;
      
      // Make relative URLs absolute
      if (linkUrl.startsWith('/')) {
        const base = new URL(sourceUrl);
        linkUrl = base.origin + linkUrl;
      }
      
      articles.push({
        title,
        description: '',
        url: linkUrl,
        source: sourceName,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }
  
  return articles;
}

async function main() {
  console.log('🚀 SmartPioneer News Fetcher\n');
  
  if (!FIRECRAWL_API_KEY) {
    console.error('❌ FIRECRAWL_API_KEY not set');
    process.exit(1);
  }

  const allArticles = [];

  for (const source of SOURCES) {
    console.log(`📡 Fetching: ${source.url}`);
    
    try {
      const data = await fetchWithFirecrawl(source.url);
      
      if (data?.data?.markdown) {
        const articles = extractArticles(data.data.markdown, source.name, source.url);
        allArticles.push(...articles);
        console.log(`   ✓ Found ${articles.length} articles`);
      } else {
        console.log(`   ⚠ No content returned`);
      }
    } catch (err) {
      console.error(`   ✗ Error: ${err.message}`);
    }
  }

  // Deduplicate by URL
  const unique = [...new Map(allArticles.map(a => [a.url, a])).values()];
  
  // Sort by title length (longer = likely more relevant)
  unique.sort((a, b) => b.title.length - a.title.length);
  
  // Keep top 20
  const final = unique.slice(0, 20);

  writeFileSync(OUTPUT_FILE, JSON.stringify(final, null, 2));
  console.log(`\n✅ Saved ${final.length} articles to ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});