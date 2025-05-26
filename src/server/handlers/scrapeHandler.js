
const { fetchHtml } = require('../utils/webFetcher');
const { extractMainContent } = require('../utils/htmlExtractor');

/**
 * Scrape content from a URL with better error handling and connection management
 */
const scrapeWebsite = async (url) => {
  if (!url) {
    throw new Error('No URL provided');
  }

  // Validate URL format
  try {
    const urlObj = new URL(url);
    // Basic validation for supported protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are supported');
    }
  } catch (e) {
    throw new Error('Invalid URL format');
  }
  
  // Set timeout for request with more reasonable limits
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    console.log(`Fetching content from URL: ${url}`);
    
    // Fetch HTML with better error handling
    const html = await fetchHtml(url, controller.signal);
    clearTimeout(timeoutId);
    
    if (!html || html.trim().length === 0) {
      throw new Error('No content received from URL');
    }
    
    // Extract content with validation
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
    clearTimeout(timeoutId);
    console.error(`Error fetching URL: ${url}`, fetchError);
    
    // Provide more specific error messages
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

module.exports = {
  scrapeWebsite
};
