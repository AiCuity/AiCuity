
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
  
  // For PDF and EPUB files, try the Netlify function first, then fallback
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
      
      // Provide a fallback message instead of failing completely
      const fallbackText = `Unable to process ${fileExtension.toUpperCase()} file automatically.

File: ${file.name}
Size: ${(file.size / 1024).toFixed(2)} KB
Type: ${fileExtension.toUpperCase()}

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please try:
1. Converting the file to a .txt format
2. Copy and paste the text content directly
3. Check that the file is not corrupted

The file has been uploaded to storage but text extraction failed.`;
      
      return {
        text: fallbackText,
        originalFilename: file.name,
        extractedLength: fallbackText.length
      };
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
