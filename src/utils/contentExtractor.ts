
import { fetchActualContent } from "./contentSource";
import { generateFallbackContent } from "./fallbackContent";
import { ExtractedContent } from "./types";

export { ExtractedContent } from "./types";

export async function extractContentFromUrl(url: string): Promise<ExtractedContent> {
  // Try to extract content from API first
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log(`Attempting to connect to ${apiUrl}/api/scrape for URL: ${url}`);
    
    // Set a timeout for the fetch operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${apiUrl}/api/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.error || 'Failed to extract content');
    }
    
    const data = await response.json();
    console.log('Extracted data:', data);
    
    return {
      content: data.text,
      title: data.title || 'Website content',
      sourceUrl: data.sourceUrl || url
    };
  } catch (error) {
    console.error('API Error:', error);
    
    // Try to fetch actual content directly, bypassing JSDOM/Readability in browser
    try {
      console.log("Attempting to fetch content directly from source...");
      const actualContent = await fetchActualContent(url);
      if (actualContent) {
        console.log("Successfully fetched content from source directly");
        return actualContent;
      }
    } catch (directError) {
      console.error("Error fetching direct content:", directError);
    }
    
    // If all else fails, use fallback content
    return generateFallbackContent(url);
  }
}
