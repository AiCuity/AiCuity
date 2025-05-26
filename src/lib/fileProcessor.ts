
import { supabase } from '@/integrations/supabase/client';
import { uploadFileToNetlify } from '@/lib/netlifyApi';

export interface ProcessedFileData {
  text: string;
  originalFilename: string;
  extractedLength: number;
}

export const processFileLocally = async (file: File): Promise<ProcessedFileData> => {
  console.log(`Processing file locally: ${file.name}`);
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (fileExtension === 'txt') {
    const text = await file.text();
    return {
      text: text.trim(),
      originalFilename: file.name,
      extractedLength: text.length
    };
  }
  
  // For PDF and EPUB files, try the Netlify function with better error handling
  if (fileExtension === 'pdf' || fileExtension === 'epub') {
    console.log(`Processing ${fileExtension.toUpperCase()} file via Netlify function`);
    try {
      const result = await uploadFileToNetlify(file);
      console.log(`Successfully extracted ${result.extractedLength} characters from ${fileExtension.toUpperCase()}`);
      return {
        text: result.text,
        originalFilename: result.originalFilename,
        extractedLength: result.extractedLength
      };
    } catch (error) {
      console.error(`Error processing ${fileExtension.toUpperCase()} file:`, error);
      
      // Provide a helpful fallback message with the specific error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const fallbackText = `Unable to process ${fileExtension.toUpperCase()} file: ${file.name}

Error Details: ${errorMessage}

File Information:
• Name: ${file.name}
• Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
• Type: ${fileExtension.toUpperCase()}

Possible Solutions:
1. Try converting the file to a .txt format first
2. Use a different file if possible
3. Check if the file is corrupted
4. Ensure the file is not password protected

The file upload to storage was attempted but text extraction failed due to the processing service being unavailable.`;
      
      return {
        text: fallbackText,
        originalFilename: file.name,
        extractedLength: fallbackText.length
      };
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
