
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, TrashIcon, FileText, Globe, BookOpen, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReadingHistory, ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const ReadingHistory = () => {
  const { history, isLoading, deleteHistoryEntry } = useReadingHistory();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleContinueReading = (contentId: string) => {
    navigate(`/reader/${contentId}`);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteHistoryEntry(deletingId);
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSourceIcon = (entry: ReadingHistoryEntry) => {
    const sourceType = entry.source_type || (entry.source?.startsWith('http') ? 'website' : 'file');
    
    switch (sourceType) {
      case 'website':
      case 'url':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'upload':
      case 'file':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'search':
        return <Search className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse space-y-4 w-full">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
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
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-800">
                  {getSourceIcon(item)}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.title}</h3>
              </div>
              
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
                <span>•</span>
                <span>{item.wpm} WPM</span>
                {item.calibrated && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 dark:text-green-400">Calibrated</span>
                  </>
                )}
              </div>
              
              {item.summary && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {item.summary}
                </p>
              )}
              
              <div className="mt-3">
                {item.current_position && item.current_position > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(item.current_position / (item.parsed_text?.length || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[45px]">
                      {Math.round((item.current_position / (item.parsed_text?.length || 1)) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setDeletingId(item.id)}
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
              onClick={() => handleContinueReading(item.content_id)}
            >
              Continue Reading
            </Button>
          </div>
        </Card>
      ))}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this reading history entry.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReadingHistory;
