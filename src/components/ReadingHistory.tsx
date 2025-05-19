
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, TrashIcon, FileText, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

type HistoryItem = {
  id: string;
  title: string;
  source: "website" | "file";
  sourceUrl?: string;
  fileName?: string;
  wordCount: number;
  dateAccessed: string;
  readingProgress: number;
};

const ReadingHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // In a full implementation, we would fetch the reading history from Supabase
    // For now, we'll use mock data
    const mockHistory: HistoryItem[] = [
      {
        id: "website-123",
        title: "The Science Behind Speed Reading",
        source: "website",
        sourceUrl: "https://en.wikipedia.org/wiki/Speed_reading",
        wordCount: 3240,
        dateAccessed: "2025-05-18T15:30:00Z",
        readingProgress: 45,
      },
      {
        id: "file-456",
        title: "How to Read Faster and Understand More",
        source: "file",
        fileName: "speed_reading_techniques.pdf",
        wordCount: 5621,
        dateAccessed: "2025-05-17T09:15:00Z",
        readingProgress: 78,
      },
      {
        id: "website-789",
        title: "Latest Developments in AI and Machine Learning",
        source: "website",
        sourceUrl: "https://medium.com/topic/technology",
        wordCount: 2189,
        dateAccessed: "2025-05-15T14:20:00Z",
        readingProgress: 100,
      },
    ];
    
    setTimeout(() => {
      setHistory(mockHistory);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleContinueReading = (id: string) => {
    navigate(`/reader/${id}`);
  };

  const handleDeleteItem = (id: string) => {
    // In a full implementation, we would delete the item from Supabase
    // For now, we'll just update the local state
    setHistory(history.filter(item => item.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse space-y-4 w-full">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No reading history yet.</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Your reading history will appear here once you start reading content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-800">
                  {item.source === "website" ? (
                    <Globe className="h-4 w-4 text-blue-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{item.title}</h3>
              </div>
              
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <CalendarIcon className="h-3 w-3" />
                <span>{formatDate(item.dateAccessed)}</span>
                <span>•</span>
                <span>{item.wordCount.toLocaleString()} words</span>
              </div>
              
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${item.readingProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[45px]">
                    {item.readingProgress}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleDeleteItem(item.id)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleContinueReading(item.id)}
            >
              Continue Reading
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ReadingHistory;
