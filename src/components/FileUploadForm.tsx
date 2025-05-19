
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, File, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileProcessingResult } from "@/utils/types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FileUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if the server is running when component mounts
  useState(() => {
    checkServerStatus();
  });

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/health`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      
      if (response.ok) {
        console.log("Server is online");
        setServerStatus('online');
      } else {
        console.error("Server returned an error", response.status);
        setServerStatus('offline');
      }
    } catch (error) {
      console.error("Server appears to be offline:", error);
      setServerStatus('offline');
    }
  };

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
    // Clear any previous errors
    setUploadError(null);
    
    const validTypes = ['application/pdf', 'text/plain', 'application/epub+zip'];
    const validExtensions = ['.pdf', '.txt', '.epub'];
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    console.log("File type:", fileType);
    
    // Check the file extension
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    // Check for EPUB files with different MIME types
    const isEpub = fileType === 'application/epub+zip' || 
                  fileName.endsWith('.epub') || 
                  fileType === 'application/octet-stream'; // Some systems might send EPUB as octet-stream
                  
    if (!validTypes.includes(fileType) && !hasValidExtension && !isEpub) {
      const errorMsg = "Please upload a PDF, TXT, or EPUB file";
      setUploadError(errorMsg);
      toast({
        title: "Invalid file type",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      const errorMsg = "File size exceeds the 50MB limit";
      setUploadError(errorMsg);
      toast({
        title: "File too large",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    setFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (serverStatus === 'offline') {
      setUploadError("The server appears to be offline. Please check if the backend server is running.");
      toast({
        title: "Server offline",
        description: "Cannot connect to the processing server. Please check if the backend server is running.",
        variant: "destructive",
      });
      return;
    }
    
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
    setUploadError(null);
    
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
          try {
            const response = JSON.parse(xhr.responseText) as FileProcessingResult;
            
            if (!response.success || !response.text) {
              const errorMsg = response.error || "Failed to process the file";
              handleUploadError(new Error(errorMsg));
              return;
            }
            
            // Store the extracted text in sessionStorage to use in the Reader
            sessionStorage.setItem('readerContent', response.text);
            sessionStorage.setItem('contentTitle', response.originalFilename);
            
            toast({
              title: "Upload successful",
              description: "Your file has been processed successfully",
            });
            
            // Navigate to the reader page with a unique content ID
            navigate(`/reader/file-${Date.now()}`);
          } catch (parseError) {
            handleUploadError(new Error('Failed to parse server response'));
          }
        } else {
          let errorMessage = 'Upload failed';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error || errorResponse.details || errorMessage;
          } catch (e) {
            // If we can't parse the response, use the default error message
          }
          handleUploadError(new Error(`${errorMessage} (Status: ${xhr.status})`));
        }
      };
      
      xhr.onerror = function() {
        handleUploadError(new Error('Network error during upload. Please check if the server is running.'));
        // Mark server as offline
        setServerStatus('offline');
      };
      
      xhr.onabort = function() {
        handleUploadError(new Error('Upload aborted'));
      };
      
      xhr.timeout = 30000; // 30 second timeout
      xhr.ontimeout = function() {
        handleUploadError(new Error('Request timed out. The server might be busy or offline.'));
        // Mark server as offline
        setServerStatus('offline');
      };
      
      console.log(`Uploading to ${API_URL}/api/upload`);
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
    setUploadError(error.message);
    
    toast({
      title: "Upload failed",
      description: error.message || "Failed to upload and process the file. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverStatus === 'offline' && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Server Connection Issue</AlertTitle>
          <AlertDescription>
            Unable to connect to the processing server. Please make sure the backend server is running at {API_URL}.
            If you're running locally, check that the server has started with <code>npm run server</code> in a separate terminal.
          </AlertDescription>
        </Alert>
      )}
      
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Maximum file size: 50MB
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
              onClick={() => {
                setFile(null);
                setUploadError(null);
              }}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
      
      {uploadError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
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
        <Button type="submit" disabled={!file || isLoading || serverStatus === 'offline'}>
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
