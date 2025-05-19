
import { fetchActualContent } from "./contentSource";
import { generateFallbackContent } from "./fallbackContent";

export type { ExtractedContent } from "./types";

export async function extractContentFromUrl(url: string): Promise<ExtractedContent> {
  // Try to extract content from API first
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log(`Attempting to connect to ${apiUrl}/api/scrape for URL: ${url}`);
    
    // Set a timeout for the fetch operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
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
    
    if (!data.text || data.text.trim() === '') {
      console.error('Empty content received from API');
      throw new Error('Empty content received from API');
    }
    
    // Clean any remaining HTML
    const cleanContent = cleanHtmlContent(data.text);
    
    return {
      content: cleanContent,
      title: data.title || 'Website content',
      sourceUrl: data.sourceUrl || url
    };
  } catch (error) {
    console.error('API Error:', error);
    
    // Try to fetch actual content directly for certain sources like Wikipedia
    try {
      console.log("Attempting to fetch content directly from source...");
      const actualContent = await fetchActualContent(url);
      if (actualContent) {
        console.log("Successfully fetched content from source directly");
        return {
          ...actualContent,
          content: cleanHtmlContent(actualContent.content)
        };
      }
    } catch (directError) {
      console.error("Error fetching direct content:", directError);
    }
    
    // If all else fails, use fallback content
    return generateFallbackContent(url);
  }
}

// Function to clean any remaining HTML tags from content
function cleanHtmlContent(content: string): string {
  return content
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Fix HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Remove excess whitespace
    .replace(/\s+/g, ' ')
    // Fix paragraph breaks (convert multiple newlines to double newlines)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}
