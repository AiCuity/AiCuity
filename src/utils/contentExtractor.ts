
import { API_BASE } from '@/lib/apiBase';

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
    console.log(`Using API_BASE: ${API_BASE}`);
    console.log(`Full endpoint URL: ${API_BASE}/web-scrape`);
    
    const response = await fetch(`${API_BASE}/web-scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response ok: ${response.ok}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`Successfully extracted content:`, data);
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
