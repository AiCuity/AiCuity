
const { fetchHtml } = require('../utils/webFetcher');
const { extractMainContent } = require('../utils/htmlExtractor');

/**
 * Scrape content from a URL
 */
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
  
  // Set timeout for request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    // Fetch and extract content
    console.log(`Fetching content from URL: ${url}`);
    const html = await fetchHtml(url);
    clearTimeout(timeoutId);
    
    const extractedData = extractMainContent(html, url);
    
    return {
      text: extractedData.text,
      title: extractedData.title,
      sourceUrl: url
    };
  } catch (fetchError) {
    clearTimeout(timeoutId);
    console.error(`Error fetching URL: ${url}`, fetchError);
    throw new Error(`Failed to fetch URL: ${fetchError.message}`);
  }
};

module.exports = {
  scrapeWebsite
};
