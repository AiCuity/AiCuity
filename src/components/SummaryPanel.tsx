
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { FileText, ChevronDown, Text } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SummaryPanelProps {
  summary: string;
  fullText: string;
  title: string;
  source?: string;
  isLoading: boolean;
  progress: number;
  onStartReading: (useFullText: boolean) => void;
  onRetry: () => void;
}

const SummaryPanel = ({
  summary,
  fullText,
  title,
  source,
  isLoading,
  progress,
  onStartReading,
  onRetry
}: SummaryPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Summary</h3>
        <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? "" : "transform rotate-180"}`} />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
        <CollapsibleContent>
          {isLoading ? (
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Generating summary... This might take a moment.
              </p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {progress}% complete
              </p>
            </div>
          ) : summary ? (
            <>
              <Textarea 
                value={summary} 
                readOnly 
                className="w-full h-48 mb-4 resize-none"
              />
              
              <div className="flex flex-wrap justify-between items-center gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => onStartReading(false)}
                  >
                    <Text className="h-4 w-4 mr-2" />
                    Read Summary
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onStartReading(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Read Full Text
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm" onClick={onRetry}>
                  Regenerate
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Summary generation failed. Please try again.
              </p>
              <Button onClick={onRetry} className="mt-4">
                <Text className="h-4 w-4 mr-2" />
                Retry Summarization
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      
      {isCollapsed && summary && (
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Summary available</span>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;
