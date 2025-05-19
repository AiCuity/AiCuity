
const cheerio = require('cheerio');

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
  const { cleanText } = require('./textCleaner');
  return {
    text: cleanText(mainContent),
    title: pageTitle,
    sourceUrl: url
  };
};

module.exports = {
  extractMainContent
};
