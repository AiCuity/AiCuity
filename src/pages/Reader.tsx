import LoadingState from "@/components/Reader/LoadingState";
import NotFoundState from "@/components/Reader/NotFoundState";
import ReaderAlerts from "@/components/Reader/ReaderAlerts";
import RSVPReaderContainer from "@/components/Reader/RSVPReaderContainer";
import ReaderOptions from "@/components/Reader/ReaderOptions";
import ContentHeader from "@/components/Reader/ContentHeader";
import { useReaderPage } from "@/hooks/useReaderPage";

const Reader = () => {
  const {
    contentId,
    content,
    title,
    source,
    isLoading,
    isSimulated,
    summary,
    isSummarizing,
    summarizationProgress,
    summarizationError,
    initialPosition,
    savedWpm,
    showReader,
    useFullText,
    apiKey,
    useOpenAI,
    selectedWordPosition,
    handleStartReading,
    handleStartReadingFromPosition,
    handleWordClick,
    handleSummarize,
    handleRetrySummarization,
    handleBackToText,
    handleCloseReader,
    setApiKey,
    setUseOpenAI
  } = useReaderPage();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!content) {
    return <NotFoundState />;
  }

  if (showReader) {
    console.log("Rendering RSVPReaderContainer with savedWpm:", savedWpm);
    return (
      <RSVPReaderContainer
        useFullText={useFullText}
        content={content}
        summary={summary}
        contentId={contentId}
        title={title}
        source={source}
        initialPosition={initialPosition}
        initialWpm={savedWpm} // Make sure to pass the savedWpm to the container
        onCloseReader={handleCloseReader}
      />
    );
  }

  // Create a content object to match the ContentHeader props
  const contentObject = {
    title,
    source,
    url: source?.startsWith('http') ? source : undefined
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Full-width sticky header */}
      <ContentHeader content={contentObject} contentId={contentId} />
      
      {/* Main content container */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-4xl">
        <ReaderAlerts 
          isSimulated={isSimulated} 
          initialPosition={initialPosition} 
          content={content} 
        />

        <ReaderOptions
          apiKey={apiKey}
          useOpenAI={useOpenAI}
          setApiKey={setApiKey}
          setUseOpenAI={setUseOpenAI}
          summary={summary}
          content={content}
          title={title}
          source={source}
          isSummarizing={isSummarizing}
          summarizationProgress={summarizationProgress}
          summarizationError={summarizationError}
          selectedWordPosition={selectedWordPosition}
          contentId={contentId}
          handleSummarize={() => handleSummarize(apiKey, useOpenAI)}
          handleStartReading={handleStartReading}
          handleStartReadingFromPosition={handleStartReadingFromPosition}
          handleWordClick={handleWordClick}
          handleRetrySummarization={handleRetrySummarization}
          handleBackToText={handleBackToText}
        />
      </div>
    </div>
  );
};

export default Reader;
