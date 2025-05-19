
// Simple scoring for text complexity
export const calculateComplexity = (word: string): number => {
  // Factor 1: Word length (longer words are generally more complex)
  const lengthFactor = Math.max(0, (word.length - 4) / 10);
  
  // Factor 2: Common punctuation that might require slowing down
  const punctuationFactor = /[,.;:?!()]/.test(word) ? 0.2 : 0;
  
  // Factor 3: Rare characters/symbols that might indicate complex words
  const symbolsFactor = /[@#$%^&*_+=\\|<>{}[\]~`]/.test(word) ? 0.3 : 0;
  
  // Factor 4: Capital letters (proper nouns, acronyms) might need more attention
  const capitalizationFactor = isAcronym(word) ? 0.4 : (/[A-Z]/.test(word) && word.length > 1 ? 0.15 : 0);
  
  // Factor 5: Numbers might need more processing time
  const numberFactor = /\d/.test(word) ? 0.15 : 0;
  
  // Factor 6: Technical terms detection
  const technicalTermFactor = isTechnicalTerm(word) ? 0.35 : 0;
  
  // Sum all factors, max complexity score is 1.0
  return Math.min(1.0, lengthFactor + punctuationFactor + symbolsFactor + capitalizationFactor + numberFactor + technicalTermFactor);
};

// Determine if a word is an acronym (all caps or mix of caps and periods)
export const isAcronym = (word: string): boolean => {
  // Check if the word is all uppercase and at least 2 characters long
  if (word.length >= 2 && word === word.toUpperCase() && /[A-Z]/.test(word)) {
    return true;
  }
  
  // Check for acronyms with periods (e.g., U.S.A.)
  if (word.includes('.') && word.replace(/\./g, '').toUpperCase() === word.replace(/\./g, '')) {
    const lettersCount = word.replace(/\./g, '').length;
    return lettersCount >= 2;
  }
  
  return false;
};

// Common technical terms and prefixes/suffixes that might indicate technical content
const technicalPrefixes = ['cyber', 'nano', 'micro', 'crypto', 'neuro', 'bio', 'geo', 'hydro', 'aero', 'thermo', 'electro', 'quantum'];
const technicalSuffixes = ['ology', 'ization', 'metric', 'istic', 'graphic', 'nomics', 'thesis', 'tical'];

// List of common technical domains
const technicalDomains = new Set([
  // Tech & Computing
  'algorithm', 'database', 'interface', 'middleware', 'protocol', 'encryption', 'bandwidth', 'compiler', 'runtime',
  'api', 'sdk', 'css', 'html', 'json', 'xml', 'yaml', 'sql', 'nosql', 'http', 'https', 'tcp', 'udp', 'ip',
  // Science
  'hypothesis', 'theorem', 'coefficient', 'equation', 'molecule', 'isotope', 'neutron', 'electron', 'proton', 'quark',
  // Medicine
  'diagnosis', 'prognosis', 'pathology', 'etiology', 'syndrome'
]);

// Check if a word is likely a technical term
export const isTechnicalTerm = (word: string): boolean => {
  const lowerWord = word.toLowerCase();
  
  // Check against our list of known technical terms
  if (technicalDomains.has(lowerWord)) {
    return true;
  }
  
  // Check for technical prefixes
  for (const prefix of technicalPrefixes) {
    if (lowerWord.startsWith(prefix)) {
      return true;
    }
  }
  
  // Check for technical suffixes
  for (const suffix of technicalSuffixes) {
    if (lowerWord.endsWith(suffix)) {
      return true;
    }
  }
  
  // Check for compound technical words with hyphens
  if (lowerWord.includes('-') && lowerWord.length > 8) {
    return true;
  }
  
  // Complex words with multiple consonants in a row can be technical
  if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(lowerWord)) {
    return true;
  }
  
  return false;
};

// Determine if a word indicates the start of a new sentence or thought
export const isNewSentenceStart = (word: string, previousWord: string | null): boolean => {
  // If previous word ended with terminal punctuation
  if (previousWord && /[.!?]$/.test(previousWord)) {
    return true;
  }
  
  // If current word starts with a capital letter and isn't the first word
  if (previousWord && /^[A-Z]/.test(word) && word.length > 1) {
    return true;
  }
  
  return false;
};

// Calculate slowdown factor for a word
export const getSpeedAdjustmentFactor = (
  word: string, 
  previousWord: string | null, 
  baseWpm: number
): number => {
  const complexity = calculateComplexity(word);
  
  // Apply additional slowdown for the start of new sentences
  const sentenceStartFactor = isNewSentenceStart(word, previousWord) ? 0.3 : 0;
  
  // Additional slowdown for acronyms
  const acronymFactor = isAcronym(word) ? 0.25 : 0;
  
  // Calculate final slowdown factor (0 = no slowdown, 1 = max slowdown)
  const slowdownFactor = complexity + sentenceStartFactor + acronymFactor;
  
  // Convert slowdown factor to a speed adjustment multiplier (between 0.3 and 1.0)
  // Higher complexity = lower multiplier = slower speed
  const speedMultiplier = 1 - (slowdownFactor * 0.7);
  
  return Math.max(0.3, speedMultiplier);
};
