
import { SummarizationOptions } from './types';
import { splitTextIntoChunks, calculateWordFrequencies, improveReadability } from './textUtils';

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
export const enhancedExtractiveSummarize = (text: string, options: { maxLength: number, minLength: number }): string => {
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
