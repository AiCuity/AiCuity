
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const WebsiteForm = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const response = await fetch(`${apiUrl}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: processedUrl }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract content');
      }
      
      const data = await response.json();
      
      // Store the extracted content in sessionStorage
      sessionStorage.setItem('readerContent', data.text);
      sessionStorage.setItem('contentTitle', `${data.title || 'Website content'}`);
      sessionStorage.setItem('contentSource', data.sourceUrl || processedUrl);
      
      // Navigate to the reader page
      navigate(`/reader/website-${Date.now()}`);
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
