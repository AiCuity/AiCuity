
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { extractContentFromUrl } from "../utils/contentExtractor";
import ContentPreview from "@/components/Reader/ContentPreview";
import WebsiteInput from "./Website/WebsiteInput";
import ExamplesList from "./Website/ExamplesList";
import AlertMessages from "./Website/AlertMessages";
import SubmitButton from "./Website/SubmitButton";

const WebsiteForm = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [isSimulatedContent, setIsSimulatedContent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setPreviewContent("");
    setIsSimulatedContent(false);
    
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    
    // Add http:// if missing
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = 'https://' + url;
    }
    
    setIsLoading(true);

    try {
      console.log(`Extracting content from URL: ${processedUrl}`);
      
      const extractedContent = await extractContentFromUrl(processedUrl);
      
      if (!extractedContent || !extractedContent.content || extractedContent.content.trim() === '') {
        throw new Error("Failed to extract any content from the website.");
      }
      
      // Check if this is simulated content
      const contentIsSimulated = extractedContent.content.includes('simulated content') || 
                               extractedContent.content.includes('⚠️ NOTE:');
      setIsSimulatedContent(contentIsSimulated);
      
      // Show complete preview of extracted content
      setPreviewContent(extractedContent.content);
      
      // Store the extracted content in sessionStorage
      sessionStorage.setItem('readerContent', extractedContent.content);
      sessionStorage.setItem('contentTitle', extractedContent.title || 'Website content');
      sessionStorage.setItem('contentSource', extractedContent.sourceUrl || processedUrl);
      
      const toastMessage = contentIsSimulated 
        ? "Using simulated content because the extraction API couldn't access the website."
        : `Successfully extracted ${extractedContent.content.length} characters of content.`;
      
      toast({
        title: contentIsSimulated ? "Using simulated content" : "Content extracted",
        description: toastMessage,
        variant: contentIsSimulated ? "default" : "default",
      });
      
      // Automatically navigate to the reader page after successful extraction
      const contentId = `website-${Date.now()}`;
      navigate(`/reader/${contentId}`);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setApiError(error instanceof Error ? error.message : "Failed to extract content");
      
      toast({
        title: "Error",
        description: "Failed to extract content from the website. Using fallback mode.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AlertMessages 
        apiError={apiError} 
        isSimulatedContent={isSimulatedContent}
      />
      
      <WebsiteInput url={url} setUrl={setUrl} />
      
      <div className="flex justify-between items-center pt-2">
        <p className="text-sm text-gray-500">
          Enter the URL of the website you want to read
        </p>
        
        <SubmitButton isLoading={isLoading} />
      </div>
      
      {previewContent && (
        <div className="mt-6">
          <ContentPreview content={previewContent} />
        </div>
      )}
      
      <ExamplesList setUrl={setUrl} />
    </form>
  );
};

export default WebsiteForm;
