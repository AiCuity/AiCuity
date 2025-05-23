
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import EntryTitle from "./EntryTitle";
import ProgressDisplay from "./ProgressDisplay";
import TableEntryActions from "./TableEntryActions";
import { useReadingSession } from "./useReadingSession";

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
  );
};

export default ReadingHistoryTable;
