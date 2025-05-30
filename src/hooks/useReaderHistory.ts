import { useState, useEffect } from "react";
import { useReadingHistory } from "./useReadingHistory";
import { useAuth } from "@/context/AuthContext";
import { calculateTotalWords } from "@/hooks/readingHistory/utils/progressUtils";

export function useReaderHistory(contentId: string | undefined, title: string, source: string | undefined, content: string) {
  const { saveHistoryEntry, history, fetchHistory, findExistingEntryBySource } = useReadingHistory();
  const { user } = useAuth();
  const [historySaved, setHistorySaved] = useState(false);
  const [initialPosition, setInitialPosition] = useState(0);
  const [savedWpm, setSavedWpm] = useState<number | undefined>(undefined); // Changed to undefined initially

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

    // If no position in session storage, check if this content exists in history
    if (contentId && history.length > 0) {
      const existingEntry = history.find(entry => entry.content_id === contentId);
      if (existingEntry) {
        console.log("Found existing entry in history:", existingEntry);
        setInitialPosition(existingEntry.current_position || 0);
        setSavedWpm(existingEntry.wpm);
      }
    }
  }, [contentId, history]);

  useEffect(() => {
    // Only try to save if we have content, title, and contentId
    if (!content || !title || !contentId || historySaved) return;
    
    console.log("useReaderHistory: Attempting to save history entry");
    console.log("Content ID:", contentId);
    console.log("Title:", title);
    console.log("Source:", source);
    console.log("Content length:", content.length);
    console.log("History length:", history.length);

    const saveToHistory = async () => {
      // Check if this is a "continue reading" scenario by checking session storage
      const storedContentId = sessionStorage.getItem('currentContentId');
      const isExistingContent = sessionStorage.getItem('isExistingContent') === 'true';
      const contentIdMatches = storedContentId === contentId;
      
      console.log("Is existing content (continue reading):", isExistingContent);
      console.log("Stored content ID:", storedContentId);
      console.log("Current content ID:", contentId);
      console.log("Content ID matches:", contentIdMatches);
      
      // If this is existing content (continue reading), don't create a new entry
      if (isExistingContent && contentIdMatches) {
        console.log("This is existing content from 'Continue Reading' - skipping new entry creation");
        setHistorySaved(true);
        
        // Clear the flag to prevent interference with future sessions
        sessionStorage.removeItem('isExistingContent');
        return;
      }
      
      // Check if entry already exists by content_id
      const existingEntryById = history.find(entry => entry.content_id === contentId);
      
      // Also check by source URL for web content
      const existingEntryBySource = source ? findExistingEntryBySource(source) : null;
      
      // Use whichever existing entry we found
      const existingEntry = existingEntryById || existingEntryBySource;
      
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
        } catch (error) {
          console.error("Error updating existing history entry:", error);
        }
        return;
      }
      
      // Don't attempt to save if no user is logged in and we aren't ready to save to localStorage
      if (!user && !content) return;
      
      // Get total words from sessionStorage if available (do this before clearing)
      const totalWordsStr = sessionStorage.getItem('contentTotalWords');
      const totalWords = totalWordsStr ? parseInt(totalWordsStr, 10) : null;
      console.log("DEBUG useReaderHistory: totalWords from session =", totalWords);
      
      // If totalWords is null, try to calculate it from the content as fallback
      let finalTotalWords = totalWords;
      if (!finalTotalWords && content) {
        finalTotalWords = calculateTotalWords(content);
        console.log("DEBUG useReaderHistory: calculated totalWords from content =", finalTotalWords);
      }
      
      // Determine source type based on contentId
      let sourceType = 'url';
      let actualSource = source;
      let sourceInput = source || title; // For display purposes
      
      console.log("DEBUG useReaderHistory: contentId =", contentId);
      console.log("DEBUG useReaderHistory: original source =", source);
      
      // Check if this is from file upload based on contentId pattern
      if (contentId?.startsWith('file_')) {
        sourceType = 'file';
        
        // Get the file storage path from session storage if available
        const fileStoragePath = sessionStorage.getItem('fileStoragePath');
        console.log("DEBUG useReaderHistory: fileStoragePath from session =", fileStoragePath);
        
        if (fileStoragePath) {
          // Use the storage path as the source for file retrieval
          actualSource = fileStoragePath;
          sourceInput = `File: ${title}`; // Keep a friendly display name
          console.log("DEBUG useReaderHistory: Using file storage path as source =", actualSource);
        } else if (source && source.startsWith('storage://')) {
          // Extract path from encoded source
          actualSource = source.replace('storage://', '');
          sourceInput = `File: ${title}`;
          console.log("DEBUG useReaderHistory: Extracted path from encoded source =", actualSource);
        } else {
          // Fallback: generate a descriptive source
          actualSource = `File: ${title}`;
          sourceInput = actualSource;
          console.log("DEBUG useReaderHistory: Using fallback file source =", actualSource);
        }
      }
      
      console.log("DEBUG useReaderHistory: Final source details:");
      console.log("  - sourceType:", sourceType);
      console.log("  - actualSource:", actualSource);
      console.log("  - sourceInput:", sourceInput);
      console.log("  - totalWords:", finalTotalWords);
      
      try {
        await saveHistoryEntry({
          title,
          source: actualSource, // Use the storage path for files, URL for web content
          source_type: sourceType,
          source_input: sourceInput, // Keep original source for display
          content_id: contentId,
          wpm: savedWpm, // Use saved WPM if available
          current_position: 0,
          total_words: finalTotalWords, // Include total words for progress calculation
          calibrated: false,
          summary: null,
          parsed_text: content,
        });
        
        setHistorySaved(true);
        console.log("New history entry saved for:", contentId, "with total_words:", finalTotalWords);
        
        // Only clear the total words from sessionStorage after successful save
        // and only if this is the initial save (not from continue reading)
        if (!isExistingContent) {
          sessionStorage.removeItem('contentTotalWords');
          console.log("Cleared contentTotalWords from sessionStorage after successful save");
        }
      } catch (error) {
        console.error("Error saving history:", error);
      }
    };
    
    // Only run if we haven't already saved
    if (!historySaved) {
      saveToHistory();
    }
  }, [content, title, contentId, user, historySaved, history, source, findExistingEntryBySource, saveHistoryEntry, savedWpm]);

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
