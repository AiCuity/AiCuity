import { ReadingHistoryEntry } from '../types';

/**
 * Removes duplicate entries, keeping the most recently updated one for each content_id
 * and filtering out entries without summaries and with generic titles
 */
export const removeDuplicateEntries = (entries: ReadingHistoryEntry[]): ReadingHistoryEntry[] => {
  // Filter out entries without summaries and with generic titles
  const filteredEntries = entries.filter(entry => {
    // Keep entries with summaries
    if (entry.summary) return true;
    
    // Filter out entries with generic titles and no summary
    const isGenericTitle = entry.title === "Reading Session";
    return !isGenericTitle;
  });
  
  const uniqueContentIds = new Map<string, ReadingHistoryEntry>();
  
  // For each entry, if we haven't seen this content_id before, or if this entry is more recent than 
  // the one we've seen, update the map with this entry
  filteredEntries.forEach(entry => {
    if (entry.content_id) {
      const existing = uniqueContentIds.get(entry.content_id);
      if (!existing || new Date(entry.updated_at) > new Date(existing.updated_at)) {
        uniqueContentIds.set(entry.content_id, entry);
      }
    }
  });
  
  // Convert the map values back to an array and sort by updated_at
  return Array.from(uniqueContentIds.values())
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
};
