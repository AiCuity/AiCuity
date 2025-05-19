
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
      
      // Enhanced fallback content extraction
      if (useFallback) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        try {
          // Extract hostname for more meaningful fallback content
          let hostname = 'example.com';
          let path = '';
          let title = 'Content';
          
          if (processedUrl) {
            const urlObj = new URL(processedUrl);
            hostname = urlObj.hostname;
            path = urlObj.pathname;
            title = hostname + (path !== '/' ? path : '');
          }
          
          // Generate more meaningful fallback content based on the URL
          const sampleText = generateFallbackContent(hostname, path);
          
          sessionStorage.setItem('readerContent', sampleText);
          sessionStorage.setItem('contentTitle', `Content from ${title}`);
          sessionStorage.setItem('contentSource', processedUrl);
          
          toast({
            title: "Using Fallback Mode",
            description: "Connected to generated content as the API server is not available.",
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
  
  // Function to generate more meaningful fallback content based on URL
  const generateFallbackContent = (hostname: string, path: string): string => {
    const topics: Record<string, string> = {
      'wikipedia.org': `# Wikipedia Article
      
This is simulated content for a Wikipedia article. Wikipedia is a free online encyclopedia created and edited by volunteers around the world.

## Introduction
Wikipedia is a multilingual free online encyclopedia written and maintained by a community of volunteers, known as Wikipedians, through open collaboration and using a wiki-based editing system. Wikipedia is the largest and most-read reference work in history.

## Features
- Free content that anyone can edit
- Neutral point of view
- Verifiable information
- Multiple language editions
- Volunteer-driven content creation

## Usage
Wikipedia is widely used for research, education, and general knowledge. It's one of the most visited websites globally, with millions of articles spanning various subjects including history, science, arts, and current events.

## Reliability
While anyone can edit Wikipedia, the platform has developed robust mechanisms to maintain accuracy, including:
- Citation requirements
- Editorial oversight
- Vandalism detection
- Community peer review`,

      'bbc.com': `# BBC News
      
This is simulated content for a BBC News article.

## Headlines Today
- Global leaders meet to discuss climate change initiatives
- Economic outlook shows mixed signals for upcoming quarter
- Sports teams prepare for international championship
- Technology companies announce new product innovations
- Healthcare advances promise treatment breakthroughs

## Featured Article
The world's leading climate scientists have warned that global efforts to reduce carbon emissions are falling significantly short of targets needed to prevent catastrophic warming. According to the latest report, countries would need to triple their current commitments to limit warming to the internationally agreed threshold.

Environmental ministers from several nations have convened an emergency meeting to address these concerns and discuss potential solutions, including accelerated renewable energy adoption and stronger regulatory frameworks for high-emission industries.`,

      'medium.com': `# Medium Article
      
This is simulated content for a Medium technology article.

## The Future of AI Development
      
Artificial intelligence continues to evolve at a remarkable pace, transforming industries and creating new possibilities that were once confined to science fiction. As we navigate this rapidly changing landscape, it's crucial to understand both the technical advancements and their broader implications.

### Key Developments

**Foundation Models**
The emergence of large foundation models has revolutionized how we approach AI development. These models, trained on vast datasets using self-supervised learning techniques, demonstrate remarkable capabilities across various domains without task-specific training.

**Multimodal Learning**
Modern AI systems increasingly work across different forms of data - processing text, images, audio, and video in an integrated manner. This multimodal approach brings us closer to AI systems that can perceive the world more like humans do.

**Responsible AI**
As AI becomes more powerful, ensuring it operates according to human values becomes increasingly important. Researchers are developing methods to align AI systems with human preferences and make their decision-making processes more transparent and explainable.`,

      'default': `# Website Content
      
This is simulated content for ${hostname}${path}.

## Introduction
This is a placeholder text for content that would normally be extracted from the website you requested. Due to connection issues with our content extraction service, we're showing this generated text instead.

## Content
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.

## About This Website
The website you requested (${hostname}) appears to be about general information. This fallback content is generated when we cannot connect to our content extraction service. You can try again later or try a different URL.`
    };
    
    // Choose content based on hostname or use default
    for (const [domain, content] of Object.entries(topics)) {
      if (hostname.includes(domain)) {
        return content;
      }
    }
    
    return topics.default;
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
