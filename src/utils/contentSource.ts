import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { API_BASE_URL } from './apiConfig';

// Utility function to extract content from a URL using the processing server
export const fetchActualContent = async (sourceUrl: string) => {
  try {
    console.log(`Fetching actual content from: ${sourceUrl}`);
    
    // Try the processing server first
    const response = await fetch(`${API_BASE_URL}/api/web/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: sourceUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.text && data.text.trim()) {
        console.log(`Successfully fetched ${data.text.length} characters from processing server`);
        return {
          content: data.text,
          title: data.title || 'Fetched Content',
          sourceUrl: sourceUrl
        };
      }
    } else {
      console.log(`Processing server returned ${response.status}, trying fallback methods`);
    }
  } catch (error) {
    console.log('Processing server unavailable, trying fallback methods:', error);
  }

  try {
    console.log(`Falling back to client-side extraction for: ${sourceUrl}`);
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const dom = new JSDOM(html, { url: sourceUrl });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article) {
      console.log(`Successfully extracted content client-side`);
      return {
        content: article.textContent,
        title: article.title,
        sourceUrl: sourceUrl
      };
    } else {
      throw new Error('Failed to parse document with Readability.');
    }
  } catch (error) {
    console.error('Error fetching or parsing content:', error);
    return null;
  }
};
