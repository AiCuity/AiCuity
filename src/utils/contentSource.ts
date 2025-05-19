
import { ExtractedContent } from "./types";
import { Readability } from "@mozilla/readability";

/**
 * Tries to fetch actual content from sources that allow direct access
 */
export async function fetchActualContent(url: string): Promise<ExtractedContent | null> {
  try {
    // For Wikipedia articles, try to extract content via their API
    if (url.includes('wikipedia.org/wiki/')) {
      // Extract the article title from the URL
      const articleName = url.split('/wiki/')[1].split('#')[0].split('?')[0];
      
      // Use the full content API instead of the summary API
      const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/html/${articleName}`;
      
      console.log(`Fetching full Wikipedia article via API: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.statusText}`);
      }
      
      // Get the HTML content
      const htmlContent = await response.text();
      
      // Parse the HTML to extract the main content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Extract all paragraphs, headings, and lists
      const contentElements = Array.from(doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, li'));
      
      // Convert to a readable text format, preserving headers with markdown-style formatting
      let extractedContent = '';
      
      contentElements.forEach(element => {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent?.trim();
        
        if (!text) return;
        
        if (tagName.startsWith('h')) {
          // Add markdown-style headers
          const headerLevel = parseInt(tagName.charAt(1));
          const prefix = '#'.repeat(headerLevel);
          extractedContent += `\n\n${prefix} ${text}\n\n`;
        } else if (tagName === 'li') {
          // List items
          extractedContent += `- ${text}\n`;
        } else if (tagName === 'ul' || tagName === 'ol') {
          // Skip direct list containers as we process the list items individually
          return;
        } else {
          // Regular paragraph
          extractedContent += `${text}\n\n`;
        }
      });
      
      // Get the page title from meta tags or the first heading
      const title = doc.querySelector('title')?.textContent || 
                   doc.querySelector('h1')?.textContent || 
                   articleName.replace(/_/g, ' ');
      
      return {
        content: extractedContent || "No content available",
        title: title || articleName,
        sourceUrl: url
      };
    }
    
    // For other websites, try to use a CORS proxy and Readability
    try {
      // Use a CORS proxy to fetch the website content
      const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      console.log(`Attempting to fetch website via CORS proxy: ${corsProxyUrl}`);
      
      const response = await fetch(corsProxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch via CORS proxy: ${response.statusText}`);
      }
      
      const htmlContent = await response.text();
      
      // Use Readability to extract the main content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Get the page title
      const pageTitle = doc.querySelector('title')?.textContent || new URL(url).hostname;
      
      // Use Readability to extract the main content
      const reader = new Readability(doc);
      const article = reader.parse();
      
      if (!article) {
        throw new Error('Readability could not extract content');
      }
      
      // Return the extracted content
      return {
        content: article.textContent || "No content available",
        title: article.title || pageTitle,
        sourceUrl: url
      };
    } catch (corsError) {
      console.error("CORS proxy error:", corsError);
      
      // Try another CORS proxy as a fallback
      try {
        const allOrigins = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        console.log(`Attempting with alternate CORS proxy: ${allOrigins}`);
        
        const response = await fetch(allOrigins);
        if (!response.ok) {
          throw new Error(`Failed to fetch via alternate CORS proxy: ${response.statusText}`);
        }
        
        const htmlContent = await response.text();
        
        // Use Readability to extract the main content
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // Get the page title
        const pageTitle = doc.querySelector('title')?.textContent || new URL(url).hostname;
        
        // Use Readability to extract the main content
        const reader = new Readability(doc);
        const article = reader.parse();
        
        if (!article) {
          throw new Error('Readability could not extract content');
        }
        
        // Return the extracted content
        return {
          content: article.textContent || "No content available",
          title: article.title || pageTitle,
          sourceUrl: url
        };
      } catch (fallbackError) {
        console.error("Fallback CORS proxy error:", fallbackError);
        throw fallbackError;
      }
    }
  } catch (error) {
    console.error("Error fetching actual content:", error);
    return null;
  }
}
