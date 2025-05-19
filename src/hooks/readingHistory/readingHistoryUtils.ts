import { ReadingHistoryEntry } from './types';

/**
 * Transforms raw data to ensure it matches the ReadingHistoryEntry interface
 */
export const transformHistoryData = (
  data: any[],
  source: 'supabase' | 'local' = 'supabase'
): ReadingHistoryEntry[] => {
  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    source: item.source,
    source_type: item.source_type || 'unknown',
    source_input: item.source_input || item.source || item.title || '',
    parsed_text: item.parsed_text || null,
    wpm: item.wpm,
    current_position: item.current_position,
    calibrated: source === 'local' ? 
      (item.calibrated !== null ? item.calibrated : false) : 
      false,
    created_at: item.created_at,
    updated_at: item.updated_at,
    summary: item.summary,
    content_id: item.content_id,
    is_completed: item.is_completed
  }));
};

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

/**
 * Determines if a reading session is significant enough to save
 */
export const isSignificantSession = (
  entry: Partial<ReadingHistoryEntry>, 
  minWords: number = 20
): boolean => {
  // Don't save if this is a short reading session with no summary and a generic title
  const isGenericSession = entry.title === "Reading Session" && !entry.summary && entry.current_position < minWords;
  return !isGenericSession;
};

/**
 * Calculates reading progress percentage
 */
export const calculateProgressPercentage = (currentPosition: number, totalText: string | null): number => {
  if (!totalText) return 0;
  
  const totalWords = totalText.split(/\s+/).filter(word => word.length > 0).length;
  return totalWords > 0 
    ? Math.min(Math.round((currentPosition / totalWords) * 100), 100)
    : 0;
};
