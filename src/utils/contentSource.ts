const API_BASE = import.meta.env.VITE_API_URL;

// Utility function to extract content from a URL using the processing server
export const fetchActualContent = async (sourceUrl: string) => {
  try {
    console.log(`[contentSource] Fetching actual content from: ${sourceUrl}`);
    console.log(`[contentSource] Using API endpoint: ${API_BASE}/scrape`);
    
    const response = await fetch(`${API_BASE}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: sourceUrl }),
    });

    console.log(`[contentSource] Response status: ${response.status}`);
    console.log(`[contentSource] Response ok: ${response.ok}`);

    // Log non-200 status codes
    if (response.status !== 200) {
      console.log(`[contentSource] NON-200 STATUS CODE: ${response.status} for URL: ${sourceUrl}`);
    }

    if (response.ok) {
      const data = await response.json();
      console.log(`[contentSource] Response data:`, data);
      
      if (data.text && data.text.trim()) {
        console.log(`[contentSource] Successfully fetched ${data.text.length} characters from processing server`);
        return {
          content: data.text,
          title: data.title || 'Fetched Content',
          sourceUrl: sourceUrl
        };
      } else {
        console.log(`[contentSource] Response missing text content`);
        throw new Error('No text content in response');
      }
    } else {
      console.log(`[contentSource] Content extraction returned ${response.status}`);
      throw new Error(`Server returned ${response.status}`);
    }
  } catch (error) {
    console.error('[contentSource] Error fetching content:', error);
    throw error;
  }
};
