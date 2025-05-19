
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RSVPReader from "@/components/RSVPReader";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const Reader = () => {
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { contentId } = useParams();
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
          } else {
            toast({
              title: "Content not found",
              description: "The requested content could not be loaded.",
              variant: "destructive",
            });
          }
        } else {
          // For website content, you'd fetch from your API or storage
          // This is a placeholder for future implementation
          toast({
            title: "Website content unavailable",
            description: "Website content extraction is not implemented yet.",
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading content...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Content Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested content could not be loaded. Please try uploading your file again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <RSVPReader text={content} contentId={contentId || ""} title={title} />
    </div>
  );
};

export default Reader;
