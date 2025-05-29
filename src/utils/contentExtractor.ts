const API_BASE = import.meta.env.VITE_API_URL;

const simplifyContent = (content: string) => {
  // Remove excessive whitespace but preserve paragraph breaks
  let simplified = content.replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
  simplified = simplified.replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines to 2
  simplified = simplified.trim();
  
  // Remove common boilerplate text patterns (be more specific to avoid removing actual content)
  simplified = simplified.replace(/^(please enable javascript to view the comments powered by disqus\.)/i, '');
  simplified = simplified.replace(/\b(advertisement|sponsored content|click here to subscribe)\b/gi, '');
  
  return simplified;
};

// Fallback content extraction using a client-side approach
const extractContentFallback = async (url: string) => {
  console.log(`[contentExtractor] Using fallback content extraction for: ${url}`);
  
  // Check if it's a Wikipedia URL and extract the title
  if (url.includes('wikipedia.org/wiki/')) {
    const titleMatch = url.match(/\/wiki\/([^#?]+)/);
    const title = titleMatch ? decodeURIComponent(titleMatch[1]).replace(/_/g, ' ') : 'Wikipedia Article';
    
    return {
      content: `This is a Wikipedia article about "${title}". The content extraction system is currently experiencing technical difficulties, but you can still practice your speed reading with this simulated content. 

Wikipedia is a free online encyclopedia that contains millions of articles on various topics. The article you're trying to read likely contains detailed information about ${title}, including its history, significance, and related topics.

This simulated content allows you to test the reading interface while we work on resolving the content extraction issues. You can adjust the reading speed, practice different techniques, and familiarize yourself with the reader controls.

Once the technical issues are resolved, you'll be able to extract and read the actual content from websites and documents seamlessly.`,
      title: title,
      sourceUrl: url
    };
  }
  
  // For other URLs, provide a generic fallback
  const domain = new URL(url).hostname;
  return {
    content: `Content extraction is currently experiencing technical difficulties. This simulated content allows you to test the speed reading interface while we work on resolving the issues.

The website you're trying to read (${domain}) likely contains interesting articles and information. Our system typically extracts the main content from web pages, removing navigation menus, advertisements, and other distractions to provide a clean reading experience.

You can use this simulated content to:
- Test different reading speeds
- Practice speed reading techniques
- Familiarize yourself with the reader controls
- Adjust settings to your preference

Once the technical issues are resolved, you'll be able to extract actual content from any website or upload your own documents for speed reading practice.`,
    title: `Content from ${domain}`,
    sourceUrl: url
  };
};

export const extractContentFromUrl = async (url: string) => {
  try {
    console.log(`[contentExtractor] Attempting to extract content from: ${url}`);
    console.log(`[contentExtractor] Using API_BASE: ${API_BASE}`);
    console.log(`[contentExtractor] Full endpoint URL: ${API_BASE}/scrape`);
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_BASE}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    console.log(`[contentExtractor] Response status: ${response.status}`);
    console.log(`[contentExtractor] Response ok: ${response.ok}`);
    
    // Log non-200 status codes
    if (response.status !== 200) {
      console.log(`[contentExtractor] NON-200 STATUS CODE: ${response.status} for URL: ${url}`);
    }
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log(`[contentExtractor] Response content-type: ${contentType}`);
      
      const responseText = await response.text();
      console.log(`[contentExtractor] Raw response (first 500 chars):`, responseText.substring(0, 500));
      
      // Check if response is HTML (error page) instead of JSON
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('[contentExtractor] Netlify function returned HTML instead of JSON - using fallback extraction');
        return await extractContentFallback(url);
      }
      
      try {
        const data = JSON.parse(responseText);
        console.log(`[contentExtractor] Successfully parsed JSON response:`, data);
        
        if (data.text && data.text.trim()) {
          console.log(`[contentExtractor] Successfully extracted ${data.text.length} characters from processing server`);
          return {
            content: simplifyContent(data.text),
            title: data.title || 'Extracted Content',
            sourceUrl: url
          };
        } else {
          console.warn('[contentExtractor] Response missing text content, using fallback');
          return await extractContentFallback(url);
        }
      } catch (parseError) {
        console.error('[contentExtractor] JSON parsing failed, using fallback:', parseError);
        return await extractContentFallback(url);
      }
    } else {
      // Log the error response for debugging
      try {
        const errorText = await response.text();
        console.error(`[contentExtractor] Server error response (${response.status}): ${errorText}`);
      } catch (e) {
        console.error('[contentExtractor] Failed to read error response');
      }
      
      console.log(`[contentExtractor] Content extraction failed with status ${response.status}, using fallback`);
      return await extractContentFallback(url);
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("[contentExtractor] Request timeout, using fallback");
    } else {
      console.error("[contentExtractor] Failed to extract content, using fallback:", error);
    }
    return await extractContentFallback(url);
  }
};
