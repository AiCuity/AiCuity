
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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

    await processFile(file);
  };

  return (
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
  );
};

export default FileUploadNetlify;
