
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ContentHeader from "@/components/Reader/ContentHeader";
import LoadingState from "@/components/Reader/LoadingState";
import NotFoundState from "@/components/Reader/NotFoundState";
import ReaderAlerts from "@/components/Reader/ReaderAlerts";
import ContentContainer from "@/components/Reader/ContentContainer";
import RSVPReaderContainer from "@/components/Reader/RSVPReaderContainer";
import ThemeToggle from "@/components/ui/theme-toggle";
import { useContentLoader } from "@/hooks/useContentLoader";
import { useSummarization } from "@/hooks/useSummarization";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";

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
  const { profile } = useProfile();
  const { user } = useAuth();
  const { saveHistoryEntry, history } = useReadingHistory();
  
  const [showReader, setShowReader] = useState(false);
  const [useFullText, setUseFullText] = useState(true);
  const [apiKey, setApiKey] = useState<string>("");
  const [useOpenAI, setUseOpenAI] = useState<boolean>(false);
  const [historySaved, setHistorySaved] = useState(false);
  const [initialPosition, setInitialPosition] = useState(0);

  // Load API key and preferences from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    const savedUseOpenAI = localStorage.getItem('use_openai') === 'true';
    
    setApiKey(savedApiKey);
    setUseOpenAI(savedUseOpenAI);
  }, []);

  // Check for existing reading position
  useEffect(() => {
    if (contentId && history.length > 0) {
      const existingEntry = history.find(entry => 
        entry.content_id === contentId && 
        entry.current_position !== null && 
        entry.current_position > 0
      );
      
      if (existingEntry && existingEntry.current_position) {
        setInitialPosition(existingEntry.current_position);
      }
    }
  }, [contentId, history]);

  // Save reading session to history
  useEffect(() => {
    const saveToHistory = async () => {
      if (content && title && !historySaved) {
        // Determine source type based on contentId
        let sourceType = 'url';
        if (contentId?.startsWith('file-')) {
          sourceType = 'upload';
        } else if (contentId?.includes('search-')) {
          sourceType = 'search';
        }
        
        // Use preferred WPM from profile if available
        const wpm = profile?.preferred_wpm || 300;
        
        await saveHistoryEntry({
          title,
          source,
          source_type: sourceType,
          source_input: source || title,
          content_id: contentId || '',
          wpm,
          current_position: 0,
          calibrated: profile?.calibration_status === 'completed',
          summary: null,
          parsed_text: content,
        });
        
        setHistorySaved(true);
      }
    };
    
    saveToHistory();
  }, [content, title, contentId]);

  // Update history with summary when generated
  useEffect(() => {
    const updateHistoryWithSummary = async () => {
      if (summary && historySaved && contentId) {
        // Logic to update history entry with summary
        console.log("Summary generated, would update history entry");
      }
    };
    
    updateHistoryWithSummary();
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
        <div className="flex justify-between items-center mb-4">
          <ContentHeader content={contentObject} />
          <ThemeToggle />
        </div>

        <ReaderAlerts 
          isSimulated={isSimulated} 
          initialPosition={initialPosition} 
          content={content} 
        />

        <ContentContainer
          apiKey={apiKey}
          useOpenAI={useOpenAI}
          onApiKeyChange={setApiKey}
          onUseOpenAIChange={setUseOpenAI}
          summary={summary}
          content={content}
          title={title}
          source={source}
          isSummarizing={isSummarizing}
          summarizationProgress={summarizationProgress}
          summarizationError={summarizationError}
          onSummarize={() => handleSummarize(apiKey, useOpenAI)}
          onStartReading={handleStartReading}
          onRetry={handleRetrySummarization}
        />
      </div>
    </div>
  );
};

export default Reader;
