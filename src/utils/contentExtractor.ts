
import { fetchActualContent } from "./contentSource";
import { generateFallbackContent } from "./fallbackContent";
import { ExtractedContent } from "./types";

export type { ExtractedContent } from "./types";

export async function extractContentFromUrl(url: string): Promise<ExtractedContent> {
  console.log(`Extracting content from URL: ${url}`);
  
  // First, try to fetch content directly using our enhanced methods
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
  
  // If direct fetching fails, try the API
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log(`Attempting to connect to ${apiUrl}/api/scrape for URL: ${url}`);
    
    // Set a timeout for the fetch operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // shorter timeout for faster fallback
    
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
    
    // If both direct fetching and API approach fail, use fallback content
    const fallbackContent = await generateFallbackContent(url);
    
    // Add a notice to the content that this is simulated
    fallbackContent.content = "⚠️ NOTE: This is simulated content. The content extraction failed. ⚠️\n\n" + fallbackContent.content;
    
    return fallbackContent;
  }
}

// Enhanced function to clean HTML content and remove problematic characters
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
    // Remove non-printable and control characters
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Fix paragraph breaks (convert multiple newlines to double newlines)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s*\n\s*/g, '\n')
    // Remove brackets with numbers (citation references)
    .replace(/\[\d+\]/g, '')
    // Clean up Unicode replacement characters and question marks in boxes
    .replace(/�/g, '')
    .replace(/\uFFFD/g, '')
    // Remove strange character combinations that often appear in extracted text
    .replace(/\\u[\dA-Fa-f]{4}/g, '')
    .replace(/\\x[\dA-Fa-f]{2}/g, '')
    // Remove CSS class definitions and style information
    .replace(/\.mw-parser-output[^}]+}/g, '')
    .replace(/\.[a-zA-Z0-9_-]+{[^}]*}/g, '')
    // Clean up parenthetical CSS classes
    .replace(/\([^)]*\.mw-[^)]*\)/g, '')
    // Preserve legitimate parenthetical foreign language terms (like Japanese)
    // but clean up CSS contamination within them
    .replace(/\(([^()]*?\.mw-[^()]*?)\)/g, match => {
      const inner = match.slice(1, -1);
      // If it contains foreign characters, clean it and keep only the relevant text
      if (/[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/.test(inner)) {
        const cleaned = inner.replace(/\.mw-[^,)]*,?/g, '').trim();
        return cleaned ? `(${cleaned})` : '';
      }
      // Otherwise remove the whole thing
      return '';
    })
    .trim();
}
