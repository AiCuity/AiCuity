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

  // Simple word buffering for high-speed streaming
  const wordBufferRef = useRef<Array<{
    wordIndex: number;
    word: string;
    wpm: number;
    effectiveWpm: number;
    timestamp: number;
  }>>([]);
  const bufferFlushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastStreamedWordRef = useRef<number>(-1);

  // Stream RSVP data when reading - with properly synchronized buffering
  useEffect(() => {
    if (!arStreamingEnabled || !isConnected || !isPlaying || activeSessions.length === 0) {
      return;
    }

    // Only buffer if word actually changed
    if (lastStreamedWordRef.current === currentWordIndex) {
      return;
    }

    // Add word to buffer
    wordBufferRef.current.push({
      wordIndex: currentWordIndex,
      word: words[currentWordIndex] || '',
      wpm: baseWpm,
      effectiveWpm,
      timestamp: Date.now()
    });

    lastStreamedWordRef.current = currentWordIndex;
    console.log(`📝 Buffered word ${currentWordIndex}: "${words[currentWordIndex]}" (buffer: ${wordBufferRef.current.length})`);

    // Clear existing timeout
    if (bufferFlushTimeoutRef.current) {
      clearTimeout(bufferFlushTimeoutRef.current);
    }

    // Calculate timing based on WPM - each word takes this long
    const msPerWord = (60 * 1000) / baseWpm;
    
    // Buffer sizing based on speed - larger buffers for stable display
    const optimalBufferSize = baseWpm > 400 ? 6 : baseWpm > 300 ? 7 : 8; // Larger buffers to reduce network calls
    const flushDelay = Math.max(300, msPerWord * 2.0); // Slower flushing to match AR display timing

    if (wordBufferRef.current.length >= optimalBufferSize) {
      // Flush immediately if buffer is optimal size
      console.log(`🚀 Buffer reached optimal size (${optimalBufferSize}), flushing immediately`);
      flushWordBuffer();
    } else {
      // Schedule flush based on word timing
      bufferFlushTimeoutRef.current = setTimeout(() => {
        console.log(`⏰ Timer flush triggered after ${flushDelay.toFixed(0)}ms`);
        flushWordBuffer();
      }, flushDelay);
    }

    // Cleanup function
    return () => {
      if (bufferFlushTimeoutRef.current) {
        clearTimeout(bufferFlushTimeoutRef.current);
      }
    };
  }, [arStreamingEnabled, isConnected, isPlaying, currentWordIndex, baseWpm, activeSessions.length]);

  // Function to flush the word buffer
  const flushWordBuffer = async () => {
    if (wordBufferRef.current.length === 0) return;

    const buffer = [...wordBufferRef.current];
    wordBufferRef.current = []; // Clear immediately

    const msPerWord = (60 * 1000) / (buffer[0]?.wpm || 300);
    console.log(`📦 Flushing ${buffer.length} words to AR server (${buffer[0]?.wpm} WPM = ${msPerWord.toFixed(0)}ms per word)`);
    console.log(`📋 Words: [${buffer.map(w => `${w.wordIndex}:"${w.word}"`).join(', ')}]`);

    try {
      // Send words as array in single API call
      await streamRSVPData({
        wordBuffer: buffer,
        isBuffered: true,
        totalWords: words.length,
        currentProgress: progress
      });
      console.log(`✅ Successfully sent ${buffer.length} words to AR`);
    } catch (error) {
      console.error('❌ Error flushing word buffer:', error);
      // Re-add failed words to buffer for retry (at the beginning)
      wordBufferRef.current = [...buffer, ...wordBufferRef.current];
    }
  };

  // Flush buffer when reading stops or streaming disabled
  useEffect(() => {
    if (!isPlaying && wordBufferRef.current.length > 0) {
      console.log('📤 Reading paused, flushing remaining buffer');
      flushWordBuffer();
    }
  }, [isPlaying]);

  // Reset buffer when streaming disabled
  useEffect(() => {
    if (!arStreamingEnabled) {
      // Flush any remaining words before clearing
      if (wordBufferRef.current.length > 0) {
        console.log('📤 AR streaming disabled, flushing remaining buffer');
        flushWordBuffer();
      }
      
      wordBufferRef.current = [];
      lastStreamedWordRef.current = -1;
      if (bufferFlushTimeoutRef.current) {
        clearTimeout(bufferFlushTimeoutRef.current);
      }
    }
  }, [arStreamingEnabled]);

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
            className={`flex items-center gap-1 sm:gap-2 min-w-0 max-w-full ${
              isConnected && sessionToken && activeSessions.length > 0 ? 'border-green-500 text-green-600' : 
              arStreamingEnabled ? 'border-yellow-500 text-yellow-600' : ''
            }`}
            title={connectionError || (sessionToken ? 'Session active' : 'No session token')}
          >
            {isConnected && sessionToken && activeSessions.length > 0 ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Glasses className="h-4 w-4" />
                {activeSessions.length > 1 && (
                  <div className="flex items-center">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">{activeSessions.length}</span>
                  </div>
                )}
              </div>
            ) : (
              <WifiOff className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="hidden sm:inline truncate">
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
