
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

const Reader = () => {
  const { contentId } = useParams();
  const { content, title, source, isLoading } = useContentLoader(contentId);
  const { 
    summary, 
    isSummarizing, 
    summarizationProgress, 
    summarizationError, 
    handleSummarize 
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ContentHeader title={title} source={source} />

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
              onRetry={() => handleSummarize(apiKey, useOpenAI)}
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
