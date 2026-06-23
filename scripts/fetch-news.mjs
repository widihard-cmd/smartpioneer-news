#!/usr/bin/env node
/**
 * scripts/fetch-news.mjs
 * Script auto-fetch berita dari RSS feeds Pi Network & crypto.
 * Dijalankan oleh GitHub Actions sesuai jadwal cron.
 *
 * Output: src/content/news/*.json  (dibaca Astro saat build)
 *
 * Usage:
 *   node scripts/fetch-news.mjs
 *
 * npm install rss-parser slugify
 */

import Parser from 'rss-parser';
import slugify from 'slugify';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../src/content/news');

// ─── RSS Feeds ────────────────────────────────────────────────
// Tambahkan feed Pi Network, Coindesk, Cointelegraph, dll.
const RSS_FEEDS = [
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    category: 'Crypto',
    keywords: ['pi network', 'pi coin', 'blockchain', 'defi'],
  },
  {
    name: 'CoinTelegraph',
    url: 'https://cointelegraph.com/rss',
    category: 'Crypto',
    keywords: ['pi network', 'mobile mining', 'web3'],
  },
  // {
  //   name: 'Pi Network Official Blog',
  //   url: 'https://minepi.com/blog/feed/',  // ganti jika tersedia
  //   category: 'Pi Network',
  //   keywords: [],
  // },
];

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure'],
  },
});

// ─── Helpers ──────────────────────────────────────────────────
function generateId(title, pubDate) {
  return crypto
    .createHash('md5')
    .update(`${title}-${pubDate}`)
    .digest('hex')
    .slice(0, 12);
}

function makeSlug(title) {
  return slugify(title, { lower: true, strict: true, locale: 'id' }).slice(0, 80);
}

function extractImage(item) {
  return (
    item['media:content']?.$.url ||
    item['media:thumbnail']?.$.url ||
    item.enclosure?.url ||
    null
  );
}

function estimateReadTime(text = '') {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

function isRelevant(item, keywords) {
  if (!keywords.length) return true;
  const haystack = `${item.title} ${item.contentSnippet}`.toLowerCase();
  return keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

// ─── Main ──────────────────────────────────────────────────────
async function fetchAll() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Load existing articles to avoid duplicates
  let existing = new Set();
  try {
    const files = await fs.readdir(OUTPUT_DIR);
    for (const f of files) {
      if (f.endsWith('.json')) {
        const raw = await fs.readFile(path.join(OUTPUT_DIR, f), 'utf8');
        const data = JSON.parse(raw);
        existing.add(data.id);
      }
    }
  } catch {}

  let newCount = 0;

  for (const feed of RSS_FEEDS) {
    console.log(`\n📡 Fetching: ${feed.name}...`);

    let result;
    try {
      result = await parser.parseURL(feed.url);
    } catch (err) {
      console.warn(`  ⚠ Failed to fetch ${feed.url}: ${err.message}`);
      continue;
    }

    for (const item of result.items.slice(0, 10)) {
      if (!isRelevant(item, feed.keywords)) continue;

      const id = generateId(item.title, item.pubDate);
      if (existing.has(id)) continue;

      const article = {
        id,
        title: item.title?.trim() ?? 'Untitled',
        slug: makeSlug(item.title ?? id),
        excerpt: item.contentSnippet?.slice(0, 200) ?? '',
        bodyHtml: item.content ?? item.contentSnippet ?? '',
        coverImage: extractImage(item),
        publishedAt: item.isoDate ?? new Date().toISOString(),
        category: feed.category,
        readTime: estimateReadTime(item.contentSnippet),
        source: 'rss',
        sourceUrl: item.link,
        sourceName: feed.name,
      };

      const filename = `${article.publishedAt.slice(0, 10)}-${article.slug}-${id}.json`;
      await fs.writeFile(
        path.join(OUTPUT_DIR, filename),
        JSON.stringify(article, null, 2),
        'utf8'
      );

      existing.add(id);
      newCount++;
      console.log(`  ✅ Saved: ${article.title.slice(0, 60)}`);
    }
  }

  console.log(`\n🎉 Done! ${newCount} new articles saved.`);
  return newCount;
}

fetchAll()
  .then((count) => {
    process.exit(count > 0 ? 0 : 0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
