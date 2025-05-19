
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ContentHeader from "@/components/Reader/ContentHeader";
import LoadingState from "@/components/Reader/LoadingState";
import NotFoundState from "@/components/Reader/NotFoundState";
import ReaderAlerts from "@/components/Reader/ReaderAlerts";
import ContentContainer from "@/components/Reader/ContentContainer";
import RSVPReaderContainer from "@/components/Reader/RSVPReaderContainer";
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
  const { saveHistoryEntry, history, fetchHistory } = useReadingHistory();
  
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

  // Refresh history when component loads
  useEffect(() => {
    fetchHistory();
  }, []);

  // Check for existing reading position, but only if content is loaded
  useEffect(() => {
    if (contentId && history.length > 0) {
      const existingEntry = history.find(entry => 
        entry.content_id === contentId && 
        entry.current_position !== null && 
        entry.current_position > 0
      );
      
      if (existingEntry && existingEntry.current_position) {
        console.log("Found existing position:", existingEntry.current_position);
        setInitialPosition(existingEntry.current_position);
      }
    }
  }, [contentId, history, content]);

  // Save reading session to history
  useEffect(() => {
    const saveToHistory = async () => {
      if (content && title && !historySaved && contentId) {
        // Don't attempt to save if no user is logged in and we aren't ready to save to localStorage
        if (!user && !content) return;
        
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
          content_id: contentId,
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
  }, [content, title, contentId, user]);

  // Update history with summary when generated
  useEffect(() => {
    const updateHistoryWithSummary = async () => {
      if (summary && historySaved && contentId && user) {
        // Find the existing entry and update it with the summary
        const existingEntry = history.find(entry => entry.content_id === contentId);
        if (existingEntry) {
          await saveHistoryEntry({
            ...existingEntry,
            summary,
          });
          console.log("Updated history with summary");
        }
      }
    };
    
    updateHistoryWithSummary();
  }, [summary, user]);

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
        <ContentHeader content={contentObject} />

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
