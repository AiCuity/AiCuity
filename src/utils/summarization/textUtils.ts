
// Function to split text into chunks
export const splitTextIntoChunks = (text: string, maxChunkLength: number = 1000): string[] => {
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
};

// Improve readability of the summary
export const improveReadability = (text: string): string => {
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

// Calculate word frequencies for TF-IDF scoring
export const calculateWordFrequencies = (text: string): Record<string, number> => {
  // Use split and filter instead of match to avoid null when no matches
  const words = text.toLowerCase().split(/\b/).filter(word => /\w+/.test(word));
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
