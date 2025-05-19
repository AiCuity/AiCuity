
export interface ExtractedContent {
  content: string;
  title: string;
  sourceUrl: string;
}

export interface Content {
  title: string;
  source: string;
  url?: string;
}

export interface FileProcessingResult {
  success: boolean;
  text: string;
  originalFilename: string;
  error?: string;
}

export interface ReadingHistoryItem {
  id: string;
  title: string;
  source: string | null;
  source_type: string;
  source_input: string;
  parsed_text?: string | null;
  wpm: number;
  current_position: number | null;
  calibrated: boolean | null;
  created_at: string;
  updated_at: string;
  summary: string | null;
  content_id: string;
}
