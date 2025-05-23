
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ContentHeader from "@/components/Reader/ContentHeader";
import LoadingState from "@/components/Reader/LoadingState";
import NotFoundState from "@/components/Reader/NotFoundState";
import ReaderAlerts from "@/components/Reader/ReaderAlerts";
import RSVPReaderContainer from "@/components/Reader/RSVPReaderContainer";
import { useContentLoader } from "@/hooks/useContentLoader";
import { useSummarization } from "@/hooks/useSummarization";
import { useReaderHistory } from "@/hooks/useReaderHistory";
import ReaderOptions from "@/components/Reader/ReaderOptions";

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

  const { initialPosition, updateHistoryWithSummary, savedWpm } = useReaderHistory(contentId, title, source, content);
  
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

  // Update history with summary when generated
  useEffect(() => {
    if (summary) {
      updateHistoryWithSummary(summary);
    }
  }, [summary]);

  const handleStartReading = (useFull: boolean) => {
    setUseFullText(useFull);
    setShowReader(true);
  };

  const handleRetrySummarization = () => {
    // Clear previous summary and regenerate
    setSummary("");
    handleSummarize(apiKey, useOpenAI);
  };

  // Log saved WPM when it's available
  useEffect(() => {
    if (savedWpm) {
      console.log("Reader detected savedWpm:", savedWpm);
    }
  }, [savedWpm]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!content) {
    return <NotFoundState />;
  }

  if (showReader) {
    return (
      <RSVPReaderContainer
        useFullText={useFullText}
        content={content}
        summary={summary}
        contentId={contentId}
        title={title}
        source={source}
        initialPosition={initialPosition}
        initialWpm={savedWpm} // Pass the saved WPM to the reader
      />
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

        <ReaderAlerts 
          isSimulated={isSimulated} 
          initialPosition={initialPosition} 
          content={content} 
        />

        <ReaderOptions
          apiKey={apiKey}
          useOpenAI={useOpenAI}
          setApiKey={setApiKey}
          setUseOpenAI={setUseOpenAI}
          summary={summary}
          content={content}
          title={title}
          source={source}
          isSummarizing={isSummarizing}
          summarizationProgress={summarizationProgress}
          summarizationError={summarizationError}
          handleSummarize={() => handleSummarize(apiKey, useOpenAI)}
          handleStartReading={handleStartReading}
          handleRetrySummarization={handleRetrySummarization}
        />
      </div>
    </div>
  );
};

export default Reader;
