import { API_BASE } from '@/lib/apiBase';

// Use environment variable for API base URL, with fallback to localhost
export const API_BASE_URL = API_BASE;

export const checkServerHealth = async () => {
  try {
    // For Netlify functions, we'll check a different way since there's no health endpoint
    if (import.meta.env.PROD) {
      // In production, assume Netlify functions are available
      return true;
    }
    
    // In development, check the local server
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.log('Server health check failed:', error);
    return false;
  }
};
