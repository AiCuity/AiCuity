// JavaScript backup for upload handler - handles text files and basic processing
import { parse } from 'qs';

export async function handler(event) {
  console.log('[upload-handler-js] Function started');

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      console.log('[upload-handler-js] Handling OPTIONS request');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'CORS preflight successful' })
      };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      console.log('[upload-handler-js] Method not allowed:', event.httpMethod);
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed. Only POST requests are supported.' })
      };
    }

    if (!event.body) {
      console.log('[upload-handler-js] ERROR: No request body');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No request body provided' })
      };
    }

    // Get content type
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    console.log('[upload-handler-js] Content-Type:', contentType);

    if (!contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Content-Type must be multipart/form-data' })
      };
    }

    // Get the body (base64 encoded in Netlify)
    let body = event.body;
    const isBase64 = event.isBase64Encoded;

    console.log('[upload-handler-js] Body length:', body.length, 'isBase64Encoded:', isBase64);

    if (isBase64) {
      try {
        body = Buffer.from(body, 'base64');
        console.log('[upload-handler-js] Decoded body length:', body.length);
      } catch (decodeError) {
        console.log('[upload-handler-js] Base64 decode error:', decodeError);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Failed to decode base64 body: ${decodeError.message}` })
        };
      }
    } else {
      body = Buffer.from(body, 'utf8');
    }

    // Extract boundary from content type
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) {
      console.log('[upload-handler-js] No boundary found');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No boundary found in Content-Type header' })
      };
    }
    
    const boundary = boundaryMatch[1];
    console.log('[upload-handler-js] Boundary:', boundary);

    // Parse multipart data
    const parts = body.toString('binary').split(`--${boundary}`);
    console.log('[upload-handler-js] Found parts:', parts.length);

    let fileData = null;
    let filename = null;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.includes('Content-Disposition: form-data') && part.includes('filename=')) {
        try {
          console.log('[upload-handler-js] Processing part', i);
          
          // Extract filename
          const filenameMatch = part.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
            console.log('[upload-handler-js] Found filename:', filename);
          }

          // Extract file data (after double CRLF)
          const dataStart = part.indexOf('\r\n\r\n');
          const dataEnd = part.lastIndexOf('\r\n');
          
          if (dataStart !== -1 && dataEnd > dataStart) {
            const rawData = part.substring(dataStart + 4, dataEnd);
            fileData = Buffer.from(rawData, 'binary');
            console.log('[upload-handler-js] File data length:', fileData.length);
            break;
          }
        } catch (parseError) {
          console.log('[upload-handler-js] Parse error for part', i, ':', parseError);
          continue;
        }
      }
    }

    if (!fileData || !filename) {
      console.log('[upload-handler-js] No file uploaded or filename missing');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file uploaded or filename missing' })
      };
    }

    // Determine file type
    const fileExtension = filename.toLowerCase().split('.').pop();
    console.log('[upload-handler-js] File extension:', fileExtension);

    let extractedText = '';

    try {
      if (fileExtension === 'txt') {
        // Process text file
        extractedText = fileData.toString('utf8')
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .trim();
        
        console.log('[upload-handler-js] Successfully processed text file, length:', extractedText.length);
      } else {
        // For other file types, return an error suggesting to use the Python handler
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: `File type .${fileExtension} is not supported by the JavaScript handler. Please ensure the Python handler is properly configured for .epub and .pdf files.`,
            supportedTypes: ['.txt'],
            filename: filename
          })
        };
      }
    } catch (processingError) {
      console.log('[upload-handler-js] Processing error:', processingError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to process file',
          details: processingError.message,
          filename: filename,
          file_type: fileExtension
        })
      };
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 10) {
      console.log('[upload-handler-js] Insufficient text extracted:', extractedText.trim().length, 'characters');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Insufficient text content extracted from file',
          details: `Only ${extractedText.trim().length} characters extracted`,
          filename: filename
        })
      };
    }

    // Return the extracted text
    const responseData = {
      success: true,
      text: extractedText,
      originalFilename: filename,
      extractedLength: extractedText.length,
      message: `Successfully processed ${filename} using JavaScript handler`,
      handler: 'javascript'
    };

    console.log('[upload-handler-js] Success! Returning', extractedText.length, 'characters');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.error('[upload-handler-js] Unexpected error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message,
        message: 'An unexpected error occurred while processing the file'
      })
    };
  }
} 