
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import ContentPreview from "@/components/Reader/ContentPreview";
import { uploadFileToNetlify } from '@/lib/netlifyApi';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const FileUploadNetlify = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [msg, setMsg] = useState<string>();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setMsg('File exceeds 10 MB limit.');
      toast({
        title: "Error",
        description: "File exceeds 10 MB limit.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      setMsg('You must be signed in.');
      toast({
        title: "Error",
        description: "You must be signed in to upload files.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setMsg(undefined);
    setApiError(null);
    setPreviewContent("");

    // Start upload process
    await processFile(selectedFile);
  };

  const processFile = async (selectedFile: File) => {
    setIsLoading(true);
    
    try {
      // 1️⃣ Upload to Supabase Storage
      const fileName = `${user!.id}/${Date.now()}_${selectedFile.name}`;
      const { error: upErr, data } = await supabase.storage
        .from('uploads')
        .upload(fileName, selectedFile);

      if (upErr) {
        setMsg(upErr.message);
        setApiError(upErr.message);
        toast({
          title: "Upload Error",
          description: upErr.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // 2️⃣ Process the file for text extraction using Netlify Functions
      console.log(`Processing uploaded file: ${selectedFile.name}`);
      
      const processedData = await uploadFileToNetlify(selectedFile);

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
        description: "Failed to process the uploaded file.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    await processFile(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          accept=".txt,.pdf,.epub"
          disabled={isLoading}
        />
        {file && (
          <p className="mt-2 text-sm text-gray-500">
            Selected file: {file.name} ({file.size} bytes)
          </p>
        )}
        {msg && (
          <p className={`mt-2 text-sm ${msg.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {msg}
          </p>
        )}
      </div>
      
      {isLoading && (
        <div className="space-y-2">
          <Progress value={50} className="h-4" />
          <p className="text-sm text-gray-500">Processing file...</p>
        </div>
      )}
      
      {apiError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                There was an error processing your file.
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{apiError}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {previewContent && (
        <div className="mt-6">
          <ContentPreview content={previewContent} />
        </div>
      )}
      
      <button
        type="submit"
        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isLoading || !file}
      >
        {isLoading ? "Processing..." : "Upload and Process"}
      </button>
    </form>
  );
};

export default FileUploadNetlify;
