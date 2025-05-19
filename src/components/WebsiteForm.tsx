import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Globe, AlertTriangle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { extractContentFromUrl } from "../utils/contentExtractor";
import ContentPreview from "@/components/Reader/ContentPreview";

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

  const handleReadContent = () => {
    if (previewContent) {
      navigate(`/reader/website-${Date.now()}`);
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      
      {isSimulatedContent && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Using simulated content</AlertTitle>
          <AlertDescription>
            The content extraction API couldn't access the actual website content.
            This might be due to CORS restrictions or network issues.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="website-url">Website URL</Label>
        <div className="flex">
          <div className="relative flex-grow">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Globe className="h-4 w-4" />
            </div>
            <Input
              id="website-url"
              type="text"
              placeholder="example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="pl-10 w-full"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Enter the URL with or without http(s):// prefix
        </p>
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <p className="text-sm text-gray-500">
          Enter the URL of the website you want to read
        </p>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            "Extract Content"
          )}
        </Button>
      </div>
      
      {previewContent && (
        <div className="mt-6 space-y-4">
          <ContentPreview content={previewContent} />
          
          <div className="flex justify-end">
            <Button onClick={handleReadContent}>
              Read Full Content
            </Button>
          </div>
        </div>
      )}
      
      <Card className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium mb-2">Popular Examples</h3>
        <div className="space-y-2">
          {["https://en.wikipedia.org/wiki/Speed_reading", 
            "https://en.wikipedia.org/wiki/Ninja",
            "https://www.bbc.com/news/world",
            "https://medium.com/topic/technology"].map((example) => (
            <div key={example} className="flex justify-between items-center">
              <button
                type="button"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => setUrl(example)}
              >
                {example}
              </button>
              <button 
                type="button"
                onClick={() => openInNewTab(example)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Open in new tab"
              >
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </form>
  );
};

export default WebsiteForm;
