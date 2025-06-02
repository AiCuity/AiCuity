import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader } from "lucide-react";

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
  const [fontSize, setFontSize] = useState(24); // Default large font for glasses
  const [showSummary, setShowSummary] = useState(false);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Loading content for glasses...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <Alert variant="destructive" className="bg-red-900 border-red-700 text-white">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-lg">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No content
  if (!content) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">No content available</p>
      </div>
    );
  }

  const displayText = showSummary && content.summary ? content.summary : content.text;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Simple controls bar */}
      <div className="flex justify-between items-center mb-6 text-sm">
        <div className="flex gap-4">
          <button
            onClick={() => setFontSize(Math.max(16, fontSize - 2))}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded"
          >
            A-
          </button>
          <button
            onClick={() => setFontSize(Math.min(48, fontSize + 2))}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded"
          >
            A+
          </button>
          {content.summary && (
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded"
            >
              {showSummary ? 'Full Text' : 'Summary'}
            </button>
          )}
        </div>
        <div className="text-gray-400">
          Font: {fontSize}px
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
        {content.title}
      </h1>

      {/* Source info */}
      {content.source && (
        <p className="text-gray-400 text-sm mb-6">
          Source: {content.source}
        </p>
      )}

      {/* Content display optimized for glasses */}
      <div 
        className="reading-content leading-relaxed max-w-none"
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: '1.6',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {displayText.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-6">
            {paragraph.trim()}
          </p>
        ))}
      </div>
    </div>
  );
};

export default GlassesReader; 