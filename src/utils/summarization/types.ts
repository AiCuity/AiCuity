
// Interface for summarization options
export interface SummarizationOptions {
  maxLength?: number;
  minLength?: number;
  apiKey?: string;
  useOpenAI?: boolean;
}

// Interface for summarization result
export interface SummarizationResult {
  summary: string;
  isLoading: boolean;
  error?: string;
}
