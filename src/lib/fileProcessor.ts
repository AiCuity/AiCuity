
import { supabase } from '@/integrations/supabase/client';

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
  
  // For PDF and EPUB files, we'll provide a fallback message
  // since client-side processing of these formats requires additional libraries
  if (fileExtension === 'pdf' || fileExtension === 'epub') {
    const fallbackText = `This is a ${fileExtension.toUpperCase()} file that requires server-side processing. 
    
For now, please try uploading a .txt file or copy and paste the text content directly into the website form instead.

File: ${file.name}
Size: ${file.size} bytes
Type: ${fileExtension.toUpperCase()}

To properly extract text from PDF and EPUB files, we would need server-side processing capabilities.`;
    
    return {
      text: fallbackText,
      originalFilename: file.name,
      extractedLength: fallbackText.length
    };
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
