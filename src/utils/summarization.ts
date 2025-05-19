
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
      'facebook/bart-large-cnn',
      { quantized: true } // Use quantized model for better performance
    );
    
    // Process each chunk
    for (const chunk of chunks) {
      if (chunk.trim().length === 0) continue;
      
      const result = await summarizer(chunk, {
        max_length: options.maxLength || 130,
        min_length: options.minLength || 30,
        do_sample: false
      });
      
      if (Array.isArray(result) && result.length > 0) {
        summaries.push(result[0].summary_text);
      } else if (typeof result === 'object') {
        summaries.push(result.summary_text);
      }
    }
    
    // Combine all summaries into one
    let combinedSummary = summaries.join(' ');
    
    // If we have multiple chunks, summarize the combined summary again for coherence
    if (summaries.length > 1 && combinedSummary.length > 1000) {
      const finalResult = await summarizer(combinedSummary, {
        max_length: options.maxLength || 150,
        min_length: options.minLength || 50,
        do_sample: false
      });
      
      if (Array.isArray(finalResult) && finalResult.length > 0) {
        combinedSummary = finalResult[0].summary_text;
      } else if (typeof finalResult === 'object') {
        combinedSummary = finalResult.summary_text;
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
