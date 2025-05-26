
const cheerio = require('cheerio');

// CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Clean text function
const cleanText = (text) => {
  return text
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// Extract main content from HTML using Cheerio
const extractMainContent = (html, url) => {
  const $ = cheerio.load(html);
  
  const pageTitle = $('title').text().trim() || new URL(url).hostname;
  
  $('script, style, nav, header, footer, aside, [role=banner], [role=navigation], iframe, .share, .comments, .ad, .advertisement, .sidebar, .menu').remove();
  
  const possibleContentSelectors = [
    'main', 
    'article', 
    'div[role="main"]',
    '.content', 
    '.post-content', 
    '.entry-content', 
    '.article-content', 
    '.article-body',
    '#content', 
    '#main', 
    '#article'
  ];
  
  let mainContent = '';
  
  for (const selector of possibleContentSelectors) {
    const selectedContent = $(selector);
    if (selectedContent.length > 0) {
      const paragraphs = selectedContent.find('p').map((_, el) => $(el).text().trim()).get();
      if (paragraphs.length > 0) {
        mainContent = paragraphs.join('\n\n');
        break;
      }
      
      const text = selectedContent.text().trim();
      if (text.length > 150) {
        mainContent = text;
        break;
      }
    }
  }
  
  if (!mainContent || mainContent.length < 200) {
    const paragraphs = $('body p').map((_, el) => $(el).text().trim()).get();
    if (paragraphs.length > 0) {
      mainContent = paragraphs.join('\n\n');
    } else {
      let bodyText = $('body').text();
      mainContent = bodyText.replace(/\s+/g, ' ').trim();
    }
  }
  
  if (url.includes('wikipedia.org')) {
    const articleContent = $('#mw-content-text').first();
    if (articleContent.length) {
      articleContent.find('.reference, .citation, table, .hatnote, .mw-editsection, .mw-headline-anchor').remove();
      
      const paragraphs = articleContent.find('p, h2, h3').map((_, el) => {
        const $el = $(el);
        if ($el.is('h2') || $el.is('h3')) {
          return '\n\n## ' + $el.text().trim() + '\n';
        }
        return $el.text().trim();
      }).get().filter(text => text.length > 0);
      
      if (paragraphs.length > 0) {
        mainContent = paragraphs.join('\n\n');
      }
    }
  }
  
  return {
    text: cleanText(mainContent),
    title: pageTitle,
    sourceUrl: url
  };
};

// Fetch HTML from URL
const fetchHtml = async (url) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AiCuity/1.0; +https://aicuity.app)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
    },
    timeout: 20000,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.text();
};

// Main scrape function
const scrapeWebsite = async (url) => {
  if (!url) {
    throw new Error('No URL provided');
  }

  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are supported');
    }
  } catch (e) {
    throw new Error('Invalid URL format');
  }
  
  try {
    console.log(`Fetching content from URL: ${url}`);
    
    const html = await fetchHtml(url);
    
    if (!html || html.trim().length === 0) {
      throw new Error('No content received from URL');
    }
    
    const extractedData = extractMainContent(html, url);
    
    if (!extractedData || !extractedData.text || extractedData.text.trim().length === 0) {
      throw new Error('No meaningful content could be extracted from the page');
    }
    
    console.log(`Successfully extracted ${extractedData.text.length} characters`);
    
    return {
      text: extractedData.text,
      title: extractedData.title || 'Extracted Content',
      sourceUrl: url
    };
  } catch (fetchError) {
    console.error(`Error fetching URL: ${url}`, fetchError);
    
    if (fetchError.name === 'AbortError') {
      throw new Error(`Request timeout while fetching: ${url}`);
    } else if (fetchError.code === 'ENOTFOUND') {
      throw new Error(`Domain not found: ${url}`);
    } else if (fetchError.code === 'ECONNREFUSED') {
      throw new Error(`Connection refused: ${url}`);
    } else {
      throw new Error(`Failed to fetch URL: ${fetchError.message}`);
    }
  }
};

// Netlify function handler
exports.handler = async (event, context) => {
  console.log('Web scrape function called with method:', event.httpMethod);
  console.log('Headers:', event.headers);
  console.log('Body:', event.body);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the request body
    let requestData;
    try {
      requestData = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    const { url } = requestData;

    if (!url) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    console.log(`Processing scrape request for: ${url}`);

    // Scrape the website
    const result = await scrapeWebsite(url);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Scraping error:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to scrape the provided URL'
      }),
    };
  }
};
