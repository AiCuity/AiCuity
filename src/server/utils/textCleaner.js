
// Helper functions for text processing
const cleanText = (text) => {
  return text
    // Replace non-printable and control characters
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Replace multiple whitespaces with a single space
    .replace(/\s+/g, ' ')
    // Remove excessive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();
};

module.exports = {
  cleanText
};
