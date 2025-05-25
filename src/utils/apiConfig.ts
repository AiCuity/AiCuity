
export const API_BASE_URL = import.meta.env.VITE_PROCESSING_SERVER_URL || "http://localhost:5050";

export const checkServerHealth = async () => {
  try {
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
