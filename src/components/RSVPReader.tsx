
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Minimize, 
  Settings, 
  BookOpen,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RSVPReaderProps {
  text: string;
  contentId: string;
  title: string;
  source?: string; // Added source as an optional prop
}

const RSVPReader = ({ text, contentId, title, source }: RSVPReaderProps) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [optimalLetterPosition, setOptimalLetterPosition] = useState(0.35);
  const readerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Process text into words on component mount
  useEffect(() => {
    if (text) {
      // Split text into words, filtering out empty strings
      const processedWords = text
        .replace(/\n/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 0);
      setWords(processedWords);
    }
  }, [text]);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      startReading();
    } else {
      stopReading();
    }
    
    return () => {
      stopReading();
    };
  }, [isPlaying, wpm, currentWordIndex]);
  
  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Calculate the optimal letter position (OLP) for better reading
  const calculateOlp = (word: string): number => {
    const length = word.length;
    
    if (length <= 1) return 0;
    if (length <= 5) return 1;
    if (length <= 9) return 2;
    if (length <= 13) return 3;
    return 4;
  };

  // Format the current word to highlight the OLP
  const formatCurrentWord = (word: string) => {
    if (!word) return { before: "", highlight: "", after: "" };
    
    const olp = calculateOlp(word);
    
    return {
      before: word.substring(0, olp),
      highlight: word.charAt(olp),
      after: word.substring(olp + 1)
    };
  };

  // Start the reading animation
  const startReading = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    lastUpdateTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(updateReading);
  };

  // Update the current word based on WPM
  const updateReading = (timestamp: number) => {
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp;
      animationRef.current = requestAnimationFrame(updateReading);
      return;
    }
    
    const timePassed = timestamp - lastUpdateTimeRef.current;
    const msPerWord = 60000 / wpm;
    
    if (timePassed >= msPerWord) {
      lastUpdateTimeRef.current = timestamp;
      
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        toast({
          title: "Reading Complete",
          description: "You've reached the end of the content.",
        });
      }
    }
    
    if (isPlaying && currentWordIndex < words.length - 1) {
      animationRef.current = requestAnimationFrame(updateReading);
    }
  };

  // Stop the reading animation
  const stopReading = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    lastUpdateTimeRef.current = null;
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Navigation controls
  const goToNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const goToPreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === "ArrowRight") {
        goToNextWord();
      } else if (e.code === "ArrowLeft") {
        goToPreviousWord();
      }
    };
    
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const formatWord = formatCurrentWord(words[currentWordIndex] || "");
  const progress = words.length > 0 ? (currentWordIndex / words.length) * 100 : 0;
  
  return (
    <div 
      ref={readerRef} 
      className={`relative transition-all ${
        isFullscreen 
          ? "bg-gray-900 text-white" 
          : "bg-white dark:bg-gray-900 dark:text-white"
      }`}
    >
      {/* Top bar with title and back button */}
      <div className={`flex items-center justify-between p-4 ${isFullscreen ? "hidden" : ""}`}>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-lg font-medium truncate max-w-[70%]">{title}</h2>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span className="text-sm">{words.length} words</span>
        </div>
      </div>
      
      {/* Display source URL if available */}
      {source && (
        <div className={`px-4 pb-2 text-center ${isFullscreen ? "hidden" : ""}`}>
          <a 
            href={source} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Source: {source}
          </a>
        </div>
      )}

      {/* Main reading area */}
      <div className={`flex flex-col items-center justify-center ${
        isFullscreen ? "h-screen" : "h-[50vh] md:h-[60vh]"
      }`}>
        {/* Word display */}
        <div className="text-center mb-8">
          <div className={`font-mono ${
            isFullscreen ? "text-5xl md:text-7xl" : "text-3xl md:text-5xl"
          }`}>
            <span>{formatWord.before}</span>
            <span className="text-red-500 font-bold">{formatWord.highlight}</span>
            <span>{formatWord.after}</span>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Word {currentWordIndex + 1} of {words.length}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full max-w-lg mx-auto px-4">
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className={`p-4 ${isFullscreen ? "absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm" : ""}`}>
        <div className="max-w-lg mx-auto">
          {/* Reading controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={goToPreviousWord}
              disabled={currentWordIndex <= 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-24"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={goToNextWord}
              disabled={currentWordIndex >= words.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          {/* Speed controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Speed: {wpm} WPM</span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs">100</span>
              <Slider
                value={[wpm]}
                min={100}
                max={1000}
                step={10}
                onValueChange={(value) => setWpm(value[0])}
                className="flex-1"
              />
              <span className="text-xs">1000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSVPReader;
