
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RSVPReader from "@/components/RSVPReader";
import SummaryPanel from "@/components/SummaryPanel";
import ApiKeyConfig from "@/components/ApiKeyConfig";
import ContentHeader from "@/components/Reader/ContentHeader";
import ContentPreview from "@/components/Reader/ContentPreview";
import SummarizePrompt from "@/components/Reader/SummarizePrompt";
import LoadingState from "@/components/Reader/LoadingState";
import NotFoundState from "@/components/Reader/NotFoundState";
import { useContentLoader } from "@/hooks/useContentLoader";
import { useSummarization } from "@/hooks/useSummarization";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const Reader = () => {
  const { contentId } = useParams();
  const { content, title, source, isLoading, isSimulated } = useContentLoader(contentId);
  const { 
    summary, 
    isSummarizing, 
    summarizationProgress, 
    summarizationError, 
    handleSummarize,
    setSummary 
  } = useSummarization(content);
  
  const [showReader, setShowReader] = useState(false);
  const [useFullText, setUseFullText] = useState(true);
  const [apiKey, setApiKey] = useState<string>("");
  const [useOpenAI, setUseOpenAI] = useState<boolean>(false);

  // Load API key and preferences from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    const savedUseOpenAI = localStorage.getItem('use_openai') === 'true';
    
    setApiKey(savedApiKey);
    setUseOpenAI(savedUseOpenAI);
  }, []);

  const handleStartReading = (useFull: boolean) => {
    setUseFullText(useFull);
    setShowReader(true);
  };

  const handleRetrySummarization = () => {
    // Clear previous summary and regenerate
    setSummary("");
    handleSummarize(apiKey, useOpenAI);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!content) {
    return <NotFoundState />;
  }

  if (showReader) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <RSVPReader 
          text={useFullText ? content : summary} 
          contentId={contentId || ""} 
          title={title}
          source={source} 
        />
      </div>
    );
  }

  // Create a content object to match the ContentHeader props
  const contentObject = {
    title,
    source,
    url: source?.startsWith('http') ? source : undefined
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ContentHeader content={contentObject} />

        {isSimulated && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Using simulated content. The app couldn't access the actual content from this website.
            </AlertDescription>
          </Alert>
        )}

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
              onRetry={handleRetrySummarization}
            />
          ) : (
            <SummarizePrompt
              onSummarize={() => handleSummarize(apiKey, useOpenAI)} 
              onReadFullText={() => handleStartReading(true)}
              isSummarizing={isSummarizing}
              summarizationError={summarizationError}
            />
          )}
          
          <ContentPreview content={content} />
        </div>
      </div>
    </div>
  );
};

export default Reader;
