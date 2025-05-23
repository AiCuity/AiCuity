
import { Badge } from "@/components/ui/badge";
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import SourceIcon from "./SourceIcon";

interface EntryTitleProps {
  entry: ReadingHistoryEntry;
}

const EntryTitle = ({ entry }: EntryTitleProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-800">
        <SourceIcon entry={entry} />
      </div>
      <span className="font-medium">{entry.title}</span>
      {entry.summary && (
        <Badge variant="outline" className="ml-1">
          Summary
        </Badge>
      )}
    </div>
  );
};

export default EntryTitle;
