
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

// Function to summarize text without using Hugging Face transformers
// This is a fallback that doesn't rely on external model downloads
export const summarizeWithFallback = async (
  text: string,
  options: SummarizationOptions = {}
): Promise<string> => {
  try {
    // Split text into chunks to handle token limits
    const chunks = splitTextIntoChunks(text, 1000);
    
    // Basic extractive summarization algorithm
    // This is a simple approach that doesn't require external models
    const summary = extractiveSummarize(chunks.join(' '), {
      maxLength: options.maxLength || 500,
      minLength: options.minLength || 200,
    });
    
    return summary;
  } catch (error) {
    console.error('Fallback summarization error:', error);
    throw error;
  }
}

// Simple extractive summarization algorithm
const extractiveSummarize = (text: string, options: { maxLength: number, minLength: number }): string => {
  // Split text into sentences
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  
  if (sentences.length === 0) {
    return "Unable to generate a summary from the provided text.";
  }
  
  // Score sentences based on simple heuristics
  const sentenceScores: [string, number][] = sentences.map(sentence => {
    let score = 0;
    
    // Longer sentences (but not too long) might be more informative
    score += Math.min(sentence.length / 20, 3);
    
    // Sentences that contain common important phrases
    const importantPhrases = [
      "important", "significant", "key", "main", "critical", "essential",
      "finally", "conclusion", "summary", "result", "therefore", 
      "consequently", "thus", "hence", "in summary", "to summarize"
    ];
    
    importantPhrases.forEach(phrase => {
      if (sentence.toLowerCase().includes(phrase)) {
        score += 2;
      }
    });
    
    // Sentences at the beginning or end might be more important
    if (sentences.indexOf(sentence) < Math.ceil(sentences.length * 0.2)) {
      score += 2; // Beginning of text
    }
    
    if (sentences.indexOf(sentence) > sentences.length - Math.ceil(sentences.length * 0.2)) {
      score += 2; // End of text
    }
    
    return [sentence, score];
  });
  
  // Sort sentences by score
  sentenceScores.sort((a, b) => b[1] - a[1]);
  
  // Select top sentences up to the desired length
  let summary = "";
  let currentLength = 0;
  
  // Original positions of sentences for proper ordering
  const selectedSentences: [string, number][] = [];
  
  for (const [sentence, _] of sentenceScores) {
    if (currentLength + sentence.length <= options.maxLength || currentLength < options.minLength) {
      const position = sentences.indexOf(sentence);
      selectedSentences.push([sentence, position]);
      currentLength += sentence.length;
    }
    
    if (currentLength >= options.maxLength && currentLength >= options.minLength) {
      break;
    }
  }
  
  // Sort selected sentences by their original position
  selectedSentences.sort((a, b) => a[1] - b[1]);
  
  // Join sentences back together
  summary = selectedSentences.map(item => item[0].trim()).join(' ');
  
  return summary;
};

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
      // Use our fallback summarization instead of Hugging Face
      return await summarizeWithFallback(text, options);
    }
  } catch (error) {
    console.error('Summarization error:', error);
    throw error;
  }
}
