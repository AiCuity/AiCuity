const NETLIFY_FUNCTION_URL = '/.netlify/functions/upload-handler';
const NETLIFY_JS_FUNCTION_URL = '/.netlify/functions/upload-handler-js';
const NETLIFY_TEST_FUNCTION_URL = '/.netlify/functions/test-handler';

// Test function to check if Python functions are working
export const testNetlifyFunctions = async () => {
  try {
    console.log('Testing Netlify Python function...');
    
    const response = await fetch(NETLIFY_TEST_FUNCTION_URL, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Test function response:', data);
      return data;
    } else {
      throw new Error(`Test function failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error testing Netlify functions:', error);
    throw error;
  }
};

export const uploadFileToNetlify = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  // Determine which endpoint to use based on file type
  const fileExtension = file.name.toLowerCase().split('.').pop();
  const isTextFile = fileExtension === 'txt';
  
  // For text files, we can use either endpoint, but for others we need Python
  const primaryEndpoint = NETLIFY_FUNCTION_URL;
  const fallbackEndpoint = isTextFile ? NETLIFY_JS_FUNCTION_URL : null;

  const attemptUpload = async (endpoint: string, isRetry = false) => {
    try {
      console.log(`${isRetry ? 'Retry - ' : ''}Uploading file to: ${file.name} (${file.size} bytes)`);
      console.log(`Using endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
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
              if (isRetry) {
                errorMessage = 'Both primary and fallback file processing services are currently unavailable. Please try again later.';
              } else {
                errorMessage = 'Python file processing service is currently unavailable. Attempting fallback...';
              }
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
      console.error(`Error uploading file to ${endpoint}:`, error);
      
      // Provide more specific error messages based on the error type
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Network error: Unable to connect to the file processing service at ${endpoint}. This could be due to:\n• The Netlify function not being deployed\n• Network connectivity issues\n• Server configuration problems`);
      }
      
      if (error instanceof Error && error.message.includes('net::ERR_HTTP2_PROTOCOL_ERROR')) {
        throw new Error('Connection protocol error: The file processing service encountered a communication error. Please try again with a smaller file or contact support.');
      }
      
      throw error;
    }
  };

  try {
    // Try primary endpoint first
    return await attemptUpload(primaryEndpoint);
  } catch (primaryError) {
    console.warn('Primary endpoint failed:', primaryError);
    
    // If we have a fallback and it's a text file, try the JavaScript handler
    if (fallbackEndpoint && isTextFile) {
      console.log('Attempting fallback to JavaScript handler for text file...');
      try {
        return await attemptUpload(fallbackEndpoint, true);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        // Return the more descriptive error from the fallback
        throw fallbackError;
      }
    } else {
      // For non-text files or when no fallback is available
      if (primaryError instanceof Error && primaryError.message.includes('Python file processing service is currently unavailable')) {
        throw new Error(`File processing service is currently unavailable. This file type (.${fileExtension}) requires the Python service which appears to be offline. Please try again later or contact support.`);
      }
      throw primaryError;
    }
  }
};
