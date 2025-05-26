
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
  console.log('[web-scrape] Function started at:', new Date().toISOString());

  try {
    console.log('[web-scrape] Event body:', event.body);
    const { url } = JSON.parse(event.body || '{}');
    
    if (!url) {
      console.log('[web-scrape] ERROR: No URL provided');
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'url missing' }),
      };
    }

    console.log('[web-scrape] Processing URL:', url);
    console.log('[web-scrape] Fetching content with headers...');

    const res = await fetchFn(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 NetlifyScraper/1.0' },
    });

    console.log('[web-scrape] Fetch response status:', res.status);
    console.log('[web-scrape] Fetch response ok:', res.ok);
    console.log('[web-scrape] Response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      console.log('[web-scrape] ERROR: Non-200 status code:', res.status);
      return {
        statusCode: res.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `Failed to fetch URL: ${res.status} ${res.statusText}` }),
      };
    }

    const html = await res.text();
    console.log('[web-scrape] HTML content length:', html.length);
    console.log('[web-scrape] HTML preview (first 200 chars):', html.substring(0, 200));

    // 1️⃣ Try Readability first
    let title, content;
    console.log('[web-scrape] Attempting Readability extraction...');
    
    try {
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      
      if (article) {
        title = article.title?.trim();
        content = article.textContent || article.content; // Use textContent for plain text
        console.log('[web-scrape] Readability success - Title:', title);
        console.log('[web-scrape] Readability content length:', content?.length || 0);
      } else {
        console.log('[web-scrape] Readability returned null article');
      }
    } catch (readabilityError) {
      console.log('[web-scrape] Readability failed:', readabilityError.message);
    }

    // 2️⃣ Cheerio fallback if Readability fails
    if (!content || content.length < 100) {
      console.log('[web-scrape] Using Cheerio fallback...');
      const $ = cheerio.load(html);
      title = title || $('title').text().trim();
      
      // Try to get main content areas first
      let mainContent = '';
      const contentSelectors = ['main', 'article', '.content', '#content', '.post-content', '.entry-content'];
      
      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          mainContent = element.text().trim();
          if (mainContent.length > 200) {
            console.log('[web-scrape] Found content using selector:', selector);
            break;
          }
        }
      }
      
      // Fallback to body if no main content found
      if (!mainContent || mainContent.length < 200) {
        mainContent = $('body').text().trim();
        console.log('[web-scrape] Using body text fallback');
      }
      
      content = mainContent.slice(0, 5000); // Limit content size
      console.log('[web-scrape] Cheerio content length:', content.length);
    }

    if (!content || content.length < 50) {
      console.log('[web-scrape] ERROR: Unable to extract meaningful content');
      throw new Error('Unable to extract meaningful content from the page');
    }

    const result = {
      title: title || 'Extracted Content',
      text: content, // Changed from 'content' to 'text' to match expected format
      elapsed: Date.now() - start,
    };

    console.log('[web-scrape] SUCCESS - Final result:', {
      title: result.title,
      textLength: result.text.length,
      elapsed: result.elapsed
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result),
    };
  } catch (e) {
    console.error('[web-scrape] ERROR:', e.message);
    console.error('[web-scrape] ERROR stack:', e.stack);
    
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: e.message,
        elapsed: Date.now() - start 
      }),
    };
  }
}
