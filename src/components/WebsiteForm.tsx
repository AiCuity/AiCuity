
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Globe, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const WebsiteForm = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
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
      // Always use the fallback for development when connection fails
      let useFallback = false;
      
      if (!import.meta.env.VITE_API_URL) {
        useFallback = true;
        console.log('Using fallback content extraction (no API URL configured)');
      } else {
        try {
          console.log(`Attempting to connect to ${apiUrl}/api/scrape for URL: ${processedUrl}`);
          
          // Set a timeout for the fetch operation
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${apiUrl}/api/scrape`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: processedUrl }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(errorData.error || 'Failed to extract content');
          }
          
          const data = await response.json();
          console.log('Extracted data:', data);
          
          // Store the extracted content in sessionStorage
          sessionStorage.setItem('readerContent', data.text);
          sessionStorage.setItem('contentTitle', `${data.title || 'Website content'}`);
          sessionStorage.setItem('contentSource', data.sourceUrl || processedUrl);
          
          // Navigate to the reader page
          setIsLoading(false);
          navigate(`/reader/website-${Date.now()}`);
          return;
        } catch (error) {
          console.error('API Error:', error);
          if (error.name === 'AbortError') {
            console.log('Request timed out, using fallback');
          } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
            console.log('Connection error, using fallback');
            setApiError("Could not connect to the API server. Using fallback mode.");
          } else {
            throw error; // Re-throw if it's a different error
          }
          useFallback = true;
        }
      }
      
      // Fallback content extraction
      if (useFallback) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store sample content
        const sampleText = `This is a sample text extracted from ${processedUrl}.\n\n` +
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, " +
          "nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, " +
          "nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.\n\n" +
          "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud " +
          "exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
        
        try {
          let hostname = 'example.com';
          if (processedUrl) {
            hostname = new URL(processedUrl).hostname;
          }
          
          sessionStorage.setItem('readerContent', sampleText);
          sessionStorage.setItem('contentTitle', `Content from ${hostname}`);
          sessionStorage.setItem('contentSource', processedUrl);
          
          toast({
            title: "Using Fallback Mode",
            description: "Connected to sample content as the API server is not available.",
          });
          
          setIsLoading(false);
          navigate(`/reader/website-${Date.now()}`);
        } catch (urlError) {
          console.error('URL parsing error:', urlError);
          throw new Error('Invalid URL format');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to extract content from the website",
        variant: "destructive",
      });
    }
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
      
      <Card className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium mb-2">Popular Examples</h3>
        <div className="space-y-2">
          {["https://en.wikipedia.org/wiki/Speed_reading", 
            "https://www.bbc.com/news/world",
            "https://medium.com/topic/technology"].map((example) => (
            <button
              key={example}
              type="button"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline block"
              onClick={() => setUrl(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </Card>
    </form>
  );
};

export default WebsiteForm;
