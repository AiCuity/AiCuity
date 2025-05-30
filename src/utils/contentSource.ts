import { supabase } from '@/integrations/supabase/client';
import { processFileLocally } from '@/lib/fileProcessor';

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

// Utility function to retrieve file content from Supabase storage
export const fetchFileContentFromStorage = async (storagePath: string) => {
  try {
    console.log(`[contentSource] Fetching file content from storage: ${storagePath}`);
    
    // Strip the storage:// prefix if present
    const cleanPath = storagePath.startsWith('storage://') 
      ? storagePath.replace('storage://', '') 
      : storagePath;
    
    console.log(`[contentSource] Clean storage path: ${cleanPath}`);
    
    // Download the file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('uploads')
      .download(cleanPath);

    if (downloadError) {
      console.error('[contentSource] Error downloading file from storage:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    if (!fileData) {
      throw new Error('No file data received from storage');
    }

    // Convert blob to file and process it
    const fileName = cleanPath.split('/').pop() || 'uploaded-file';
    const file = new File([fileData], fileName, { type: fileData.type });
    
    console.log(`[contentSource] Processing downloaded file: ${fileName}`);
    
    // Process the file to extract text content
    const processedData = await processFileLocally(file);
    
    if (!processedData.text || processedData.text.trim() === '') {
      throw new Error('Failed to extract text content from the stored file');
    }

    console.log(`[contentSource] Successfully extracted ${processedData.text.length} characters from stored file`);
    
    return {
      content: processedData.text,
      title: processedData.originalFilename || fileName,
      sourceUrl: `storage://${cleanPath}`
    };
    
  } catch (error) {
    console.error('[contentSource] Error fetching file content from storage:', error);
    throw error;
  }
};
