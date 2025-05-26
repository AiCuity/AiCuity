
const NETLIFY_FUNCTION_URL = '/.netlify/functions/upload-handler';

export const uploadFileToNetlify = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log(`Uploading file to Netlify: ${file.name} (${file.size} bytes)`);
    console.log(`Using endpoint: ${NETLIFY_FUNCTION_URL}`);
    
    const response = await fetch(NETLIFY_FUNCTION_URL, {
      method: 'POST',
      body: formData,
    });

    console.log(`Response status: ${response.status}`);

    // Check if response is ok
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `Failed to upload file: ${response.status} ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        
        // Check if it's JSON
        if (errorText.startsWith('{')) {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          // If it's HTML (like an error page), provide a more user-friendly message
          if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
            errorMessage = 'File processing service is currently unavailable. The Netlify function may not be properly deployed or configured.';
          } else {
            errorMessage = errorText || errorMessage;
          }
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    // Parse response
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    // Check if response is JSON
    if (!responseText.startsWith('{')) {
      throw new Error('Server returned invalid response format. Expected JSON but got: ' + responseText.substring(0, 100));
    }
    
    const data = JSON.parse(responseText);
    
    // Validate response data
    if (!data.success) {
      throw new Error(data.error || data.message || 'Unknown error occurred');
    }
    
    if (!data.text || data.text.trim() === '') {
      throw new Error("Failed to extract any content from the file.");
    }

    console.log(`Successfully processed file: ${data.extractedLength} characters extracted`);
    return data;
    
  } catch (error) {
    console.error('Error uploading file to Netlify:', error);
    
    // Provide more specific error messages based on the error type
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to the file processing service. This could be due to:\n• The Netlify function not being deployed\n• Network connectivity issues\n• Server configuration problems\n\nPlease try again or contact support if the issue persists.');
    }
    
    if (error instanceof Error && error.message.includes('net::ERR_HTTP2_PROTOCOL_ERROR')) {
      throw new Error('Connection protocol error: The file processing service encountered a communication error. Please try again with a smaller file or contact support.');
    }
    
    throw error;
  }
};
