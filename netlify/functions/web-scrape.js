
export async function handler(event) {
  const start = Date.now();
  console.log('[web-scrape] Function started at:', new Date().toISOString());

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      console.log('[web-scrape] Handling OPTIONS request');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'CORS preflight successful' })
      };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      console.log('[web-scrape] Method not allowed:', event.httpMethod);
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed. Only POST requests are supported.' })
      };
    }

    console.log('[web-scrape] Event body:', event.body);
    
    if (!event.body) {
      console.log('[web-scrape] ERROR: No request body');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No request body provided' })
      };
    }

    const { url } = JSON.parse(event.body);
    
    if (!url) {
      console.log('[web-scrape] ERROR: No URL provided');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'url missing' })
      };
    }

    console.log('[web-scrape] Processing URL:', url);

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      console.log('[web-scrape] ERROR: Invalid URL format');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid URL format' })
      };
    }

    console.log('[web-scrape] Fetching content with headers...');

    // Use native fetch with better error handling
    const fetchFn = typeof fetch === 'function' ? fetch : 
      (...args) => import('node-fetch').then(m => m.default(...args));

    const res = await fetchFn(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; NetlifyScraper/1.0; +https://aicuity.app)' 
      },
      timeout: 10000
    });

    console.log('[web-scrape] Fetch response status:', res.status);
    console.log('[web-scrape] Fetch response ok:', res.ok);

    if (!res.ok) {
      console.log('[web-scrape] ERROR: Non-200 status code:', res.status);
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({ 
          error: `Failed to fetch URL: ${res.status} ${res.statusText}`,
          elapsed: Date.now() - start 
        })
      };
    }

    const html = await res.text();
    console.log('[web-scrape] HTML content length:', html.length);

    if (!html || html.trim().length === 0) {
      console.log('[web-scrape] ERROR: Empty HTML content');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'No content received from URL',
          elapsed: Date.now() - start 
        })
      };
    }

    let title, content;

    // Try to use JSDOM and Readability if available
    try {
      const { JSDOM } = await import('jsdom');
      const { Readability } = await import('@mozilla/readability');
      
      console.log('[web-scrape] Attempting Readability extraction...');
      
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      
      if (article && article.textContent && article.textContent.length > 100) {
        title = article.title?.trim();
        content = article.textContent;
        console.log('[web-scrape] Readability success - Title:', title);
        console.log('[web-scrape] Readability content length:', content?.length || 0);
      } else {
        console.log('[web-scrape] Readability returned insufficient content');
        throw new Error('Readability extraction insufficient');
      }
    } catch (readabilityError) {
      console.log('[web-scrape] Readability failed, using Cheerio fallback:', readabilityError.message);
      
      // Fallback to Cheerio if available
      try {
        const cheerio = await import('cheerio');
        const $ = cheerio.load(html);
        
        title = title || $('title').text().trim();
        
        // Remove script, style, nav, header, footer, and other non-content elements
        $('script, style, nav, header, footer, aside, [role=banner], [role=navigation], iframe, .share, .comments, .ad, .advertisement, .sidebar, .menu').remove();
        
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
        
      } catch (cheerioError) {
        console.log('[web-scrape] Cheerio also failed:', cheerioError.message);
        
        // Last resort: basic text extraction
        title = 'Extracted Content';
        // Remove script and style tags with regex
        const cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                             .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
        // Remove all HTML tags
        content = cleanHtml.replace(/<[^>]*>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim()
                          .slice(0, 3000);
        console.log('[web-scrape] Using basic text extraction, length:', content.length);
      }
    }

    if (!content || content.length < 50) {
      console.log('[web-scrape] ERROR: Unable to extract meaningful content');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Unable to extract meaningful content from the page',
          elapsed: Date.now() - start 
        })
      };
    }

    const result = {
      title: title || 'Extracted Content',
      text: content,
      elapsed: Date.now() - start,
    };

    console.log('[web-scrape] SUCCESS - Final result:', {
      title: result.title,
      textLength: result.text.length,
      elapsed: result.elapsed
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
    
  } catch (e) {
    console.error('[web-scrape] ERROR:', e.message);
    console.error('[web-scrape] ERROR stack:', e.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: e.message || 'Internal server error',
        elapsed: Date.now() - start 
      }),
    };
  }
}
