
import React from 'react';
import ApiKeyConfig from "@/components/ApiKeyConfig";
import SummaryPanel from "@/components/SummaryPanel";
import SummarizePrompt from "@/components/Reader/SummarizePrompt";
import ContentPreview from "@/components/Reader/ContentPreview";

interface ReaderOptionsProps {
  apiKey: string;
  useOpenAI: boolean;
  setApiKey: (key: string) => void;
  setUseOpenAI: (use: boolean) => void;
  summary: string;
  content: string;
  title: string;
  source?: string;
  isSummarizing: boolean;
  summarizationProgress: number;
  summarizationError: string | null;
  handleSummarize: () => void;
  handleStartReading: (useFull: boolean) => void;
  handleRetrySummarization: () => void;
}

const ReaderOptions: React.FC<ReaderOptionsProps> = ({
  apiKey,
  useOpenAI,
  setApiKey,
  setUseOpenAI,
  summary,
  content,
  title,
  source,
  isSummarizing,
  summarizationProgress,
  summarizationError,
  handleSummarize,
  handleStartReading,
  handleRetrySummarization
}) => {
  return (
    <div className="space-y-6">
      <ApiKeyConfig 
        apiKey={apiKey}
        useOpenAI={useOpenAI}
        onApiKeyChange={setApiKey}
        onUseOpenAIChange={setUseOpenAI}
      />
      
      {summary ? (
        <SummaryPanel
          summary={summary}
          fullText={content}
          title={title}
          source={source}
          isLoading={isSummarizing}
          progress={summarizationProgress}
          onStartReading={handleStartReading}
          onRetry={handleRetrySummarization}
        />
      ) : (
        <SummarizePrompt
          onSummarize={handleSummarize} 
          onReadFullText={() => handleStartReading(true)}
          isSummarizing={isSummarizing}
          summarizationError={summarizationError}
        />
      )}
      
      <ContentPreview content={content} />
    </div>
  );
};

export default ReaderOptions;
