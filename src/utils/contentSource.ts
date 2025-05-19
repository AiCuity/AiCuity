
import { ExtractedContent } from "./types";

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
    
    // For other URLs, we can't reliably extract content in the browser
    // You would need a server-side solution or proxy for this
    return null;
  } catch (error) {
    console.error("Error fetching actual content:", error);
    return null;
  }
}
