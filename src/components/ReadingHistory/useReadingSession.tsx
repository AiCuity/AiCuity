import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import { useNavigate } from "react-router-dom";
import { fetchActualContent, fetchFileContentFromStorage } from "@/utils/contentSource";

export const useReadingSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingContentId, setLoadingContentId] = useState<string | null>(null);

  const handleContinueReading = async (item: ReadingHistoryEntry) => {
    console.log("Continuing reading for item:", item);
    console.log("DEBUG: item.source =", item.source);
    console.log("DEBUG: item.parsed_text =", item.parsed_text);
    console.log("DEBUG: item.source_type =", item.source_type);
    console.log("DEBUG: item.source_input =", item.source_input);
    
    // Clear any existing reader content in session storage first
    sessionStorage.removeItem('readerContent');
    sessionStorage.removeItem('contentTitle');
    sessionStorage.removeItem('contentSource');
    sessionStorage.removeItem('currentContentId');
    sessionStorage.removeItem('initialPosition');
    sessionStorage.removeItem('savedWpm'); // Make sure to clear previous WPM
    sessionStorage.removeItem('fileStoragePath'); // Clear file storage path
    
    // Track the reading position
    const readingPosition = item.current_position || 0;
    console.log("Reading position:", readingPosition);
    
    // Store the WPM from history, with fallback to default
    const wpm = item.wpm || 300;
    console.log("Setting savedWpm in sessionStorage:", wpm);
    sessionStorage.setItem('savedWpm', wpm.toString());
    
    // IMPORTANT: Mark this as existing content to prevent duplicate creation
    sessionStorage.setItem('currentContentId', item.content_id);
    sessionStorage.setItem('isExistingContent', 'true');
    
    // Also store the current position
    if (readingPosition > 0) {
      sessionStorage.setItem('initialPosition', readingPosition.toString());
    }
    
    // If we have parsed text, use it
    if (item.parsed_text) {
      console.log("DEBUG: Using parsed_text path");
      console.log("DEBUG: Source type:", item.source_type);
      console.log("Storing parsed text in sessionStorage for content ID:", item.content_id);
      
      // Store this item's content
      sessionStorage.setItem('readerContent', item.parsed_text);
      sessionStorage.setItem('contentTitle', item.title);
      if (item.source) {
        sessionStorage.setItem('contentSource', item.source_input || item.source);
      }
      
      // For image scans, also store the content in localStorage as backup
      if (item.source_type === 'image-scan' || item.source?.startsWith('Image Scan:')) {
        console.log("DEBUG: Storing image scan content in localStorage for cross-browser access");
        const contentData = {
          text: item.parsed_text,
          title: item.title,
          source: item.source_input || item.source,
          timestamp: Date.now(),
          type: 'image-scan'
        };
        localStorage.setItem(`content_${item.content_id}`, JSON.stringify(contentData));
      }
      
      console.log("Content ID, position, and WPM stored:", item.content_id, readingPosition, wpm);
      
      // Navigate to the reader page with the content ID
      // NOTE: This is reopening existing content, so we do NOT call record-upload
      navigate(`/reader/${item.content_id}`);
    }
    // If the item has a source URL, try to fetch the content again
    else if (item.source && item.source.startsWith('http')) {
      console.log("DEBUG: Using HTTP URL path");
      setLoadingContentId(item.content_id);
      
      toast({
        title: "Retrieving content",
        description: "Attempting to fetch the content from the original source.",
      });
      
      try {
        // Try to fetch the content from the source URL
        // Note: incrementUsage is false because this is continuing existing content
        const result = await fetchActualContent(item.source, undefined, false);
        
        if (result && result.content) {
          // Store the fetched content
          sessionStorage.setItem('readerContent', result.content);
          sessionStorage.setItem('contentTitle', item.title || result.title);
          sessionStorage.setItem('contentSource', item.source);
          
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
          // NOTE: This is reopening existing content, so we do NOT call record-upload
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
    // If the source is a file path (contains user ID path), try to fetch from storage
    else if (item.source && (item.source.includes('/') && !item.source.startsWith('http'))) {
      console.log("DEBUG: Using file storage path");
      console.log("DEBUG: Detected file storage path:", item.source);
      setLoadingContentId(item.content_id);
      
      toast({
        title: "Retrieving file content",
        description: "Fetching the uploaded file content...",
      });
      
      try {
        // Try to fetch the file content from Supabase storage
        console.log("DEBUG: Calling fetchFileContentFromStorage with path:", item.source);
        // Note: incrementUsage is false because this is continuing existing content
        const result = await fetchFileContentFromStorage(item.source, undefined, false);
        
        if (result && result.content) {
          console.log("DEBUG: Successfully retrieved file content, length:", result.content.length);
          // Store the fetched content
          sessionStorage.setItem('readerContent', result.content);
          sessionStorage.setItem('contentTitle', item.title || result.title);
          sessionStorage.setItem('contentSource', item.source_input || `File: ${item.title}`);
          
          // Store the reading position
          if (readingPosition > 0) {
            sessionStorage.setItem('initialPosition', readingPosition.toString());
          }
          
          // Store the WPM
          sessionStorage.setItem('savedWpm', wpm.toString());
          
          toast({
            title: "File content retrieved",
            description: "Successfully retrieved the file content. Starting reader...",
          });
          
          // Navigate to the reader
          // NOTE: This is reopening existing content, so we do NOT call record-upload
          navigate(`/reader/${item.content_id}`);
        } else {
          console.log("DEBUG: fetchFileContentFromStorage returned null or no content");
          throw new Error("Could not extract content from the stored file.");
        }
      } catch (error) {
        console.error("DEBUG: Error fetching file content:", error);
        toast({
          title: "File unavailable",
          description: "Could not retrieve the uploaded file content. The file may have been deleted.",
          variant: "destructive",
        });
      } finally {
        setLoadingContentId(null);
      }
    }
    // If this is an image scan, try to retrieve from localStorage
    else if (item.source_type === 'image-scan' || (item.source && item.source.startsWith('Image Scan:'))) {
      console.log("DEBUG: Using image scan content");
      const localStorageContent = localStorage.getItem(`content_${item.content_id}`);
      
      if (localStorageContent) {
        try {
          const contentData = JSON.parse(localStorageContent);
          console.log("DEBUG: Successfully retrieved image scan content from localStorage");
          
          // Store the content for the reader
          sessionStorage.setItem('readerContent', contentData.text);
          sessionStorage.setItem('contentTitle', contentData.title);
          sessionStorage.setItem('contentSource', contentData.source);
          
          // Store the reading position
          if (readingPosition > 0) {
            sessionStorage.setItem('initialPosition', readingPosition.toString());
          }
          
          // Store the WPM
          sessionStorage.setItem('savedWpm', wpm.toString());
          
          toast({
            title: "Image scan content retrieved",
            description: "Successfully retrieved the scanned content. Starting reader...",
          });
          
          // Navigate to the reader
          navigate(`/reader/${item.content_id}`);
        } catch (error) {
          console.error("DEBUG: Error parsing image scan content:", error);
          toast({
            title: "Content unavailable",
            description: "Could not retrieve the scanned image content. The content may have been cleared.",
            variant: "destructive",
          });
        }
      } else {
        console.log("DEBUG: No image scan content found in localStorage");
        toast({
          title: "Content not found",
          description: "The scanned image content is no longer available in local storage.",
          variant: "destructive",
        });
      }
    }
    // If source starts with "File:" but isn't a storage path, it's a descriptive source
    else if (item.source && item.source.startsWith('File:')) {
      console.log("DEBUG: Detected descriptive file source - this shouldn't happen with new logic");
      console.log("DEBUG: Looking for actual storage path...");
      
      // This means the storage path wasn't saved properly, show error
      toast({
        title: "File content unavailable",
        description: "The file storage path was not saved correctly. Please re-upload the file.",
        variant: "destructive",
      });
    }
    // If no source or parsed_text, show error
    else {
      console.log("DEBUG: No valid source found");
      console.log("DEBUG: item.source =", item.source);
      console.log("DEBUG: item.parsed_text =", item.parsed_text);
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
