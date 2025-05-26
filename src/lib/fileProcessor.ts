
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
      return {
        text: result.text,
        originalFilename: result.originalFilename,
        extractedLength: result.extractedLength
      };
    } catch (error) {
      console.error(`Error processing ${fileExtension.toUpperCase()} file:`, error);
      throw error;
    }
  }
  
  throw new Error(`Unsupported file type: ${fileExtension}`);
};

export const uploadToSupabaseStorage = async (file: File, userId: string) => {
  const fileName = `${userId}/${Date.now()}_${file.name}`;
  
  const { error: uploadError, data } = await supabase.storage
    .from('uploads')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    throw new Error(uploadError.message);
  }

  return data;
};
