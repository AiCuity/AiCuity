
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarIcon, 
  TrashIcon, 
  FileText, 
  Globe, 
  BookOpen, 
  Search, 
  Bookmark,
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const ReadingHistory = () => {
  const { history, isLoading, deleteHistoryEntry } = useReadingHistory();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
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
    if (!entry.current_position || !entry.parsed_text) return 0;
    const totalWords = entry.parsed_text.split(/\s+/).length || 1;
    return Math.round((entry.current_position / totalWords) * 100);
  };

  // Truncate long text for display
  const truncateText = (text: string, length = 100): string => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode('cards')}
            className={viewMode === 'cards' ? 'bg-primary text-primary-foreground' : ''}
          >
            Cards
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-primary text-primary-foreground' : ''}
          >
            Table
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
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
                      <span className="font-medium">{truncateText(item.title, 40)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(item.created_at)}</TableCell>
                  <TableCell>{item.wpm} WPM</TableCell>
                  <TableCell>
                    {item.current_position && item.current_position > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${calculateProgress(item)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{calculateProgress(item)}%</span>
                      </div>
                    )}
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
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-800">
                      {getSourceIcon(item)}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {item.title}
                    </h3>
                    {item.current_position && item.current_position > 0 && (
                      <Badge variant="outline" className="ml-2 flex items-center gap-1">
                        <Bookmark className="h-3 w-3" />
                        <span>{calculateProgress(item)}%</span>
                      </Badge>
                    )}
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
                    {item.current_position && item.current_position > 0 && item.parsed_text && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${calculateProgress(item)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[45px]">
                          {calculateProgress(item)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                          <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-red-600 dark:text-red-400"
                        onClick={() => setDeletingId(item.id)}
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-end">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleContinueReading(item)}
                  className="flex items-center gap-1"
                >
                  <PlayCircle className="h-4 w-4" />
                  {item.current_position && item.current_position > 0 ? 'Continue Reading' : 'Read Again'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

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
