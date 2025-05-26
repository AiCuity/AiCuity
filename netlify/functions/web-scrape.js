
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const cheerio = require('cheerio');

exports.handler = async (event) => {
  const start = Date.now();
  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) return { statusCode: 400, body: '{"error":"url missing"}' };

    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();

    // 1️⃣ Try Readability
    let title, content;
    try {
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      title = article?.title?.trim();
      content = article?.content;
    } catch { /* ignore */ }

    // 2️⃣ Fallback to Cheerio if Readability fails
    if (!content) {
      const $ = cheerio.load(html);
      title = title || $('title').text();
      content = $('body').text().slice(0, 5000);  // simple fallback
    }

    if (!content) throw new Error('Unable to extract content');

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ title, content, elapsed: Date.now() - start })
    };
  } catch (e) {
    console.error('[scrape error]', e);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
