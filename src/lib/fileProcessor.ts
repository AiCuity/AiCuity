import { supabase } from '@/integrations/supabase/client';
import { uploadFileToNetlify, uploadFileToBackend } from '@/lib/netlifyApi';

export interface ProcessedFileData {
  text: string;
  originalFilename: string;
  extractedLength: number;
}

/**
 * Process uploaded files locally or via backend API
 * @param file - The file to process
 * @param userId - The user ID (optional) for usage tracking
 * @param incrementUsage - Whether to increment usage count (default: true)
 *   - true: When user clicks "Upload File" button (new content)
 *   - false: When reprocessing existing files from storage
 */
export const processFileLocally = async (file: File, userId?: string, incrementUsage: boolean = true): Promise<ProcessedFileData> => {
  console.log(`Processing file: ${file.name}, userId: ${userId}, incrementUsage: ${incrementUsage}`);
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (fileExtension === 'txt') {
    // For text files, we still process locally since it's simple and fast
    // But we manually increment usage if needed
    const text = await file.text();
    
    // Increment usage for text files if user is authenticated and incrementUsage is true
    if (userId && incrementUsage) {
      try {
        console.log(`Incrementing usage for text file processing, user: ${userId}`);
        // Use the backend API to increment usage
        await fetch(`${import.meta.env.VITE_API_URL}/subscription/increment-usage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        console.log('Successfully incremented usage for text file');
      } catch (usageError) {
        console.error('Error incrementing usage for text file:', usageError);
        // Don't fail the file processing if usage tracking fails
      }
    }
    
    return {
      text: text.trim(),
      originalFilename: file.name,
      extractedLength: text.length
    };
  }
  
  // For PDF and EPUB files, try to use the backend API first (which handles usage tracking)
  // Fall back to Netlify function if backend is not available
  if (fileExtension === 'pdf' || fileExtension === 'epub') {
    console.log(`Processing ${fileExtension.toUpperCase()} file via backend API`);
    
    try {
      // Try backend API first (supports usage tracking)
      const result = await uploadFileToBackend(file, userId, incrementUsage);
      console.log(`Successfully extracted ${result.extractedLength} characters from ${fileExtension.toUpperCase()} via backend API`);
      return {
        text: result.text,
        originalFilename: result.originalFilename,
        extractedLength: result.extractedLength
      };
    } catch (backendError) {
      console.warn(`Backend API failed for ${fileExtension.toUpperCase()} file, falling back to Netlify:`, backendError);
      
      try {
        // Fallback to Netlify function (without direct usage tracking)
        const result = await uploadFileToNetlify(file, userId, incrementUsage);
        console.log(`Successfully extracted ${result.extractedLength} characters from ${fileExtension.toUpperCase()} via Netlify function`);
        
        // Manually increment usage since Netlify function doesn't handle it
        if (userId && incrementUsage) {
          try {
            console.log(`Manually incrementing usage after Netlify processing, user: ${userId}`);
            await fetch(`${import.meta.env.VITE_API_URL}/subscription/increment-usage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId }),
            });
            console.log('Successfully incremented usage after Netlify processing');
          } catch (usageError) {
            console.error('Error incrementing usage after Netlify processing:', usageError);
            // Don't fail the file processing if usage tracking fails
          }
        }
        
        return {
          text: result.text,
          originalFilename: result.originalFilename,
          extractedLength: result.extractedLength
        };
      } catch (netlifyError) {
        console.error(`Both backend API and Netlify function failed for ${fileExtension.toUpperCase()} file:`, netlifyError);
        throw netlifyError;
      }
    }
  }
  
  throw new Error(`Unsupported file type: ${fileExtension}. Supported formats: .txt, .pdf, .epub`);
};

export const uploadToSupabaseStorage = async (file: File, userId: string) => {
  console.log(`Uploading ${file.name} to Supabase storage for user ${userId}`);
  
  const fileName = `${userId}/${Date.now()}_${file.name}`;
  
  const { error: uploadError, data } = await supabase.storage
    .from('uploads')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Supabase storage upload error:', uploadError);
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  console.log(`File successfully uploaded to Supabase storage: ${data.path}`);
  return data;
};
