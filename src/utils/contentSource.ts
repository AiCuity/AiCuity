
import { API_BASE_URL } from './apiConfig';

// Utility function to extract content from a URL using the processing server
export const fetchActualContent = async (sourceUrl: string) => {
  try {
    console.log(`Fetching actual content from: ${sourceUrl}`);
    
    // Use the processing server for content extraction
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
      console.log(`Processing server returned ${response.status}`);
      throw new Error(`Server returned ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching content from processing server:', error);
    throw error;
  }
};
