
import React from "react";
import ApiKeyConfig from "@/components/ApiKeyConfig";
import SummaryPanel from "@/components/SummaryPanel";
import SummarizePrompt from "@/components/Reader/SummarizePrompt";
import ContentPreview from "@/components/Reader/ContentPreview";

interface ContentContainerProps {
  apiKey: string;
  useOpenAI: boolean;
  onApiKeyChange: (key: string) => void;
  onUseOpenAIChange: (use: boolean) => void;
  summary: string;
  content: string;
  title: string;
  source?: string;
  isSummarizing: boolean;
  summarizationProgress: number;
  summarizationError: string | null;
  onSummarize: () => void;
  onStartReading: (useFull: boolean) => void;
  onRetry: () => void;
}

const ContentContainer = ({
  apiKey,
  useOpenAI,
  onApiKeyChange,
  onUseOpenAIChange,
  summary,
  content,
  title,
  source,
  isSummarizing,
  summarizationProgress,
  summarizationError,
  onSummarize,
  onStartReading,
  onRetry
}: ContentContainerProps) => {
  return (
    <div className="space-y-6">
      <ApiKeyConfig 
        apiKey={apiKey}
        useOpenAI={useOpenAI}
        onApiKeyChange={onApiKeyChange}
        onUseOpenAIChange={onUseOpenAIChange}
      />
      
      {summary ? (
        <SummaryPanel
          summary={summary}
          fullText={content}
          title={title}
          source={source}
          isLoading={isSummarizing}
          progress={summarizationProgress}
          onStartReading={onStartReading}
          onRetry={onRetry}
        />
      ) : (
        <SummarizePrompt
          onSummarize={onSummarize} 
          onReadFullText={() => onStartReading(true)}
          isSummarizing={isSummarizing}
          summarizationError={summarizationError}
        />
      )}
      
      <ContentPreview content={content} />
    </div>
  );
};

export default ContentContainer;
