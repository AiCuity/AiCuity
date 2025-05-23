
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import { useNavigate } from "react-router-dom";
import { fetchActualContent } from "@/utils/contentSource";

export const useReadingSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingContentId, setLoadingContentId] = useState<string | null>(null);

  const handleContinueReading = async (item: ReadingHistoryEntry) => {
    console.log("Continuing reading for item:", item);
    
    // Clear any existing reader content in session storage first
    sessionStorage.removeItem('readerContent');
    sessionStorage.removeItem('contentTitle');
    sessionStorage.removeItem('contentSource');
    sessionStorage.removeItem('currentContentId');
    sessionStorage.removeItem('initialPosition');
    sessionStorage.removeItem('savedWpm'); // Make sure to clear previous WPM
    
    // Track the reading position
    const readingPosition = item.current_position || 0;
    console.log("Reading position:", readingPosition);
    
    // Store the WPM from history, with fallback to default
    const wpm = item.wpm || 300;
    console.log("Setting savedWpm in sessionStorage:", wpm);
    sessionStorage.setItem('savedWpm', wpm.toString());
    
    // If we have parsed text, use it
    if (item.parsed_text) {
      console.log("Storing parsed text in sessionStorage for content ID:", item.content_id);
      
      // Store this item's content
      sessionStorage.setItem('readerContent', item.parsed_text);
      sessionStorage.setItem('contentTitle', item.title);
      if (item.source) {
        sessionStorage.setItem('contentSource', item.source);
      }
      
      // Store the content ID for the reader to identify which content this is
      sessionStorage.setItem('currentContentId', item.content_id);
      
      // Also store the current position
      if (readingPosition > 0) {
        sessionStorage.setItem('initialPosition', readingPosition.toString());
      }
      
      console.log("Content ID, position, and WPM stored:", item.content_id, readingPosition, wpm);
      
      // Navigate to the reader page with the content ID
      navigate(`/reader/${item.content_id}`);
    } 
    // If the item has a source URL, try to fetch the content again
    else if (item.source && item.source.startsWith('http')) {
      setLoadingContentId(item.content_id);
      
      toast({
        title: "Retrieving content",
        description: "Attempting to fetch the content from the original source.",
      });
      
      try {
        // Try to fetch the content from the source URL
        const result = await fetchActualContent(item.source);
        
        if (result && result.content) {
          // Store the fetched content
          sessionStorage.setItem('readerContent', result.content);
          sessionStorage.setItem('contentTitle', item.title || result.title);
          sessionStorage.setItem('contentSource', item.source);
          sessionStorage.setItem('currentContentId', item.content_id);
          
          // Store the reading position
          if (readingPosition > 0) {
            sessionStorage.setItem('initialPosition', readingPosition.toString());
          }
          
          // Store the WPM
          sessionStorage.setItem('savedWpm', wpm.toString());
          
          toast({
            title: "Content retrieved",
            description: "Successfully retrieved the content. Starting reader...",
          });
          
          // Navigate to the reader
          navigate(`/reader/${item.content_id}`);
        } else {
          throw new Error("Could not extract content from the source.");
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        toast({
          title: "Content unavailable",
          description: "Could not retrieve the original content. The source might be unavailable.",
          variant: "destructive",
        });
      } finally {
        setLoadingContentId(null);
      }
    } 
    // If no source or parsed_text, show error
    else {
      toast({
        title: "Content unavailable",
        description: "The content for this entry is no longer available.",
        variant: "destructive",
      });
    }
  };

  return {
    loadingContentId,
    handleContinueReading,
  };
};
