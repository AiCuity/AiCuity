
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, File, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FileUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['application/pdf', 'text/plain', 'application/epub+zip'];
    const fileType = file.type;
    
    if (!validTypes.includes(fileType)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, TXT, or EPUB file",
        variant: "destructive",
      });
      return;
    }
    
    setFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          
          // Store the extracted text in sessionStorage to use in the Reader
          sessionStorage.setItem('readerContent', response.text);
          sessionStorage.setItem('contentTitle', response.originalFilename);
          
          toast({
            title: "Upload successful",
            description: "Your file has been processed successfully",
          });
          
          // Navigate to the reader page with a unique content ID
          navigate(`/reader/file-${Date.now()}`);
        } else {
          handleUploadError(new Error(`Upload failed with status ${xhr.status}`));
        }
      };
      
      xhr.onerror = function() {
        handleUploadError(new Error('Network error during upload'));
      };
      
      xhr.onabort = function() {
        handleUploadError(new Error('Upload aborted'));
      };
      
      xhr.open('POST', `${API_URL}/api/upload`, true);
      xhr.send(formData);
    } catch (error) {
      handleUploadError(error as Error);
    }
  };
  
  const handleUploadError = (error: Error) => {
    setIsLoading(false);
    setUploadProgress(0);
    
    console.error("Upload error:", error);
    
    toast({
      title: "Upload failed",
      description: "Failed to upload and process the file. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Upload Document</Label>
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
              : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.txt,.epub"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag & drop your PDF, TXT, or EPUB file here, or click to browse
            </p>
          </div>
        </div>
        
        {file && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <File className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => setFile(null)}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
      
      {isLoading && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
            {uploadProgress}% Uploaded
          </p>
        </div>
      )}
      
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={!file || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadProgress >= 100 ? 'Processing...' : 'Uploading...'}
            </>
          ) : (
            "Upload & Process"
          )}
        </Button>
      </div>
    </form>
  );
};

export default FileUploadForm;
