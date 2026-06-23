/**
 * src/lib/contentful.ts
 * Fetch artikel dari Contentful CMS.
 *
 * Setup:
 * 1. Buat Content Model "article" di Contentful dengan fields:
 *    title, slug, excerpt, body (RichText), coverImage (Asset),
 *    publishedAt (Date), category (Short Text), readTime (Number)
 * 2. Isi CONTENTFUL_SPACE_ID & CONTENTFUL_ACCESS_TOKEN di .env / Netlify env vars
 *
 * npm install contentful @contentful/rich-text-html-renderer
 */

import { createClient } from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

// ─── Types ────────────────────────────────────────────────────
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverImage?: string;
  publishedAt: string;
  category: string;
  readTime: number;
  source: 'contentful' | 'rss';
}

// ─── Contentful Client ────────────────────────────────────────
const client = createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID ?? '',
  accessToken: import.meta.env.CONTENTFUL_ACCESS_TOKEN ?? '',
});

// ─── Fetch all articles from Contentful ───────────────────────
export async function getContentfulArticles(): Promise<Article[]> {
  if (!import.meta.env.CONTENTFUL_SPACE_ID) {
    console.warn('[Contentful] Env vars missing — skipping CMS fetch.');
    return [];
  }

  const entries = await client.getEntries({
    content_type: 'article',
    order: ['-fields.publishedAt'] as any,
    limit: 100,
    select: [
      'sys.id',
      'fields.title',
      'fields.slug',
      'fields.excerpt',
      'fields.body',
      'fields.coverImage',
      'fields.publishedAt',
      'fields.category',
      'fields.readTime',
    ] as any,
  });

  return entries.items.map((item: any) => {
    const f = item.fields;
    return {
      id: item.sys.id,
      title: f.title ?? '',
      slug: f.slug ?? item.sys.id,
      excerpt: f.excerpt ?? '',
      bodyHtml: f.body ? documentToHtmlString(f.body) : '',
      coverImage: f.coverImage?.fields?.file?.url
        ? `https:${f.coverImage.fields.file.url}`
        : undefined,
      publishedAt: f.publishedAt ?? item.sys.createdAt,
      category: f.category ?? 'Pi Network',
      readTime: f.readTime ?? estimateReadTime(f.excerpt ?? ''),
      source: 'contentful',
    };
  });
}

function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
