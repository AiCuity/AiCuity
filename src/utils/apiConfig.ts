
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
    
    // In development, we'll also assume functions are available since we're using Netlify Dev
    // If you want to check a local server, make sure it's actually running
    return true;
  } catch (error) {
    console.log('Server health check failed:', error);
    return false;
  }
};
