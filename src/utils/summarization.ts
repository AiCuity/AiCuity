
import { pipeline } from "@huggingface/transformers";

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

// Function to summarize text using OpenAI API
export const summarizeWithOpenAI = async (
  text: string, 
  apiKey: string,
  options: SummarizationOptions = {}
): Promise<string> => {
  try {
    const maxLength = options.maxLength || 1024;
    const minLength = options.minLength || 150;
    
    // OpenAI API call
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: `Summarize the following text into 3-5 concise paragraphs:\n\n${text}`,
        max_tokens: maxLength,
        temperature: 0.3,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message || 'Failed to summarize with OpenAI');
    }
    
    const data = await response.json();
    return data.choices[0].text.trim();
  } catch (error) {
    console.error('OpenAI summarization error:', error);
    throw error;
  }
}

// Function to summarize text using Hugging Face transformers
export const summarizeWithHuggingFace = async (
  text: string,
  options: SummarizationOptions = {}
): Promise<string> => {
  try {
    // Split text into chunks to handle token limits
    const chunks = splitTextIntoChunks(text, 1000);
    let summaries: string[] = [];
    
    // Setup the summarization pipeline
    const summarizer = await pipeline(
      'summarization',
      'facebook/bart-large-cnn'
    );
    
    // Process each chunk
    for (const chunk of chunks) {
      if (chunk.trim().length === 0) continue;
      
      // Use properly typed generation config object
      const result = await summarizer(chunk, {
        generation: {
          max_new_tokens: options.maxLength || 130,
          min_new_tokens: options.minLength || 30,
          do_sample: false
        }
      });
      
      if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object') {
        if ('summary_text' in result[0]) {
          summaries.push(result[0].summary_text as string);
        } else if ('generated_text' in result[0]) {
          summaries.push(result[0].generated_text as string);
        }
      } else if (typeof result === 'object' && result !== null) {
        if ('summary_text' in result) {
          summaries.push(result.summary_text as string);
        } else if ('generated_text' in result) {
          summaries.push(result.generated_text as string);
        }
      }
    }
    
    // Combine all summaries into one
    let combinedSummary = summaries.join(' ');
    
    // If we have multiple chunks, summarize the combined summary again for coherence
    if (summaries.length > 1 && combinedSummary.length > 1000) {
      const finalResult = await summarizer(combinedSummary, {
        generation: {
          max_new_tokens: options.maxLength || 150,
          min_new_tokens: options.minLength || 50,
          do_sample: false
        }
      });
      
      if (Array.isArray(finalResult) && finalResult.length > 0 && typeof finalResult[0] === 'object') {
        if ('summary_text' in finalResult[0]) {
          combinedSummary = finalResult[0].summary_text as string;
        } else if ('generated_text' in finalResult[0]) {
          combinedSummary = finalResult[0].generated_text as string;
        }
      } else if (typeof finalResult === 'object' && finalResult !== null) {
        if ('summary_text' in finalResult) {
          combinedSummary = finalResult.summary_text as string;
        } else if ('generated_text' in finalResult) {
          combinedSummary = finalResult.generated_text as string;
        }
      }
    }
    
    return combinedSummary;
  } catch (error) {
    console.error('HuggingFace summarization error:', error);
    throw error;
  }
}

// Function to split text into chunks
const splitTextIntoChunks = (text: string, maxChunkLength: number = 1000): string[] => {
  const sentences = text.replace(/([.!?])\s+/g, "$1|").split("|");
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkLength) {
      currentChunk += sentence + ' ';
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence + ' ';
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// Main summarization function that selects the appropriate method
export const summarizeText = async (
  text: string, 
  options: SummarizationOptions = {}
): Promise<string> => {
  try {
    if (options.useOpenAI && options.apiKey) {
      return await summarizeWithOpenAI(text, options.apiKey, options);
    } else {
      return await summarizeWithHuggingFace(text, options);
    }
  } catch (error) {
    console.error('Summarization error:', error);
    throw error;
  }
}
