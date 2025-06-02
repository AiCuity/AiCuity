import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader, Glasses } from "lucide-react";
import RSVPReader from "@/components/RSVPReader";

interface ContentData {
  title: string;
  source?: string;
  text: string;
  summary?: string;
}

const GlassesReader = () => {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [content, setContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!contentId || !token) {
        setError('Missing content ID or access token');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/glasses/content/${contentId}?token=${token}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch content');
        }

        const data = await response.json();
        setContent(data.content);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [contentId, token]);

  // Loading state optimized for glasses
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Glasses className="h-8 w-8 mr-3" />
            <Loader className="h-8 w-8 animate-spin" />
          </div>
          <p className="text-xl font-mono">Loading for AR Glasses...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">AiCuity Speed Reading</p>
        </div>
      </div>
    );
  }

  // Error state optimized for glasses
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Glasses className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <Alert variant="destructive" className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-lg">
              <div className="space-y-2">
                <p className="font-semibold">AR Glasses Access Error</p>
                <p>{error}</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // No content
  if (!content) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <Glasses className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-xl">No content available for glasses</p>
        </div>
      </div>
    );
  }

  // Render the full RSVP reader interface optimized for glasses
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Add a subtle indicator that this is glasses mode */}
      <div className="absolute top-4 right-4 z-10 opacity-60">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Glasses className="h-4 w-4 mr-1" />
          <span>AR Mode</span>
        </div>
      </div>
      
      <RSVPReader 
        text={content.text}
        contentId={`glasses_${contentId}`} // Prefix to avoid conflicts with normal reading
        title={content.title}
        source={content.source}
        initialPosition={0}
        initialWpm={250} // Slightly slower for glasses comfort
        isGlassesMode={true} // Enable glasses mode for full word display
      />
    </div>
  );
};

export default GlassesReader; 