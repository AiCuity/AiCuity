
const NETLIFY_FUNCTION_URL = '/.netlify/functions/upload-handler';

export const uploadFileToNetlify = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(NETLIFY_FUNCTION_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to upload file: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.text || data.text.trim() === '') {
      throw new Error("Failed to extract any content from the file.");
    }

    return data;
  } catch (error) {
    console.error('Error uploading file to Netlify:', error);
    throw error;
  }
};
