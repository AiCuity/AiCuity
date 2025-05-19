
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { generateWikipediaArticle } from "@/utils/wikiContent";
import { useReadingHistory } from "@/hooks/useReadingHistory";

export const useContentLoader = (contentId?: string) => {
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);
  const { toast } = useToast();
  const { history, fetchHistory } = useReadingHistory();

  useEffect(() => {
    // Refresh history when component loads to ensure we have the latest data
    fetchHistory();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      
      try {
        console.log("Loading content for ID:", contentId);
        console.log("Current session storage content ID:", sessionStorage.getItem('currentContentId'));
        
        // First check if we have this content in history with parsed_text
        const historyEntry = contentId ? history.find(entry => entry.content_id === contentId && entry.parsed_text) : null;
        
        if (historyEntry?.parsed_text) {
          console.log("Loading content from history for ID:", contentId);
          setContent(historyEntry.parsed_text);
          setTitle(historyEntry.title);
          setSource(historyEntry.source || "");
          setIsLoading(false);
          return;
        }
        
        // Check if contentId from sessionStorage matches the route contentId
        const storedContentId = sessionStorage.getItem('currentContentId');
        
        if (storedContentId && storedContentId === contentId) {
          console.log("ContentID matches stored value, using sessionStorage content");
          const storedContent = sessionStorage.getItem('readerContent');
          const storedTitle = sessionStorage.getItem('contentTitle') || 'Stored content';
          const storedSource = sessionStorage.getItem('contentSource') || '';
          
          if (storedContent) {
            console.log("Loading content from sessionStorage for matching ID");
            setContent(storedContent);
            setTitle(storedTitle);
            setSource(storedSource);
            setIsLoading(false);
            return;
          }
        } else if (storedContentId && contentId) {
          console.log("ContentID doesn't match stored value. Route:", contentId, "Stored:", storedContentId);
        }
        
        // If not in history or matching session storage, process based on content type
        if (contentId?.startsWith('file-')) {
          // For file uploads, get content from sessionStorage
          const storedContent = sessionStorage.getItem('readerContent');
          const storedTitle = sessionStorage.getItem('contentTitle') || 'Uploaded document';
          
          if (storedContent) {
            setContent(storedContent);
            setTitle(storedTitle);
            console.log("Loaded file content:", storedContent.substring(0, 100) + "...");
          } else {
            toast({
              title: "Content not found",
              description: "The requested content could not be loaded.",
              variant: "destructive",
            });
          }
        } else if (contentId?.startsWith('website-')) {
          // For website content using modularized API
          const storedContent = sessionStorage.getItem('readerContent');
          const storedTitle = sessionStorage.getItem('contentTitle') || 'Website content';
          const storedSource = sessionStorage.getItem('contentSource') || '';
          
          if (storedContent) {
            console.log("Loaded website content:", storedContent.substring(0, 100) + "...");
            
            // Check if this is simulated content
            const contentIsSimulated = 
              storedContent.includes('⚠️ NOTE: This is simulated content') || 
              storedContent.includes('simulated content');
              
            setContent(storedContent);
            setTitle(storedTitle);
            setSource(storedSource);
            setIsSimulated(contentIsSimulated);
            
            if (contentIsSimulated) {
              console.log("Using simulated content");
              toast({
                title: "Using simulated content",
                description: "The actual website content could not be accessed.",
                variant: "default",
              });
            }
          } else {
            toast({
              title: "Content not found",
              description: "The requested website content could not be loaded.",
              variant: "destructive",
            });
          }
        } else if (contentId?.includes('wiki-')) {
          // For Wikipedia content
          const title = contentId.replace('wiki-', '');
          const wikiContent = generateWikipediaArticle(title);
          setContent(wikiContent);
          setTitle(title);
          setSource(`Wikipedia: ${title}`);
        } else {
          // For other content types - could be from reading history
          console.log("Unknown content type, looking for any available data:", contentId);
          
          // Try to load from sessionStorage as a fallback
          const storedContent = sessionStorage.getItem('readerContent');
          const storedTitle = sessionStorage.getItem('contentTitle');
          const storedSource = sessionStorage.getItem('contentSource');
          
          if (storedContent && storedTitle) {
            console.log("Loading content from sessionStorage as fallback");
            setContent(storedContent);
            setTitle(storedTitle);
            if (storedSource) setSource(storedSource);
          } else {
            console.warn("Unknown content type and no sessionStorage content:", contentId);
            toast({
              title: "Unknown content type",
              description: "The requested content type is not supported.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        toast({
          title: "Error loading content",
          description: "Failed to load the requested content.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [contentId, toast, history]);

  return { content, title, source, isLoading, isSimulated };
};
