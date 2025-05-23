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
  const { saveHistoryEntry, history, fetchHistory, findExistingEntryBySource } = useReadingHistory();
  
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

  // Check for existing reading position from session storage first (from "Continue" button)
  // or from reading history if available
  useEffect(() => {
    // First try to get position from session storage (Continue button flow)
    const storedPosition = sessionStorage.getItem('initialPosition');
    if (storedPosition) {
      const position = parseInt(storedPosition, 10);
      console.log("Found position in session storage:", position);
      setInitialPosition(position);
      sessionStorage.removeItem('initialPosition'); // Clear it after use
      return;
    }
    
    // If not found in session storage, check reading history
    if (contentId && history.length > 0) {
      // Try to find by content ID first
      const existingEntry = history.find(entry => 
        entry.content_id === contentId && 
        entry.current_position !== null && 
        entry.current_position > 0
      );
      
      if (existingEntry && existingEntry.current_position) {
        console.log("Found existing position by content ID:", existingEntry.current_position);
        setInitialPosition(existingEntry.current_position);
        return;
      }
      
      // If not found by content ID, try to find by source URL
      if (source && source.startsWith('http')) {
        const sourceMatch = history.find(entry => 
          entry.source === source &&
          entry.current_position !== null && 
          entry.current_position > 0
        );
        
        if (sourceMatch && sourceMatch.current_position) {
          console.log("Found existing position by source URL:", sourceMatch.current_position);
          setInitialPosition(sourceMatch.current_position);
        }
      }
    }
  }, [contentId, history, source, content]);

  // Save reading session to history
  useEffect(() => {
    const saveToHistory = async () => {
      // Only save if we have content, title, contentId, and haven't saved yet
      if (!content || !title || !contentId || historySaved) {
        return;
      }
      
      console.log("Attempting to save history for:", contentId);
      
      // Check if this entry already exists in history by content ID
      let existingEntry = history.find(entry => entry.content_id === contentId);
      
      // If not found by content ID, check by source URL
      if (!existingEntry && source && source.startsWith('http')) {
        existingEntry = history.find(entry => entry.source === source);
        
        if (existingEntry) {
          console.log("Found existing entry by source URL:", source);
        }
      }
      
      // If it already exists, don't create a duplicate
      if (existingEntry) {
        console.log("Entry already exists in history, not creating duplicate:", contentId);
        setHistorySaved(true);
        return;
      }
      
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
      console.log("History entry saved for:", contentId);
    };
    
    saveToHistory();
  }, [content, title, contentId, user, historySaved, history, source]);

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
