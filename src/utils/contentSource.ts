
import { API_BASE_URL } from './apiConfig';

// Utility function to extract content from a URL using the processing server or Netlify function
export const fetchActualContent = async (sourceUrl: string) => {
  try {
    console.log(`Fetching actual content from: ${sourceUrl}`);
    
    // Determine the correct endpoint based on environment
    const endpoint = import.meta.env.PROD 
      ? `${API_BASE_URL}/web-scrape`  // Netlify function
      : `${API_BASE_URL}/api/web/scrape`;  // Local server
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: sourceUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.text && data.text.trim()) {
        console.log(`Successfully fetched ${data.text.length} characters from ${import.meta.env.PROD ? 'Netlify function' : 'processing server'}`);
        return {
          content: data.text,
          title: data.title || 'Fetched Content',
          sourceUrl: sourceUrl
        };
      }
    } else {
      console.log(`Content extraction returned ${response.status}`);
      throw new Error(`Server returned ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};
