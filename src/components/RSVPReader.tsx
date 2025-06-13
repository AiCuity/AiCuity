import { useRef, useEffect, useState } from "react";
import { useRSVPReader } from "@/hooks/useRSVPReader";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useAugmentOSIntegration } from "@/hooks/useAugmentOSIntegration";
import { useAuth } from "@/context/AuthContext";
import KeyboardControls from "./RSVPReader/KeyboardControls";
import TitleBar from "./RSVPReader/TitleBar";
import SourceLink from "./RSVPReader/SourceLink";
import ReadingArea from "./RSVPReader/ReadingArea";
import ControlsContainer from "./RSVPReader/ControlsContainer";
import { useNotifications } from "@/hooks/rsvp/useNotifications";
import { Button } from "@/components/ui/button";
import { Glasses, WifiOff, Users } from "lucide-react";

const AUGMENTOS_SERVER_URL = import.meta.env.VITE_AUGMENTOS_SERVER_URL || 'http://localhost:3001';

interface RSVPReaderProps {
  text: string;
  contentId: string;
  title: string;
  source?: string;
  initialPosition?: number;
  initialWpm?: number;
  isGlassesMode?: boolean;
  onCloseReader?: () => void;
}

const RSVPReader = ({ 
  text, 
  contentId, 
  title, 
  source, 
  initialPosition = 0,
  initialWpm,
  isGlassesMode = false,
  onCloseReader
}: RSVPReaderProps) => {
  const { user } = useAuth();
  const readerRef = useRef<HTMLDivElement>(null);
  const { showNotifications, setShowNotifications, toggleNotifications } = useNotifications(false);
  const [arStreamingEnabled, setArStreamingEnabled] = useState(false);
  const [augmentOSServerUrl] = useState(AUGMENTOS_SERVER_URL);
  
  const {
    words,
    currentWordIndex,
    isPlaying,
    setIsPlaying,
    baseWpm,
    effectiveWpm,
    smartPacingEnabled,
    currentComplexity,
    goToNextWord,
    goToPreviousWord,
    toggleSmartPacing,
    handleWpmChange,
    formattedWord,
    progress,
    restartReading,
    savePosition,
    setShowToasts
  } = useRSVPReader({ 
    text, 
    initialPosition, 
    contentId,
    initialWpm: initialWpm || undefined,
    initialShowToasts: showNotifications
  });
  
  const { isFullscreen, toggleFullscreen } = useFullscreen(readerRef);

  // AugmentOS Integration
  const { 
    isConnected, 
    activeSessions,
    connectionError,
    sessionToken,
    streamRSVPData,
    generateSessionToken
  } = useAugmentOSIntegration({
    serverUrl: augmentOSServerUrl,
    enabled: arStreamingEnabled,
    contentId: contentId,
    userId: user?.id
  });

  // Stream RSVP data when reading
  useEffect(() => {
    if (arStreamingEnabled && isConnected && isPlaying && activeSessions.length > 0) {
      const streamData = {
        currentWordIndex,
        word: {
          full: words[currentWordIndex] || '',
          before: formattedWord.before,
          highlight: formattedWord.highlight,
          after: formattedWord.after
        },
        wpm: baseWpm,
        effectiveWpm,
        complexity: currentComplexity,
        isPlaying,
        progress,
        totalWords: words.length
      };
      
      streamRSVPData(streamData);
    }
  }, [
    arStreamingEnabled, 
    isConnected, 
    isPlaying, 
    currentWordIndex, 
    formattedWord, 
    baseWpm, 
    effectiveWpm, 
    currentComplexity, 
    progress, 
    words,
    activeSessions,
    streamRSVPData
  ]);

  // Toggle notifications handler
  const handleToggleNotifications = () => {
    toggleNotifications();
    setShowToasts(!showNotifications);
  };

  // Toggle AR streaming
  const handleToggleArStreaming = async () => {
    const newState = !arStreamingEnabled;
    setArStreamingEnabled(newState);
    
    // If enabling AR streaming, generate token immediately
    if (newState && !sessionToken && contentId && user) {
      console.log('AR streaming enabled, generating session token...');
      await generateSessionToken();
    }
  };

  return (
    <div 
      ref={readerRef} 
      className={`relative transition-all ${
        isFullscreen 
          ? "bg-gray-900 text-white" 
          : "bg-white dark:bg-gray-900 dark:text-white"
      }`}
    >
      <KeyboardControls 
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={goToNextWord}
        onPrevious={goToPreviousWord}
      />
      
      <TitleBar 
        title={title} 
        wordCount={words.length}
        isFullscreen={isFullscreen}
        isGlassesMode={isGlassesMode}
        contentId={contentId}
        onCloseReader={onCloseReader}
        source={source}
      />
      
      {/* <SourceLink source={source} isFullscreen={isFullscreen} /> */}

      <ReadingArea
        isFullscreen={isFullscreen}
        formattedWord={formattedWord}
        progress={progress}
        currentComplexity={currentComplexity}
        isGlassesMode={isGlassesMode}
      />
      
      <ControlsContainer
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onPrevious={goToPreviousWord}
        onNext={goToNextWord}
        onRestart={restartReading}
        disablePrevious={currentWordIndex <= 0}
        disableNext={currentWordIndex >= words.length - 1}
        smartPacingEnabled={smartPacingEnabled}
        onToggleSmartPacing={toggleSmartPacing}
        currentWordIndex={currentWordIndex}
        totalWords={words.length}
        effectiveWpm={effectiveWpm}
        baseWpm={baseWpm}
        onWpmChange={handleWpmChange}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onSavePosition={savePosition}
        showNotifications={showNotifications}
        onToggleNotifications={handleToggleNotifications}
        isGlassesMode={isGlassesMode}
      />
      
      {/* AugmentOS Streaming Control */}
      {!isGlassesMode && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant={arStreamingEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggleArStreaming}
            className={`flex items-center gap-2 ${
              isConnected && sessionToken && activeSessions.length > 0 ? 'border-green-500 text-green-600' : 
              arStreamingEnabled ? 'border-yellow-500 text-yellow-600' : ''
            }`}
            title={connectionError || (sessionToken ? 'Session active' : 'No session token')}
          >
            {isConnected && sessionToken && activeSessions.length > 0 ? (
              <div className="flex items-center gap-1">
                <Glasses className="h-4 w-4" />
                {activeSessions.length > 1 && (
                  <div className="flex items-center">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">{activeSessions.length}</span>
                  </div>
                )}
              </div>
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isConnected && sessionToken && activeSessions.length > 0
                ? `AR Connected (${activeSessions.length})` 
                : arStreamingEnabled 
                ? sessionToken ? 'AR Connecting...' : 'Generating Token...'
                : 'AR Stream'}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default RSVPReader;
