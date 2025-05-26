
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
  
  // For PDF and EPUB files, use the Netlify function
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
      
      // Re-throw the error so the UI can handle it properly
      throw error;
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
