
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
    
    // OpenAI API call with improved prompt for better summarization
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional summarizer that creates concise, accurate, and informative summaries. Focus on key points and main ideas.'
          },
          {
            role: 'user',
            content: `Summarize the following text into a well-structured summary with 3-5 paragraphs. Include the main arguments, key points, and important details. Make the summary comprehensive yet concise:\n\n${text}`
          }
        ],
        max_tokens: maxLength,
        temperature: 0.5,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to summarize with OpenAI');
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI summarization error:', error);
    throw error;
  }
}

// Function to summarize text without using external models - Enhanced algorithm
export const summarizeWithFallback = async (
  text: string,
  options: SummarizationOptions = {}
): Promise<string> => {
  try {
    // Split text into chunks to handle token limits
    const chunks = splitTextIntoChunks(text, 1000);
    
    // Enhanced extractive summarization algorithm
    const summary = enhancedExtractiveSummarize(chunks.join(' '), {
      maxLength: options.maxLength || 1200,  // Increased for better quality
      minLength: options.minLength || 400,   // Increased for better quality
    });
    
    return summary;
  } catch (error) {
    console.error('Fallback summarization error:', error);
    throw error;
  }
}

// Enhanced extractive summarization algorithm with more sophisticated sentence selection
const enhancedExtractiveSummarize = (text: string, options: { maxLength: number, minLength: number }): string => {
  // Split text into sentences with improved regex
  const sentences: string[] = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  
  if (sentences.length === 0) {
    return "Unable to generate a summary from the provided text.";
  }
  
  // Calculate TF-IDF score for each word in the text
  const wordFrequencies = calculateWordFrequencies(text);
  
  // Score sentences based on more sophisticated heuristics
  const sentenceScores: Array<[string, number]> = sentences.map((sentence: string): [string, number] => {
    // Base score
    let score = 0;
    
    // 1. Length factor - prefer medium length sentences (not too short, not too long)
    const wordCount = sentence.split(/\s+/).length;
    score += Math.min(wordCount / 10, 3) - Math.max(0, (wordCount - 30) / 10);
    
    // 2. Position score - sentences at the beginning or end of the document are often important
    const position: number = sentences.indexOf(sentence);
    if (position < Math.ceil(sentences.length * 0.15)) {
      // Beginning of text gets higher importance
      score += 3 * (1 - position / (sentences.length * 0.15));
    }
    if (position > sentences.length - Math.ceil(sentences.length * 0.15)) {
      // End of text gets moderate importance
      score += 2 * (1 - (sentences.length - position) / (sentences.length * 0.15));
    }
    
    // 3. Important phrases that often indicate significant content
    const importantPhrases = [
      "important", "significant", "key", "main", "critical", "essential",
      "finally", "conclusion", "summary", "result", "therefore", 
      "consequently", "thus", "hence", "in summary", "to summarize",
      "demonstrates", "illustrates", "reveals", "indicates", "suggests",
      "notably", "remarkably", "surprisingly", "interestingly", "crucially"
    ];
    
    importantPhrases.forEach(phrase => {
      if (sentence.toLowerCase().includes(phrase)) {
        score += 2.5;
      }
    });
    
    // 4. TF-IDF based relevance
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    let tfIdfScore = 0;
    words.forEach(word => {
      if (wordFrequencies[word]) {
        tfIdfScore += wordFrequencies[word];
      }
    });
    score += tfIdfScore / (words.length || 1);
    
    // 5. Bonus for sentences containing numbers, dates, percentages (often key facts)
    if (/\d+%|\d+\.\d+|\b\d{4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(?:st|nd|rd|th)?\b/i.test(sentence)) {
      score += 2;
    }
    
    return [sentence, score];
  });
  
  // Sort sentences by score
  sentenceScores.sort((a, b) => b[1] - a[1]);
  
  // Select top sentences up to the desired length
  let summary = "";
  let currentLength = 0;
  
  // Original positions of sentences for proper ordering
  const selectedSentences: Array<[string, number]> = [];
  
  // Select more sentences for better quality
  for (const [sentence, _score] of sentenceScores) {
    if (currentLength + sentence.length <= options.maxLength || currentLength < options.minLength) {
      const position: number = sentences.indexOf(sentence);
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
  summary = selectedSentences.map((item: [string, number]): string => item[0]).join(' ');
  
  // Post-process the summary to improve readability
  summary = improveReadability(summary);
  
  return summary;
};

// Calculate word frequencies for TF-IDF scoring
const calculateWordFrequencies = (text: string): Record<string, number> => {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordCount: Record<string, number> = {};
  const stopWords = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
    "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's",
    "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm",
    "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't",
    "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
    "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't",
    "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't",
    "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's",
    "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
    "yourselves"
  ]);
  
  // Count frequency of each non-stop word
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 1) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Calculate TF-IDF-like score (simplified)
  const totalWords = words.length;
  const result: Record<string, number> = {};
  
  Object.entries(wordCount).forEach(([word, count]) => {
    // Term frequency normalized by document length
    const tf = count / totalWords;
    
    // Importance increases with frequency but tapers off (log)
    result[word] = Math.log(1 + tf) * 10;
    
    // Boost uncommon but not too rare words (appearing 2-5 times)
    if (count >= 2 && count <= 5) {
      result[word] *= 1.5;
    }
  });
  
  return result;
};

// Improve readability of the summary
const improveReadability = (text: string): string => {
  if (!text) return text;
  
  // Add paragraph breaks for better structure (after approximately every 3-4 sentences)
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  if (sentences.length <= 1) return text;
  
  let paragraphed = "";
  const paragraphSize = Math.max(Math.ceil(sentences.length / 4), 2);
  
  sentences.forEach((sentence, index) => {
    paragraphed += sentence;
    if ((index + 1) % paragraphSize === 0 && index < sentences.length - 1) {
      paragraphed += "\n\n";
    }
  });
  
  return paragraphed;
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
      // Use our enhanced fallback summarization
      return await summarizeWithFallback(text, options);
    }
  } catch (error) {
    console.error('Summarization error:', error);
    throw error;
  }
}
