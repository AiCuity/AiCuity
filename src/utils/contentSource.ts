
import { ExtractedContent } from "./contentExtractor";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

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
    
    // For other URLs, try a direct fetch and use Readability
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }
      
      const html = await response.text();
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      
      if (article) {
        return {
          content: article.content,
          title: article.title || "Extracted Content",
          sourceUrl: url
        };
      }
    } catch (error) {
      console.error("Error extracting with direct Readability:", error);
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching actual content:", error);
    return null;
  }
}
