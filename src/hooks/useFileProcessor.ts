
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { uploadFileToNetlify } from '@/lib/netlifyApi';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useFileProcessor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [msg, setMsg] = useState<string>();
  const { toast } = useToast();
  const { user } = useAuth();

  const processFile = async (selectedFile: File) => {
    setIsLoading(true);
    setApiError(null);
    setPreviewContent("");
    
    try {
      console.log(`Starting file processing for: ${selectedFile.name}`);
      
      // 1️⃣ Upload to Supabase Storage
      const fileName = `${user!.id}/${Date.now()}_${selectedFile.name}`;
      const { error: upErr, data } = await supabase.storage
        .from('uploads')
        .upload(fileName, selectedFile);

      if (upErr) {
        console.error('Supabase upload error:', upErr);
        setMsg(upErr.message);
        setApiError(upErr.message);
        toast({
          title: "Upload Error",
          description: upErr.message,
          variant: "destructive",
        });
        return;
      }

      console.log('File uploaded to Supabase storage successfully');

      // 2️⃣ Process the file for text extraction using Netlify Functions
      console.log(`Processing uploaded file: ${selectedFile.name}`);
      
      const processedData = await uploadFileToNetlify(selectedFile);
      console.log('File processed successfully by Netlify function');

      // 3️⃣ Record in reading history
      const contentId = `file_${Date.now()}_${user!.id}`;
      
      const { error: historyErr } = await supabase
        .from('reading_history')
        .insert({
          user_id: user!.id,
          content_id: contentId,
          title: processedData.originalFilename || selectedFile.name,
          source: data.path, // Store the Supabase storage path
          wpm: 300, // Default WPM
          current_position: 0,
          bytes: selectedFile.size
        });

      if (historyErr) {
        console.error('Error saving to reading history:', historyErr);
        // Don't fail the whole process for this
      }

      // 4️⃣ Increment Stripe usage
      try {
        const { error: fnErr } = await supabase.functions.invoke('record-upload', {
          body: { uid: user!.id }
        });
        
        if (fnErr) {
          console.error('Error recording usage:', fnErr);
          // Don't fail the whole process for this
        }
      } catch (usageError) {
        console.error('Error calling record-upload function:', usageError);
        // Continue without failing
      }

      // Show success and preview
      setPreviewContent(processedData.text);
      
      // Store the extracted content in sessionStorage
      sessionStorage.setItem('readerContent', processedData.text);
      sessionStorage.setItem('contentTitle', processedData.originalFilename || selectedFile.name);
      sessionStorage.setItem('contentSource', 'file-upload');
      
      toast({
        title: "File uploaded successfully",
        description: `Successfully processed and extracted ${processedData.text.length} characters of content.`,
      });
      
      setMsg(`File uploaded and processed successfully!`);
      
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
