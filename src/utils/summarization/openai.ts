
import { SummarizationOptions } from './types';

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
      const errorMessage = error.error?.message || 'Failed to summarize with OpenAI';
      
      // Handle specific error types with more helpful messages
      if (errorMessage.includes('exceeded your current quota') || errorMessage.includes('billing')) {
        throw new Error('OpenAI API quota exceeded or billing issue. Please check your OpenAI account at platform.openai.com.');
      } else if (errorMessage.includes('Invalid API key')) {
        throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI summarization error:', error);
    throw error;
  }
}
