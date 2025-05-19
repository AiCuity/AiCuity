
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import RSVPReader from "@/components/RSVPReader";
import { Loader2 } from "lucide-react";

const Reader = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const [content, setContent] = useState<{ title: string; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      if (!contentId) {
        setError("Invalid content ID");
        setIsLoading(false);
        return;
      }

      try {
        // In a full implementation, we would fetch the content from the backend
        // For now, we'll use mock data
        setTimeout(() => {
          const mockContent = {
            title: contentId.startsWith("website") 
              ? "The Science Behind Speed Reading" 
              : "How to Read Faster and Understand More",
            text: `Speed reading is a collection of reading methods that attempt to increase rates of reading without greatly reducing 
            comprehension, retention, or enjoyment. Methods include chunking and minimizing subvocalization.
            
            Speed reading courses and books often teach such strategies as: Grouping words and using peripheral vision, 
            Reducing subvocalization, Reducing cognitive resource allocation to non-essential tasks, Skimming text in 
            a highly strategic, disciplined way, Using a finger or pointer to trace along the line of text as a guide.
            
            Scientific research shows that skimming or speed reading results in decreased comprehension: "the available scientific 
            evidence suggests that speed reading courses are effective at increasing reading speeds, but comprehension typically declines.
            
            The typical reading rate for most adults is between 200 and 250 words per minute. Speed readers claim to hit around 
            1,000 words per minute. World champion speed readers can supposedly read at 4,000 words per minute.
            
            The RSVP or Rapid Serial Visual Presentation method presents words sequentially in the same location, typically 
            in the center of a screen. It eliminates the need for eye movements and their resulting delays, and can reach very high 
            speeds if the person is able to comprehend the words that are flashed. A 2016 study showed immediate 33% improvement 
            in reading speed when using RSVP versus traditional reading, but with a corresponding mild decrease in comprehension.
            
            The RSVP technique is used by the Spritz speed-reading software, which highlights the "optimal recognition point" 
            in each word, which is often not the center of the word.`.repeat(5), // Repeating for longer content
          };
          
          setContent(mockContent);
          setIsLoading(false);
        }, 1500);
      } catch (err) {
        setError("Failed to load content");
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load the reading content",
          variant: "destructive",
        });
      }
    };

    fetchContent();
  }, [contentId, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        <p className="mt-4 text-gray-500">Loading content...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <p className="text-xl text-red-500">{error || "Content not found"}</p>
        <a href="/" className="mt-4 text-blue-500 hover:underline">
          Go back to home
        </a>
      </div>
    );
  }

  return (
    <RSVPReader 
      text={content.text} 
      contentId={contentId || ""} 
      title={content.title}
    />
  );
};

export default Reader;
