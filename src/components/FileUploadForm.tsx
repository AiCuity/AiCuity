import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { UploadButton } from "@/components/upload-button";
import { Progress } from "@/components/ui/progress";
import ContentPreview from "@/components/Reader/ContentPreview";
import { API_BASE_URL } from '../utils/apiConfig';

const FileUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const { toast } = useToast();
  const { upload } = useUpload();

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

    setIsLoading(true);
    setApiError(null);
    setPreviewContent("");

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log(`Uploading file: ${file.name}`);
      
      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to upload file: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.text || data.text.trim() === '') {
        throw new Error("Failed to extract any content from the file.");
      }
      
      // Show complete preview of extracted content
      setPreviewContent(data.text);
      
      // Store the extracted content in sessionStorage
      sessionStorage.setItem('readerContent', data.text);
      sessionStorage.setItem('contentTitle', data.originalFilename || 'Uploaded Content');
      sessionStorage.setItem('contentSource', 'file-upload');
      
      toast({
        title: "File uploaded",
        description: `Successfully extracted ${data.text.length} characters of content.`,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setApiError(error instanceof Error ? error.message : "Failed to upload file");
      
      toast({
        title: "Error",
        description: "Failed to process the uploaded file.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <UploadButton
          onChange={(files) => {
            if (files && files.length > 0) {
              setFile(files[0]);
            }
          }}
        />
        {file && (
          <p className="mt-2 text-sm text-gray-500">
            Selected file: {file.name} ({file.size} bytes)
          </p>
        )}
      </div>
      
      {isLoading && (
        <Progress value={progress} className="h-4" />
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

export default FileUploadForm;
