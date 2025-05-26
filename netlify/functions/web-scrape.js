
const https = require('https');
const http = require('http');
const cheerio = require('cheerio');

// Helper functions for text processing
const cleanText = (text) => {
  return text
    // Replace non-printable and control characters
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Replace multiple whitespaces with a single space
    .replace(/\s+/g, ' ')
    // Remove excessive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();
};

// Fetch HTML from URL
const fetchHtml = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirects
        fetchHtml(response.headers.location).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch URL: ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Enhanced extract main content from HTML using Cheerio
const extractMainContent = (html, url) => {
  const $ = cheerio.load(html);
  
  // Extract the page title
  const pageTitle = $('title').text().trim() || new URL(url).hostname;
  
  // Remove script, style, nav, header, footer, and other non-content elements
  $('script, style, nav, header, footer, aside, [role=banner], [role=navigation], iframe, .share, .comments, .ad, .advertisement, .sidebar, .menu').remove();
  
  // Find the main content element based on common patterns
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
  
  // Try to find main content container
  for (const selector of possibleContentSelectors) {
    const selectedContent = $(selector);
    if (selectedContent.length > 0) {
      // Get all paragraphs within the container
      const paragraphs = selectedContent.find('p').map((_, el) => $(el).text().trim()).get();
      if (paragraphs.length > 0) {
        mainContent = paragraphs.join('\n\n');
        break;
      }
      
      // If no paragraphs found, use the container's text
      const text = selectedContent.text().trim();
      if (text.length > 150) {  // Only use if it has substantial content
        mainContent = text;
        break;
      }
    }
  }
  
  // If no content found using specific selectors, collect all paragraphs from the body
  if (!mainContent || mainContent.length < 200) {
    const paragraphs = $('body p').map((_, el) => $(el).text().trim()).get();
    if (paragraphs.length > 0) {
      mainContent = paragraphs.join('\n\n');
    } else {
      // Last resort: use body text with basic cleanup
      let bodyText = $('body').text();
      // Remove excess whitespace and line breaks
      mainContent = bodyText.replace(/\s+/g, ' ').trim();
    }
  }
  
  // Process content for Wikipedia specifically
  if (url.includes('wikipedia.org')) {
    // Focus on the article content
    const articleContent = $('#mw-content-text').first();
    if (articleContent.length) {
      // Remove references, citations, tables
      articleContent.find('.reference, .citation, table, .hatnote, .mw-editsection, .mw-headline-anchor').remove();
      
      // Extract all paragraphs
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
  
  // Clean the text
  return {
    text: cleanText(mainContent),
    title: pageTitle,
    sourceUrl: url
  };
};

// Scrape content from a URL
const scrapeWebsite = async (url) => {
  if (!url) {
    throw new Error('No URL provided');
  }

  // Check URL format
  try {
    new URL(url);
  } catch (e) {
    throw new Error('Invalid URL format');
  }
  
  try {
    // Fetch and extract content
    console.log(`Fetching content from URL: ${url}`);
    const html = await fetchHtml(url);
    
    const extractedData = extractMainContent(html, url);
    
    return {
      text: extractedData.text,
      title: extractedData.title,
      sourceUrl: url
    };
  } catch (fetchError) {
    console.error(`Error fetching URL: ${url}`, fetchError);
    throw new Error(`Failed to fetch URL: ${fetchError.message}`);
  }
};

// Netlify function handler
exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { url } = JSON.parse(event.body || '{}');
    
    if (!url) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    const result = await scrapeWebsite(url);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        text: result.text,
        title: result.title,
        sourceUrl: result.sourceUrl
      })
    };
  } catch (error) {
    console.error('Error in web-scrape function:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to scrape website',
        details: error.message
      })
    };
  }
};
