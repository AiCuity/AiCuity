
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useContentLoader = (contentId?: string) => {
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      
      try {
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
          // For website content
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
        } else {
          // For other content types
          toast({
            title: "Unknown content type",
            description: "The requested content type is not supported.",
            variant: "destructive",
          });
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
  }, [contentId, toast]);

  return { content, title, source, isLoading, isSimulated };
};
