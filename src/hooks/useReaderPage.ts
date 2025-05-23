
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useContentLoader } from "@/hooks/useContentLoader";
import { useSummarization } from "@/hooks/useSummarization";
import { useReaderHistory } from "@/hooks/useReaderHistory";

export function useReaderPage() {
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
  }, [summary, updateHistoryWithSummary]);

  // Clear session storage after reader loads to prevent stale data
  useEffect(() => {
    if (showReader) {
      // Set a timeout to clear session storage after component mounts and initializes
      const timer = setTimeout(() => {
        console.log("Reader component mounted, clearing session storage");
        sessionStorage.removeItem('initialPosition');
        sessionStorage.removeItem('savedWpm');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [showReader]);

  const handleStartReading = (useFull: boolean) => {
    setUseFullText(useFull);
    setShowReader(true);
  };

  const handleRetrySummarization = () => {
    // Clear previous summary and regenerate
    setSummary("");
    handleSummarize(apiKey, useOpenAI);
  };

  return {
    contentId,
    content,
    title,
    source,
    isLoading,
    isSimulated,
    summary,
    isSummarizing,
    summarizationProgress,
    summarizationError,
    initialPosition,
    savedWpm,
    showReader,
    useFullText,
    apiKey,
    useOpenAI,
    handleStartReading,
    handleSummarize,
    handleRetrySummarization,
    setApiKey,
    setUseOpenAI
  };
}
