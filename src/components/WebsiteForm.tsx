
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const WebsiteForm = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    
    setIsLoading(true);
    
    try {
      // In a full implementation, we would call the backend API to scrape the website
      // For now, we'll navigate to the reader page with a mock content ID
      setTimeout(() => {
        // This simulates the API call delay
        setIsLoading(false);
        navigate(`/reader/website-${Date.now()}`);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to extract content from the website",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="website-url">Website URL</Label>
        <Input
          id="website-url"
          type="url"
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="w-full"
        />
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
