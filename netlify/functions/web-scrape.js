
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

    console.log('[web-scrape] Fetching content...');

    // Use fetch (available in Netlify Functions runtime)
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; NetlifyScraper/1.0; +https://aicuity.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 15000
    });

    console.log('[web-scrape] Fetch response status:', response.status);
    console.log('[web-scrape] Fetch response ok:', response.ok);

    if (!response.ok) {
      console.log('[web-scrape] ERROR: Non-200 status code:', response.status);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ 
          error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
          elapsed: Date.now() - start 
        })
      };
    }

    const html = await response.text();
    console.log('[web-scrape] HTML content length:', html.length);

    if (!html || html.trim().length === 0) {
      console.log('[web-scrape] ERROR: Empty HTML content');
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ 
          error: 'No content received from URL',
          elapsed: Date.now() - start 
        })
      };
    }

    let title = '';
    let content = '';

    // Simple HTML parsing without external dependencies
    console.log('[web-scrape] Extracting content with basic parsing');
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
    title = titleMatch ? titleMatch[1].trim() : 'Extracted Content';
    
    // Remove script and style tags
    let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // For Wikipedia, try to extract main content
    if (url.includes('wikipedia.org')) {
      const contentMatch = cleanHtml.match(/<div[^>]*id="mw-content-text"[^>]*>(.*?)<div[^>]*class="printfooter"/is);
      if (contentMatch) {
        cleanHtml = contentMatch[1];
        console.log('[web-scrape] Extracted Wikipedia main content');
      }
    }
    
    // Extract text from paragraphs
    const paragraphMatches = cleanHtml.match(/<p[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/p>/gi);
    if (paragraphMatches && paragraphMatches.length > 0) {
      content = paragraphMatches
        .map(p => p.replace(/<[^>]*>/g, ' ').trim())
        .filter(p => p.length > 20)
        .join('\n\n');
      console.log('[web-scrape] Extracted content from paragraphs, length:', content.length);
    }
    
    // Fallback: extract all text
    if (!content || content.length < 100) {
      content = cleanHtml
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      console.log('[web-scrape] Using fallback text extraction, length:', content.length);
    }
    
    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 10000); // Limit content size

    if (!content || content.length < 50) {
      console.log('[web-scrape] ERROR: Unable to extract meaningful content');
      return {
        statusCode: 502,
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
    
  } catch (error) {
    console.error('[web-scrape] ERROR:', error.message);
    console.error('[web-scrape] ERROR stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: `Internal server error: ${error.message}`,
        elapsed: Date.now() - start 
      }),
    };
  }
}
