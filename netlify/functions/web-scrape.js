
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import cheerio from 'cheerio';

// Node 18+ provides a global fetch; fall back to node-fetch for older local runs
const fetchFn =
  typeof fetch === 'function'
    ? fetch
    : (...args) => import('node-fetch').then(m => m.default(...args));

export async function handler(event) {
  const start = Date.now();

  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'url missing' }),
      };
    }

    const res  = await fetchFn(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 NetlifyScraper/1.0' },
    });
    const html = await res.text();

    // 1️⃣ Try Readability first
    let title, content;
    try {
      const dom     = new JSDOM(html, { url });
      const reader  = new Readability(dom.window.document);
      const article = reader.parse();
      title   = article?.title?.trim();
      content = article?.content;          // already HTML
    } catch {
      /* fall through to Cheerio */
    }

    // 2️⃣ Cheerio fallback if Readability fails
    if (!content) {
      const $ = cheerio.load(html);
      title   = title || $('title').text();
      content = $('body').text().slice(0, 5000); // plain-text fallback
    }

    if (!content) throw new Error('Unable to extract content');

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        title,
        content,
        elapsed: Date.now() - start,
      }),
    };
  } catch (e) {
    console.error('[web-scrape error]', e);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message }),
    };
  }
}
