
import { ReadingHistoryEntry } from '../types';

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
