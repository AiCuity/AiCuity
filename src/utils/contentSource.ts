
import { ExtractedContent } from "./contentExtractor";

/**
 * Tries to fetch actual content from sources that allow direct access
 */
export async function fetchActualContent(url: string): Promise<ExtractedContent | null> {
  try {
    // For Wikipedia articles, try to extract content via their API
    if (url.includes('wikipedia.org/wiki/')) {
      // Extract the article title from the URL
      const articleName = url.split('/wiki/')[1].split('#')[0].split('?')[0];
      const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${articleName}`;
      
      console.log(`Fetching Wikipedia article via API: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        content: data.extract_html || data.extract || "No content available",
        title: data.title || articleName,
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
