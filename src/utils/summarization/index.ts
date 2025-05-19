
import { SummarizationOptions, SummarizationResult } from './types';
import { summarizeWithOpenAI } from './openai';
import { summarizeWithFallback } from './fallback';

// Main summarization function that selects the appropriate method
export const summarizeText = async (
  text: string, 
  options: SummarizationOptions = {}
): Promise<string> => {
  try {
    if (options.useOpenAI && options.apiKey) {
      return await summarizeWithOpenAI(text, options.apiKey, options);
    } else {
      // Use our enhanced fallback summarization
      return await summarizeWithFallback(text, options);
    }
  } catch (error) {
    console.error('Summarization error:', error);
    throw error;
  }
};

// Re-export everything from the module
export * from './types';
export * from './openai';
export * from './fallback';
export * from './textUtils';
