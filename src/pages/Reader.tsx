
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RSVPReader from "@/components/RSVPReader";
import SummaryPanel from "@/components/SummaryPanel";
import ApiKeyConfig from "@/components/ApiKeyConfig";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Text } from "lucide-react";
import { summarizeText, SummarizationOptions } from "@/utils/summarization";

const Reader = () => {
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizationProgress, setSummarizationProgress] = useState(0);
  const [showReader, setShowReader] = useState(false);
  const [useFullText, setUseFullText] = useState(true);
  const [apiKey, setApiKey] = useState<string>("");
  const [useOpenAI, setUseOpenAI] = useState<boolean>(false);
  const [summarizationError, setSummarizationError] = useState<string | null>(null);
  
  const { contentId } = useParams();
  const { toast } = useToast();

  // Load API key and preferences from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    const savedUseOpenAI = localStorage.getItem('use_openai') === 'true';
    
    setApiKey(savedApiKey);
    setUseOpenAI(savedUseOpenAI);
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      
      try {
        if (contentId?.startsWith('file-')) {
          // For file uploads, get content from sessionStorage
          const storedContent = sessionStorage.getItem('readerContent');
          const storedTitle = sessionStorage.getItem('contentTitle') || 'Uploaded document';
          
          if (storedContent) {
            setContent(storedContent);
            setTitle(storedTitle);
          } else {
            toast({
              title: "Content not found",
              description: "The requested content could not be loaded.",
              variant: "destructive",
            });
          }
        } else if (contentId?.startsWith('website-')) {
          // For website content
          const storedContent = sessionStorage.getItem('readerContent');
          const storedTitle = sessionStorage.getItem('contentTitle') || 'Website content';
          const storedSource = sessionStorage.getItem('contentSource') || '';
          
          if (storedContent) {
            setContent(storedContent);
            setTitle(storedTitle);
            setSource(storedSource);
          } else {
            toast({
              title: "Content not found",
              description: "The requested website content could not be loaded.",
              variant: "destructive",
            });
          }
        } else {
          // For other content types
          toast({
            title: "Unknown content type",
            description: "The requested content type is not supported.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        toast({
          title: "Error loading content",
          description: "Failed to load the requested content.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [contentId, toast]);

  const handleSummarize = async () => {
    if (!content) return;
    
    setIsSummarizing(true);
    setSummarizationError(null);
    setSummarizationProgress(0);
    
    // Mock progress updates (since we can't get actual progress from the models)
    const progressInterval = setInterval(() => {
      setSummarizationProgress(prev => {
        const newProgress = prev + Math.random() * 5;
        return newProgress >= 95 ? 95 : newProgress;
      });
    }, 300);
    
    try {
      const options: SummarizationOptions = {
        maxLength: 500,
        minLength: 100,
        apiKey,
        useOpenAI,
      };
      
      const result = await summarizeText(content, options);
      setSummary(result);
      setSummarizationProgress(100);
      
      toast({
        title: "Summary generated",
        description: "Text has been successfully summarized.",
      });
    } catch (error) {
      console.error("Summarization error:", error);
      setSummarizationError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Summarization failed",
        description: "Failed to generate a summary. Please try again.",
        variant: "destructive",
      });
      setSummarizationProgress(0);
    } finally {
      clearInterval(progressInterval);
      setIsSummarizing(false);
    }
  };

  const handleStartReading = (useFull: boolean) => {
    setUseFullText(useFull);
    setShowReader(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading content...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Content Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested content could not be loaded. Please try uploading your file or entering a URL again.
          </p>
        </div>
      </div>
    );
  }

  if (showReader) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <RSVPReader 
          text={useFullText ? content : summary} 
          contentId={contentId || ""} 
          title={`${useFullText ? '' : '[Summary] '}${title}`}
          source={source} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
          {source && (
            <a 
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Source: {source}
            </a>
          )}
        </div>

        <div className="space-y-6">
          <ApiKeyConfig 
            apiKey={apiKey}
            useOpenAI={useOpenAI}
            onApiKeyChange={setApiKey}
            onUseOpenAIChange={setUseOpenAI}
          />
          
          {summary ? (
            <SummaryPanel
              summary={summary}
              fullText={content}
              title={title}
              source={source}
              isLoading={isSummarizing}
              progress={summarizationProgress}
              onStartReading={handleStartReading}
              onRetry={handleSummarize}
            />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex flex-col items-center justify-center gap-4">
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Generate a summary of this content for faster reading.
                  {summarizationError && (
                    <span className="block text-red-500 mt-2">
                      Error: {summarizationError}
                    </span>
                  )}
                </p>
                <Button 
                  onClick={handleSummarize} 
                  disabled={isSummarizing}
                  size="lg"
                >
                  {isSummarizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Text className="mr-2 h-5 w-5" />
                      Summarize Text
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleStartReading(true)}
                >
                  Skip and Read Full Text
                </Button>
              </div>
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Content Preview</h2>
            <div className="max-h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="whitespace-pre-line text-sm">
                {content.substring(0, 1000)}
                {content.length > 1000 && '...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reader;
