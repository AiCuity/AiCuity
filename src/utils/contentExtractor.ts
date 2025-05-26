
import { API_BASE_URL } from './apiConfig';

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
    
    // Use the correct endpoint based on environment
    const endpoint = API_BASE_URL.includes('netlify') 
      ? `${API_BASE_URL}/web-scrape`  // Netlify function path
      : `${API_BASE_URL}/api/web/scrape`;  // Local server path
    
    const response = await fetch(endpoint, {
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
    }
    
    // If extraction fails, return error message
    throw new Error(`Content extraction failed with status ${response.status}`);
    
  } catch (error) {
    console.error("Failed to extract content:", error);
    return {
      content: `Failed to extract content. ⚠️ NOTE: This is simulated content. The website may be blocking access, or the content may be dynamically loaded. Please ensure the processing server is running.`,
      title: 'Error Extracting Content',
      sourceUrl: url
    };
  }
};
