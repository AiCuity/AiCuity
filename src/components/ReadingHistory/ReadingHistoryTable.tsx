
import { Button } from "@/components/ui/button";
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
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface ReadingHistoryTableProps {
  history: ReadingHistoryEntry[];
  onDeleteClick: (id: string) => void;
  calculateProgress: (entry: ReadingHistoryEntry) => number;
}

const ReadingHistoryTable = ({ history, onDeleteClick, calculateProgress }: ReadingHistoryTableProps) => {
  const navigate = useNavigate();

  const handleContinueReading = (item: ReadingHistoryEntry) => {
    console.log("Continuing reading for item:", item);
    
    // Before navigating, store the content in sessionStorage for the reader to load
    if (item.parsed_text) {
      console.log("Storing parsed text in sessionStorage:", item.parsed_text.substring(0, 100) + "...");
      sessionStorage.setItem('readerContent', item.parsed_text);
      sessionStorage.setItem('contentTitle', item.title);
      if (item.source) {
        sessionStorage.setItem('contentSource', item.source);
      }
      
      // Store the content ID for the reader to identify which content this is
      sessionStorage.setItem('currentContentId', item.content_id);
    } else {
      console.warn("No parsed text available for this history entry:", item.id);
    }
    
    // Navigate to the reader page with the content ID
    navigate(`/reader/${item.content_id}`);
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
