import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { FileText, ChevronDown, Text, RefreshCw } from "lucide-react";
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
  
  const handleRetry = () => {
    // Call parent's retry function
    if (onRetry && typeof onRetry === 'function') {
      onRetry();
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">Summary</h3>
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
              <p className="text-sm text-muted-foreground">
                Generating summary... This might take a moment.
              </p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground text-right">
                {Math.round(progress)}% complete
              </p>
            </div>
          ) : summary ? (
            <>
              <Textarea 
                value={summary} 
                readOnly 
                className="w-full h-48 sm:h-64 mb-4 resize-none text-sm sm:text-base"
              />
              
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between sm:items-center sm:gap-2 mt-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => onStartReading(false)}
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    <Text className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Read Summary</span>
                    <span className="sm:hidden">Summary</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onStartReading(true)}
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Read Full Text</span>
                    <span className="sm:hidden">Full Text</span>
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  disabled={isLoading}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Regenerate</span>
                  <span className="sm:hidden">Retry</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm sm:text-base mb-4">
                Summary generation failed. Please try again.
              </p>
              <Button onClick={handleRetry} className="w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Summarization
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      
      {isCollapsed && summary && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Summary available</span>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;
