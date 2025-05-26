
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
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      // Check if the response is actually JSON
      const contentType = response.headers.get('content-type');
      console.log(`Response content-type: ${contentType}`);
      
      const responseText = await response.text();
      console.log(`Raw response (first 500 chars):`, responseText.substring(0, 500));
      
      // Check if response is HTML (error page) instead of JSON
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('Netlify function returned HTML instead of JSON - function may not be deployed correctly');
        throw new Error('Function returned HTML instead of JSON - deployment issue');
      }
      
      try {
        const data = JSON.parse(responseText);
        console.log(`Successfully parsed JSON response:`, data);
        
        if (data.text && data.text.trim()) {
          console.log(`Successfully extracted ${data.text.length} characters from processing server`);
          return {
            content: data.text,
            title: data.title || 'Extracted Content',
            sourceUrl: url
          };
        }
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.error('Response text that failed to parse:', responseText);
        throw new Error(`Invalid JSON response from function: ${parseError.message}`);
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
