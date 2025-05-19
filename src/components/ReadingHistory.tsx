
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  CalendarIcon, 
  TrashIcon, 
  FileText, 
  Globe, 
  BookOpen, 
  Search, 
  PlayCircle
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const ReadingHistory = () => {
  const { history, isLoading, deleteHistoryEntry } = useReadingHistory();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleContinueReading = (item: ReadingHistoryEntry) => {
    navigate(`/reader/${item.content_id}`);
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

  // Calculate the reading progress based on position and total words
  const calculateProgress = (entry: ReadingHistoryEntry): number => {
    if (!entry.current_position || entry.current_position <= 0) return 0;
    if (!entry.parsed_text) return 0;
    
    // Count words in parsed_text
    const words = entry.parsed_text.split(/\s+/).filter(word => word.length > 0);
    const totalWords = words.length;
    
    if (totalWords <= 0) return 0;
    
    const progress = Math.min(Math.round((entry.current_position / totalWords) * 100), 100);
    return progress;
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Reading History</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>WPM</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-800">
                      {getSourceIcon(item)}
                    </div>
                    <span className="font-medium">{item.title}</span>
                    {item.summary && (
                      <Badge variant="outline" className="ml-1">
                        Summary
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatDate(item.created_at)}</TableCell>
                <TableCell>{item.wpm} WPM</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={calculateProgress(item)} 
                      className="h-2 w-20"
                    />
                    <span className="text-xs font-medium">{calculateProgress(item)}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContinueReading(item)}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Continue
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingId(item.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
