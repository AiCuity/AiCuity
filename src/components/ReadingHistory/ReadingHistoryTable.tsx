
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, 
  TrashIcon, 
  FileText, 
  Globe, 
  BookOpen, 
  Search, 
  PlayCircle,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchActualContent } from "@/utils/contentSource";

interface ReadingHistoryTableProps {
  history: ReadingHistoryEntry[];
  onDeleteClick: (id: string) => void;
  calculateProgress: (entry: ReadingHistoryEntry) => number;
}

const ReadingHistoryTable = ({ history, onDeleteClick, calculateProgress }: ReadingHistoryTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingContentId, setLoadingContentId] = useState<string | null>(null);

  const handleContinueReading = async (item: ReadingHistoryEntry) => {
    console.log("Continuing reading for item:", item);
    
    // Clear any existing reader content in session storage first
    sessionStorage.removeItem('readerContent');
    sessionStorage.removeItem('contentTitle');
    sessionStorage.removeItem('contentSource');
    sessionStorage.removeItem('currentContentId');
    
    // If we have parsed text, use it
    if (item.parsed_text) {
      console.log("Storing parsed text in sessionStorage for content ID:", item.content_id);
      
      // Store this item's content
      sessionStorage.setItem('readerContent', item.parsed_text);
      sessionStorage.setItem('contentTitle', item.title);
      if (item.source) {
        sessionStorage.setItem('contentSource', item.source);
      }
      
      // Store the content ID for the reader to identify which content this is
      sessionStorage.setItem('currentContentId', item.content_id);
      
      console.log("Content ID stored:", item.content_id);
      
      // Navigate to the reader page with the content ID
      navigate(`/reader/${item.content_id}`);
    } 
    // If the item has a source URL, try to fetch the content again
    else if (item.source && item.source.startsWith('http')) {
      setLoadingContentId(item.content_id);
      
      toast({
        title: "Retrieving content",
        description: "Attempting to fetch the content from the original source.",
      });
      
      try {
        // Try to fetch the content from the source URL
        const result = await fetchActualContent(item.source);
        
        if (result && result.content) {
          // Store the fetched content
          sessionStorage.setItem('readerContent', result.content);
          sessionStorage.setItem('contentTitle', item.title || result.title);
          sessionStorage.setItem('contentSource', item.source);
          sessionStorage.setItem('currentContentId', item.content_id);
          
          toast({
            title: "Content retrieved",
            description: "Successfully retrieved the content. Starting reader...",
          });
          
          // Navigate to the reader
          navigate(`/reader/${item.content_id}`);
        } else {
          throw new Error("Could not extract content from the source.");
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        toast({
          title: "Content unavailable",
          description: "Could not retrieve the original content. The source might be unavailable.",
          variant: "destructive",
        });
      } finally {
        setLoadingContentId(null);
      }
    } 
    // If no source or parsed_text, show error
    else {
      toast({
        title: "Content unavailable",
        description: "The content for this entry is no longer available.",
        variant: "destructive",
      });
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

  return (
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
                  {!item.parsed_text && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertTriangle className="h-4 w-4 text-amber-500 ml-1" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Content may need to be reloaded from source</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                    disabled={loadingContentId === item.content_id}
                  >
                    {loadingContentId === item.content_id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading
                      </span>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Continue
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteClick(item.id)}
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
  );
};

export default ReadingHistoryTable;
