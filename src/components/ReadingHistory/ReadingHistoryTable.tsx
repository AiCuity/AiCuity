import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import EntryTitle from "./EntryTitle";
import ProgressDisplay from "./ProgressDisplay";
import TableEntryActions from "./TableEntryActions";
import { useReadingSession } from "./useReadingSession";
import { Calendar, Gauge, TrendingUp } from "lucide-react";

interface ReadingHistoryTableProps {
  history: ReadingHistoryEntry[];
  onDeleteClick: (id: string) => void;
  progressValues: Record<string, number>;
}

const ReadingHistoryTable = ({ 
  history, 
  onDeleteClick, 
  progressValues 
}: ReadingHistoryTableProps) => {
  const { loadingContentId, handleContinueReading } = useReadingSession();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
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
            {history.map((item) => {
              const progress = progressValues[item.id] || 0;
              
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <EntryTitle entry={item} />
                  </TableCell>
                  <TableCell>{formatDate(item.created_at)}</TableCell>
                  <TableCell>{item.wpm} WPM</TableCell>
                  <TableCell>
                    <ProgressDisplay progress={progress} />
                  </TableCell>
                  <TableCell className="text-right">
                    <TableEntryActions
                      item={item}
                      onDeleteClick={onDeleteClick}
                      onContinueReading={handleContinueReading}
                      loadingContentId={loadingContentId}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {history.map((item) => {
          const progress = progressValues[item.id] || 0;
          
          return (
            <Card key={item.id} className="p-4">
              <div className="space-y-3">
                {/* Title */}
                <div className="pr-2">
                  <EntryTitle entry={item} />
                </div>
                
                {/* Metadata Row */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className="h-3 w-3 flex-shrink-0" />
                    <span>{item.wpm} WPM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 flex-shrink-0" />
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-1">
                  <ProgressDisplay progress={progress} />
                </div>
                
                {/* Actions */}
                <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                  <TableEntryActions
                    item={item}
                    onDeleteClick={onDeleteClick}
                    onContinueReading={handleContinueReading}
                    loadingContentId={loadingContentId}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default ReadingHistoryTable;
