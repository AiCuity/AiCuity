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
  const [selectedWordPosition, setSelectedWordPosition] = useState<number>(0);

  // Helper function to detect if content is from image scan
  const isImageScanContent = (title?: string, source?: string): boolean => {
    return (
      title?.startsWith('Book Scan:') || 
      source?.startsWith('Image Scan:') ||
      source?.includes('image-scan')
    );
  };

  // Initialize selected word position from initial position
  useEffect(() => {
    if (initialPosition > 0) {
      setSelectedWordPosition(initialPosition);
    }
  }, [initialPosition]);

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
      // Set a longer timeout to clear session storage after component mounts and initializes
      const timer = setTimeout(() => {
        console.log("Reader component mounted, clearing session storage");
        sessionStorage.removeItem('initialPosition');
        sessionStorage.removeItem('savedWpm');
      }, 3000); // Increased from 1000ms to 3000ms to give more time
      
      return () => clearTimeout(timer);
    }
  }, [showReader]);

  const handleStartReading = (useFull: boolean) => {
    setUseFullText(useFull);
    setShowReader(true);
  };

  const handleStartReadingFromPosition = (useFull: boolean, position?: number) => {
    const startPosition = position !== undefined ? position : selectedWordPosition;
    console.log("handleStartReadingFromPosition called with:");
    console.log("  - useFull:", useFull);
    console.log("  - position parameter:", position);
    console.log("  - selectedWordPosition:", selectedWordPosition);
    console.log("  - final startPosition:", startPosition);
    
    // Store the selected position in session storage for the reader to use
    sessionStorage.setItem('initialPosition', startPosition.toString());
    console.log("Stored in sessionStorage - initialPosition:", startPosition);
    
    setUseFullText(useFull);
    setShowReader(true);
  };

  const handleWordClick = (wordIndex: number) => {
    console.log("handleWordClick called with wordIndex:", wordIndex);
    console.log("Previous selectedWordPosition:", selectedWordPosition);
    setSelectedWordPosition(wordIndex);
    console.log("Set selectedWordPosition to:", wordIndex);
  };

  const handleSummarizeWithImageScanCheck = (apiKey: string, useOpenAI: boolean) => {
    // For image scan content, just use the original content as summary
    if (isImageScanContent(title, source)) {
      console.log("Image scan content detected, using original content as summary instead of processing");
      setSummary(content);
      return;
    }
    
    // For other content types, use normal summarization
    handleSummarize(apiKey, useOpenAI);
  };

  const handleRetrySummarization = () => {
    // For image scan content, don't re-summarize, just use the original content
    if (isImageScanContent(title, source)) {
      console.log("Image scan content detected, using original content instead of re-summarizing");
      setSummary(content);
      return;
    }
    
    // Clear previous summary and regenerate for other content types
    setSummary("");
    handleSummarize(apiKey, useOpenAI);
  };

  const handleBackToText = () => {
    // Clear the summary to return to the interactive text preview
    setSummary("");
  };

  const handleCloseReader = () => {
    // Close the RSVP reader and return to the reader selection page
    setShowReader(false);
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
    selectedWordPosition,
    isImageScanContent: isImageScanContent(title, source),
    handleStartReading,
    handleStartReadingFromPosition,
    handleWordClick,
    handleSummarize: handleSummarizeWithImageScanCheck,
    handleRetrySummarization,
    handleBackToText,
    handleCloseReader,
    setApiKey,
    setUseOpenAI
  };
}
