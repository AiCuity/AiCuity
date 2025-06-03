import React from 'react';
import ApiKeyConfig from "@/components/ApiKeyConfig";
import SummaryPanel from "@/components/SummaryPanel";
import SummarizePrompt from "@/components/Reader/SummarizePrompt";
import ContentPreview from "@/components/Reader/ContentPreview";
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
  handleSummarize: () => void;
  handleStartReading: (useFull: boolean) => void;
  handleStartReadingFromPosition: (useFull: boolean, position?: number) => void;
  handleWordClick: (wordIndex: number) => void;
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
  selectedWordPosition,
  handleSummarize,
  handleStartReading,
  handleStartReadingFromPosition,
  handleWordClick,
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
      
      {/* Show Interactive Text Preview first if there's a saved position */}
      {selectedWordPosition > 0 && (
        <InteractiveTextPreview
          content={content}
          currentPosition={selectedWordPosition}
          onWordClick={handleWordClick}
          onStartReading={() => handleStartReadingFromPosition(true, selectedWordPosition)}
          title={title}
        />
      )}
      
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
      
      {/* Show Interactive Text Preview below other options if no saved position */}
      {selectedWordPosition === 0 && (
        <InteractiveTextPreview
          content={content}
          currentPosition={selectedWordPosition}
          onWordClick={handleWordClick}
          onStartReading={() => handleStartReadingFromPosition(true, selectedWordPosition)}
          title={title}
        />
      )}
      
      <ContentPreview content={content} />
    </div>
  );
};

export default ReaderOptions;
