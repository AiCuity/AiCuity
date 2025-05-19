
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
