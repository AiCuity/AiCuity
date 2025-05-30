import { useState, useEffect } from "react";
import { useReadingHistory } from "./useReadingHistory";
import { useAuth } from "@/context/AuthContext";
import { apiService } from "@/lib/api";

export function useReaderHistory(contentId: string | undefined, title: string, source: string | undefined, content: string) {
  const { saveHistoryEntry, history, fetchHistory, findExistingEntryBySource } = useReadingHistory();
  const { user } = useAuth();
  const [historySaved, setHistorySaved] = useState(false);
  const [initialPosition, setInitialPosition] = useState(0);
  const [savedWpm, setSavedWpm] = useState<number | undefined>(undefined); // Changed to undefined initially
  const [usageIncremented, setUsageIncremented] = useState(false);

  // Refresh history when component loads
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Check for existing reading position and WPM from session storage first (from "Continue" button)
  // or from reading history if available
  useEffect(() => {
    // First try to get position from session storage (Continue button flow)
    const storedPosition = sessionStorage.getItem('initialPosition');
    const storedWpm = sessionStorage.getItem('savedWpm');
    
    if (storedPosition) {
      const position = parseInt(storedPosition, 10);
      console.log("Found position in session storage:", position);
      setInitialPosition(position);
      
      // Check for stored WPM
      if (storedWpm) {
        const wpm = parseInt(storedWpm, 10);
        console.log("Found WPM in session storage:", wpm);
        setSavedWpm(wpm);
      }
      
      // Do not remove these from sessionStorage yet, let the reader component use them first
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
      
      if (existingEntry) {
        if (existingEntry.current_position) {
          console.log("Found existing position by content ID:", existingEntry.current_position);
          setInitialPosition(existingEntry.current_position);
        }
        
        if (existingEntry.wpm) {
          console.log("Found existing WPM by content ID:", existingEntry.wpm);
          setSavedWpm(existingEntry.wpm);
        }
        return;
      }
      
      // If not found by content ID, try to find by source URL
      if (source && source.startsWith('http')) {
        const sourceMatch = history.find(entry => 
          entry.source === source &&
          entry.current_position !== null && 
          entry.current_position > 0
        );
        
        if (sourceMatch) {
          if (sourceMatch.current_position) {
            console.log("Found existing position by source URL:", sourceMatch.current_position);
            setInitialPosition(sourceMatch.current_position);
          }
          
          if (sourceMatch.wpm) {
            console.log("Found existing WPM by source URL:", sourceMatch.wpm);
            setSavedWpm(sourceMatch.wpm);
          }
        }
      }
    }
  }, [contentId, history, source, content]);

  // Clear session storage when component unmounts
  useEffect(() => {
    return () => {
      // Only clear if we've already processed them
      console.log("Cleaning up session storage - useReaderHistory unmounting");
    };
  }, []);

  // Increment usage when new content is processed
  const incrementUsageForNewContent = async (userId: string) => {
    if (usageIncremented) {
      console.log("Usage already incremented for this session");
      return;
    }

    // Note: Usage is now incremented in the backend APIs (web scrape and file upload)
    // This function is kept for potential future use but currently does nothing
    console.log("Usage increment handled by backend APIs, marking as incremented to prevent duplicates");
    setUsageIncremented(true);
  };

  // Save reading session to history
  useEffect(() => {
    const saveToHistory = async () => {
      console.log("DEBUG useReaderHistory: saveToHistory called");
      console.log("DEBUG useReaderHistory: content length:", content?.length || 0);
      console.log("DEBUG useReaderHistory: title:", title);
      console.log("DEBUG useReaderHistory: contentId:", contentId);
      console.log("DEBUG useReaderHistory: historySaved:", historySaved);
      console.log("DEBUG useReaderHistory: sessionStorage fileStoragePath:", sessionStorage.getItem('fileStoragePath'));
      
      // Only save if we have content, title, contentId, and haven't saved yet
      if (!content || !title || !contentId || historySaved) {
        console.log("DEBUG useReaderHistory: Skipping save - missing requirements or already saved");
        return;
      }
      
      console.log("Attempting to save history for:", contentId);
      
      // Check if this entry already exists in history by content ID or source URL
      let existingEntry = history.find(entry => entry.content_id === contentId);
      
      // If not found by content ID, check by source URL
      if (!existingEntry && source && source.startsWith('http')) {
        existingEntry = findExistingEntryBySource(source);
        
        if (existingEntry) {
          console.log("Found existing entry by source URL:", source);
        }
      }
      
      // If it already exists, update it rather than creating a duplicate
      if (existingEntry) {
        console.log("Entry already exists in history, updating:", existingEntry.id);
        try {
          await saveHistoryEntry({
            ...existingEntry,
            title, // Use the new title
            source, // Update the source if needed
            parsed_text: content, // Update with new content
            content_id: existingEntry.content_id // Keep the same content ID
          });
          setHistorySaved(true);
          
          // For existing entries, don't increment usage again
          setUsageIncremented(true);
        } catch (error) {
          console.error("Error updating existing history entry:", error);
        }
        return;
      }
      
      // Don't attempt to save if no user is logged in and we aren't ready to save to localStorage
      if (!user && !content) return;
      
      // For new entries, increment usage
      if (user) {
        await incrementUsageForNewContent(user.id);
      }
      
      // Determine source type based on contentId
      let sourceType = 'url';
      let actualSource = source;
      let sourceInput = source || title; // For display purposes
      
      console.log("DEBUG useReaderHistory: contentId =", contentId);
      console.log("DEBUG useReaderHistory: original source =", source);
      
      if (contentId?.startsWith('file-')) {
        sourceType = 'upload';
        
        // Check if source already contains storage path (new format: storage://path)
        if (source && source.startsWith('storage://')) {
          actualSource = source.replace('storage://', ''); // Extract path from encoded source
          sourceInput = `File: ${title}`; // Use friendly display name
          console.log("DEBUG useReaderHistory: Using encoded storage path from source:", actualSource);
        } else {
          // Fallback: try to get from sessionStorage (legacy)
          const fileStoragePath = sessionStorage.getItem('fileStoragePath');
          console.log("DEBUG useReaderHistory: fileStoragePath from sessionStorage =", fileStoragePath);
          if (fileStoragePath) {
            actualSource = fileStoragePath; // Use storage path as source for retrieval
            sourceInput = `File: ${title}`; // Use friendly display name
            console.log("DEBUG useReaderHistory: Using file storage path from sessionStorage:", fileStoragePath);
          } else {
            console.log("DEBUG useReaderHistory: No storage path found, using original source");
            sourceInput = `File: ${title}`; // Still use friendly name for files
          }
        }
      } else if (contentId?.includes('search-')) {
        sourceType = 'search';
      }
      
      console.log("DEBUG useReaderHistory: Final actualSource =", actualSource);
      console.log("DEBUG useReaderHistory: sourceInput =", sourceInput);
      console.log("DEBUG useReaderHistory: sourceType =", sourceType);
      
      try {
        await saveHistoryEntry({
          title,
          source: actualSource, // Use the storage path for files, URL for web content
          source_type: sourceType,
          source_input: sourceInput, // Keep original source for display
          content_id: contentId,
          wpm: savedWpm, // Use saved WPM if available
          current_position: 0,
          calibrated: false,
          summary: null,
          parsed_text: content,
        });
        
        setHistorySaved(true);
        console.log("New history entry saved for:", contentId);
      } catch (error) {
        console.error("Error saving history:", error);
      }
    };
    
    saveToHistory();
  }, [content, title, contentId, user, historySaved, history, source, findExistingEntryBySource, saveHistoryEntry, savedWpm, usageIncremented]);

  // Update history with summary when generated
  const updateHistoryWithSummary = async (summary: string) => {
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

  return {
    initialPosition,
    historySaved,
    updateHistoryWithSummary,
    savedWpm // Export the saved WPM value
  };
}
