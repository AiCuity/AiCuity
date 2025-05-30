import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { processFileLocally, uploadToSupabaseStorage } from '@/lib/fileProcessor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { calculateTotalWords } from "@/hooks/readingHistory/utils/progressUtils";

export const useFileProcessor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [msg, setMsg] = useState<string>();
  const { toast } = useToast();
  const { user } = useAuth();

  const processFile = async (selectedFile: File): Promise<string> => {
    setIsLoading(true);
    setApiError(null);
    setPreviewContent("");
    
    try {
      console.log(`Starting file processing for: ${selectedFile.name}`);
      
      if (!user) {
        throw new Error('User must be authenticated to upload files');
      }

      // 1️⃣ Process the file for text extraction
      console.log(`Processing file: ${selectedFile.name}`);
      const processedData = await processFileLocally(selectedFile, user.id, true);

      // 2️⃣ Upload to Supabase Storage
      console.log('Uploading file to Supabase storage...');
      const uploadData = await uploadToSupabaseStorage(selectedFile, user.id);
      console.log('File uploaded to Supabase storage successfully');

      // 3️⃣ Generate content ID for this upload session and encode storage path
      const contentId = `file_${Date.now()}_${user.id}`;
      
      // Encode the storage path in the contentSource so we can retrieve it later
      const encodedSource = `storage://${uploadData.path}`;
      
      // Calculate total words from the processed text
      const totalWords = calculateTotalWords(processedData.text);
      console.log(`Calculated total words: ${totalWords} for file: ${selectedFile.name}`);
      
      // Note: We don't save to reading_history here to avoid duplicates
      // The reader page will handle saving through the proper reading history system

      // Show success and preview
      setPreviewContent(processedData.text);
      
      // Store the extracted content and metadata in sessionStorage
      sessionStorage.setItem('readerContent', processedData.text);
      sessionStorage.setItem('contentTitle', processedData.originalFilename || selectedFile.name);
      sessionStorage.setItem('contentSource', encodedSource); // Store encoded source with storage path
      sessionStorage.setItem('currentContentId', contentId);
      sessionStorage.setItem('fileStoragePath', uploadData.path); // Store storage path for future retrieval
      sessionStorage.setItem('contentTotalWords', totalWords.toString()); // Store total words
      
      console.log("DEBUG useFileProcessor: Stored in sessionStorage:");
      console.log("  - readerContent length:", processedData.text.length);
      console.log("  - contentTitle:", processedData.originalFilename || selectedFile.name);
      console.log("  - contentSource:", encodedSource);
      console.log("  - currentContentId:", contentId);
      console.log("  - fileStoragePath:", uploadData.path);
      console.log("  - contentTotalWords:", totalWords);
      
      toast({
        title: "File uploaded successfully",
        description: `Successfully processed and extracted ${processedData.text.length} characters of content (${totalWords} words).`,
      });
      
      setMsg(`File uploaded and processed successfully!`);
      
      return contentId;
      
    } catch (error) {
      console.error('Error during file upload:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process the uploaded file";
      setApiError(errorMessage);
      setMsg(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    apiError,
    previewContent,
    msg,
    processFile,
    setMsg,
    setApiError,
    setPreviewContent
  };
};
