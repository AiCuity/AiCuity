import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ContentPreview from "@/components/Reader/ContentPreview";
import { useAuth } from '@/context/AuthContext';
import { validateFile } from '@/utils/fileValidation';
import { useFileProcessor } from '@/hooks/useFileProcessor';
import FileInput from '@/components/FileUpload/FileInput';
import ProgressDisplay from '@/components/FileUpload/ProgressDisplay';
import ErrorDisplay from '@/components/FileUpload/ErrorDisplay';
import SubmitButton from '@/components/FileUpload/SubmitButton';

const FileUploadNetlify = () => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isLoading,
    apiError,
    previewContent,
    msg,
    processFile,
    setMsg,
    setApiError,
    setPreviewContent
  } = useFileProcessor();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validation = validateFile(selectedFile, user);
    
    if (!validation.isValid) {
      setMsg(validation.error!);
      toast({
        title: "Error",
        description: validation.error!,
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setMsg(undefined);
    setApiError(null);
    setPreviewContent("");
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

    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to upload files",
        variant: "destructive",
      });
      return;
    }

    try {
      const contentId = await processFile(file);
      
      // Navigate to the reader page after successful processing
      navigate(`/reader/${contentId}`);
      
    } catch (error) {
      // Error handling is already done in processFile
      console.error('Error processing file:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">File Upload Information</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Text files (.txt) are processed directly in your browser</p>
          <p>• PDF and EPUB files require server-side processing (coming soon)</p>
          <p>• Files are uploaded to secure Supabase storage</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FileInput
          onFileChange={handleFileChange}
          file={file}
          isLoading={isLoading}
          msg={msg}
        />
        
        <ProgressDisplay isLoading={isLoading} />
        
        <ErrorDisplay apiError={apiError} />
        
        {previewContent && (
          <div className="mt-6">
            <ContentPreview content={previewContent} />
          </div>
        )}
        
        <SubmitButton isLoading={isLoading} hasFile={!!file} />
      </form>
    </div>
  );
};

export default FileUploadNetlify;
