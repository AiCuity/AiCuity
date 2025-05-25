import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { API_BASE_URL } from './apiConfig';

const extractContentWithReadability = (html: string, url: string) => {
  try {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article) {
      return {
        content: article.textContent,
        title: article.title,
        sourceUrl: url
      };
    }
    return null;
  } catch (error) {
    console.error("Error during Readability parsing:", error);
    return null;
  }
};

const simplifyContent = (content: string) => {
  // Remove excessive whitespace and newlines
  let simplified = content.replace(/\s+/g, ' ').trim();
  
  // Remove common boilerplate text patterns
  simplified = simplified.replace(/^(please enable javascript to view the comments powered by disqus\.)/i, '');
  
  return simplified;
};

export const extractContentFromUrl = async (url: string) => {
  try {
    console.log(`Attempting to extract content from: ${url}`);
    
    // First, try the processing server
    const response = await fetch(`${API_BASE_URL}/api/web/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.text && data.text.trim()) {
        console.log(`Successfully extracted ${data.text.length} characters from processing server`);
        return {
          content: data.text,
          title: data.title || 'Extracted Content',
          sourceUrl: url
        };
      }
    } else {
      console.log(`Processing server returned ${response.status}, falling back to domain-specific extraction`);
    }
  } catch (error) {
    console.log('Processing server unavailable, falling back to domain-specific extraction:', error);
  }

  try {
    console.log(`Attempting to fetch content directly from: ${url}`);
    const response = await fetch(url, {
      mode: 'cors', // Add this to handle CORS issues
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    
    // Use Readability to extract the main content
    const readabilityResult = extractContentWithReadability(html, url);
    if (readabilityResult) {
      console.log(`Successfully extracted content using Readability`);
      return readabilityResult;
    }
    
    // If Readability fails, return the raw HTML (or an empty string)
    console.log(`Readability extraction failed, returning raw content`);
    return { content: simplifyContent(html), title: 'Raw Content', sourceUrl: url };
    
  } catch (error) {
    console.error("Failed to fetch or parse content:", error);
    return {
      content: `Failed to extract content. ⚠️ NOTE: This is simulated content. The website may be blocking access, or the content may be dynamically loaded.`,
      title: 'Error Extracting Content',
      sourceUrl: url
    };
  }
};
