import React from 'react';
import ApiKeyConfig from "@/components/ApiKeyConfig";
import SummaryPanel from "@/components/SummaryPanel";
import InteractiveTextPreview from "@/components/Reader/InteractiveTextPreview";

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
  selectedWordPosition: number;
  contentId?: string;
  handleSummarize: () => void;
  handleStartReading: (useFull: boolean) => void;
  handleStartReadingFromPosition: (useFull: boolean, position?: number) => void;
  handleWordClick: (wordIndex: number) => void;
  handleRetrySummarization: () => void;
  handleBackToText: () => void;
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
  selectedWordPosition,
  contentId,
  handleSummarize,
  handleStartReading,
  handleStartReadingFromPosition,
  handleWordClick,
  handleRetrySummarization,
  handleBackToText
}) => {
  return (
    <div className="space-y-6">
      <ApiKeyConfig 
        apiKey={apiKey}
        useOpenAI={useOpenAI}
        onApiKeyChange={setApiKey}
        onUseOpenAIChange={setUseOpenAI}
      />
      
      {/* Show Summary Panel if summary is available, otherwise show Interactive Text Preview */}
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
          onBackToText={handleBackToText}
          contentId={contentId}
        />
      ) : (
        <InteractiveTextPreview
          content={content}
          currentPosition={selectedWordPosition}
          onWordClick={handleWordClick}
          onStartReading={() => handleStartReadingFromPosition(true, selectedWordPosition)}
          onSummarize={handleSummarize}
          title={title}
          isSummarizing={isSummarizing}
          summarizationError={summarizationError}
          contentId={contentId}
        />
      )}
    </div>
  );
};

export default ReaderOptions;
