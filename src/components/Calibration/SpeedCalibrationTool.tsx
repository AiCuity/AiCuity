import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { calculateDelay } from '@/utils/rsvp-timing';
import { processText } from '@/utils/rsvp-word-utils';
import CalibrationTestDisplay from './CalibrationTestDisplay';
import { useProfile } from '@/hooks/useProfile';
import { ArrowLeft, ArrowRight, Save, RotateCcw } from 'lucide-react';

const SAMPLE_TEXTS = [
  {
    level: 'Easy',
    text: "Reading is a cognitive process of decoding symbols to derive meaning. It is a form of language processing. Reading is a means for language acquisition, communication, and sharing information and ideas. Reading involves word recognition, comprehension, fluency, and motivation.",
  },
  {
    level: 'Medium',
    text: "The human brain is remarkably adaptable when it comes to reading. Studies have shown that with practice, the average reader can significantly increase their reading speed while maintaining comprehension. This is because the brain learns to process familiar patterns more efficiently over time.",
  },
  {
    level: 'Advanced',
    text: "Rapid Serial Visual Presentation (RSVP) is a method for displaying text in which each word is shown sequentially in the same position on a screen. This technique eliminates the need for eye movements during reading, which typically consume a significant portion of reading time.",
  }
];

const SPEED_LEVELS = [
  { name: 'Slow', wpm: 150 },
  { name: 'Average', wpm: 250 },
  { name: 'Fast', wpm: 400 },
  { name: 'Very Fast', wpm: 600 },
];

interface SpeedCalibrationToolProps {
  onComplete?: (wpm: number) => void;
  defaultWpm?: number;
}

const SpeedCalibrationTool: React.FC<SpeedCalibrationToolProps> = ({ 
  onComplete, 
  defaultWpm = 300 
}) => {
  const { toast } = useToast();
  const { profile, updatePreferredWpm } = useProfile();
  
  // States
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro');
  const [currentSpeedLevel, setCurrentSpeedLevel] = useState(1); // Start with average
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [testWpm, setTestWpm] = useState(SPEED_LEVELS[1].wpm); // Start with average speed
  const [preferredWpm, setPreferredWpm] = useState(defaultWpm);
  const [showQuestion, setShowQuestion] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [canUnderstand, setCanUnderstand] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Process test text into words
  useEffect(() => {
    if (currentTestIndex >= 0 && currentTestIndex < SAMPLE_TEXTS.length) {
      const processedWords = processText(SAMPLE_TEXTS[currentTestIndex].text);
      setWords(processedWords);
      setCurrentWordIndex(0);
    }
  }, [currentTestIndex]);
  
  // Set WPM based on speed level
  useEffect(() => {
    setTestWpm(SPEED_LEVELS[currentSpeedLevel].wpm);
  }, [currentSpeedLevel]);
  
  // Reset test when changing speed level
  useEffect(() => {
    setCurrentWordIndex(0);
    setIsPlaying(false);
    setShowQuestion(false);
    setTestComplete(false);
    setCanUnderstand(null);
  }, [testWpm]);
  
  // Animation frame for word display
  useEffect(() => {
    let animationFrameId: number | null = null;
    let lastUpdateTime: number | null = null;
    
    const updateReading = (timestamp: number) => {
      if (!isPlaying) return;
      
      // Initialize the time or continue
      if (lastUpdateTime === null) {
        lastUpdateTime = timestamp;
        animationFrameId = requestAnimationFrame(updateReading);
        return;
      }
      
      // Calculate delay based on current WPM
      const msPerWord = calculateDelay(testWpm, 0.5, false);
      
      // Check if enough time has passed
      const timePassed = timestamp - lastUpdateTime;
      if (timePassed >= msPerWord) {
        // Time to move to next word
        lastUpdateTime = timestamp;
        
        setCurrentWordIndex(prevIndex => {
          // Check if we've reached the end
          if (prevIndex >= words.length - 1) {
            setIsPlaying(false);
            setTestComplete(true);
            setTimeout(() => setShowQuestion(true), 500);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }
      
      // Continue the animation loop
      animationFrameId = requestAnimationFrame(updateReading);
    };
    
    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateReading);
    }
    
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, words, testWpm]);
  
  const startTest = () => {
    setCurrentWordIndex(0);
    setIsPlaying(true);
  };
  
  const restartTest = () => {
    setCurrentWordIndex(0);
    setIsPlaying(false);
    setShowQuestion(false);
    setTestComplete(false);
    setCanUnderstand(null);
  };
  
  const handleNext = () => {
    // If we're at the question stage
    if (showQuestion) {
      // If user understood, increase speed for next test
      if (canUnderstand === true && currentSpeedLevel < SPEED_LEVELS.length - 1) {
        setCurrentSpeedLevel(prev => prev + 1);
      } 
      // If user didn't understand, we found their limit
      else if (canUnderstand === false) {
        // Set preferred WPM to previous level as this was too fast
        const preferredSpeed = currentSpeedLevel > 0 
          ? SPEED_LEVELS[currentSpeedLevel - 1].wpm
          : SPEED_LEVELS[0].wpm;
        setPreferredWpm(preferredSpeed);
        setStep('result');
        return;
      }
      // If at max speed and still understands, use this speed
      else if (canUnderstand === true && currentSpeedLevel === SPEED_LEVELS.length - 1) {
        setPreferredWpm(SPEED_LEVELS[currentSpeedLevel].wpm);
        setStep('result');
        return;
      }
      
      // Move to next test or same test with new speed
      setCurrentTestIndex((prev) => (prev + 1) % SAMPLE_TEXTS.length);
      setShowQuestion(false);
      setTestComplete(false);
      setCanUnderstand(null);
    }
  };
  
  const savePreferredWpm = async () => {
    setIsSaving(true);
    
    try {
      // Save to profile if available
      if (updatePreferredWpm) {
        await updatePreferredWpm(preferredWpm);
      }
      
      // Also save to localStorage for anonymous users
      localStorage.setItem('preferred-wpm', preferredWpm.toString());
      
      // Enable smart pacing by default after calibration
      localStorage.setItem('smart-pacing', 'true');
      
      toast({
        title: "Reading Speed Saved",
        description: `Your preferred reading speed is now set to ${preferredWpm} WPM with Smart Pacing enabled.`,
      });
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(preferredWpm);
      }
    } catch (error) {
      console.error("Failed to save preferred WPM:", error);
      toast({
        title: "Error",
        description: "Failed to save your reading speed preference.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleManualWpmChange = (values: number[]) => {
    setPreferredWpm(values[0]);
  };
  
  const renderIntroScreen = () => (
    <CardContent className="space-y-4">
      <p>This tool will help you find your optimal reading speed for the RSVP reader.</p>
      <p>You'll read short passages at different speeds to find out what works best for you.</p>
      <p className="font-medium">How it works:</p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>You'll read a short passage at a specific speed</li>
        <li>After reading, you'll be asked if you understood the passage</li>
        <li>Based on your response, the speed will adjust</li>
        <li>We'll find your optimal reading speed that balances speed and comprehension</li>
      </ol>
      <Button className="w-full mt-6" onClick={() => setStep('test')}>
        Start Calibration
      </Button>
    </CardContent>
  );
  
  const renderTestScreen = () => (
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-sm text-muted-foreground">Test {currentTestIndex + 1} of {SAMPLE_TEXTS.length}</p>
          <p className="font-medium">{SAMPLE_TEXTS[currentTestIndex].level} Text</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Speed Level</p>
          <p className="font-medium">{SPEED_LEVELS[currentSpeedLevel].name} ({testWpm} WPM)</p>
        </div>
      </div>
      
      <Progress 
        value={((currentTestIndex * SPEED_LEVELS.length + currentSpeedLevel) / 
                (SAMPLE_TEXTS.length * SPEED_LEVELS.length)) * 100} 
        className="h-2" 
      />
      
      {!isPlaying && !testComplete ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <p>Ready to test your reading at {testWpm} WPM?</p>
          <Button onClick={startTest}>Begin Reading</Button>
        </div>
      ) : null}
      
      {(isPlaying || testComplete) && !showQuestion ? (
        <CalibrationTestDisplay
          words={words}
          currentWordIndex={currentWordIndex}
          totalWords={words.length}
          isPlaying={isPlaying}
          isComplete={testComplete}
          onTogglePlayPause={() => setIsPlaying(!isPlaying)}
        />
      ) : null}
      
      {showQuestion ? (
        <div className="py-6 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Did you understand the text?</h3>
            <p className="text-muted-foreground">
              Could you confidently explain what you just read to someone else?
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button 
              variant={canUnderstand === false ? "default" : "outline"}
              onClick={() => setCanUnderstand(false)}
              className="flex-1"
            >
              No, too fast
            </Button>
            <Button 
              variant={canUnderstand === true ? "default" : "outline"}
              onClick={() => setCanUnderstand(true)}
              className="flex-1"
            >
              Yes, understood
            </Button>
          </div>
          
          {canUnderstand !== null && (
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={restartTest}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </CardContent>
  );
  
  const renderResultScreen = () => (
    <CardContent className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-medium mb-2">Your Optimal Reading Speed</h3>
        <div className="text-4xl font-bold py-4">{preferredWpm} WPM</div>
        <p className="text-muted-foreground">
          This speed balances reading speed with good comprehension.
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Adjust if needed:</span>
          <span>{preferredWpm} WPM</span>
        </div>
        <Slider
          value={[preferredWpm]}
          min={100}
          max={1000}
          step={10}
          onValueChange={handleManualWpmChange}
        />
      </div>
      
      <div className="flex flex-col space-y-2 pt-4">
        <Button onClick={savePreferredWpm} disabled={isSaving}>
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Reading Speed
            </>
          )}
        </Button>
        <Button variant="outline" onClick={() => setStep('test')}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Recalibrate
        </Button>
      </div>
    </CardContent>
  );
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Reading Speed Calibration</CardTitle>
        <CardDescription>
          Find your optimal reading speed for the RSVP reader
        </CardDescription>
      </CardHeader>
      
      {step === 'intro' && renderIntroScreen()}
      {step === 'test' && renderTestScreen()}
      {step === 'result' && renderResultScreen()}
      
      {step !== 'intro' && (
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="ghost" 
            onClick={() => step === 'test' ? setStep('intro') : setStep('test')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 'test' ? 'Back to Intro' : 'Back to Test'}
          </Button>
          
          {step === 'test' && (
            <Button variant="outline" onClick={() => setStep('result')}>
              Skip to Results
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default SpeedCalibrationTool;
