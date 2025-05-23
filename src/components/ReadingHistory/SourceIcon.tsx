
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import { Globe, FileText, Search, BookOpen } from "lucide-react";

interface SourceIconProps {
  entry: ReadingHistoryEntry;
}

const SourceIcon = ({ entry }: SourceIconProps) => {
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

export default SourceIcon;
