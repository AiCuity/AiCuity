
import { fetchActualContent } from "./contentSource";
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";

/**
 * Attempts to retrieve content for a history item that's missing parsed_text
 */
export async function retrieveContentForHistoryItem(
  historyItem: ReadingHistoryEntry
): Promise<{success: boolean, content?: string, title?: string}> {
  // Only attempt to retrieve content from web sources
  if (!historyItem.source || !historyItem.source.startsWith('http')) {
    return { success: false };
  }
  
  try {
    const result = await fetchActualContent(historyItem.source);
    
    if (result && result.content) {
      return {
        success: true,
        content: result.content,
        title: result.title || historyItem.title
      };
    }
    
    return { success: false };
  } catch (error) {
    console.error("Error retrieving content for history item:", error);
    return { success: false };
  }
}

/**
 * Determines if content should be retrievable for a history entry
 */
export function isContentRetrievable(historyItem: ReadingHistoryEntry): boolean {
  // Content is retrievable if it has a source URL
  return !!(historyItem.source && historyItem.source.startsWith('http'));
}
