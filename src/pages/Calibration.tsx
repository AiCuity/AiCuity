
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckIcon, AlertTriangle, InfoIcon, Loader2 } from 'lucide-react';
import CalibrationPassage from '@/components/Calibration/CalibrationPassage';
import ComprehensionQuiz from '@/components/Calibration/ComprehensionQuiz';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';

// Sample calibration passages with increasing WPM
const calibrationPassages = [
  {
    id: 'passage-1',
    title: 'Introduction to Speed Reading',
    content: `Speed reading is a collection of reading methods which attempt to increase rates of reading without greatly reducing comprehension or retention. Methods include chunking and minimizing subvocalization. No absolute distinct "normal" and "speed-reading" rates exist; reading speeds are variable. Speed reading is characterized by analyzing trade-offs between measures of speed and comprehension, recognizing that different types of reading call for different speed and comprehension rates. The benefits of speed reading include being able to process more information in less time, making you more efficient.`,
    wpm: 200,
    questions: [
      {
        id: 'q1-p1',
        text: 'What does speed reading attempt to do?',
        options: [
          'Reduce comprehension',
          'Increase reading rates without reducing comprehension',
          'Replace traditional reading',
          'Eliminate subvocalization completely'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2-p1',
        text: 'Which of the following is a method used in speed reading?',
        options: [
          'Extended pausing',
          'Maximizing subvocalization',
          'Chunking',
          'Single word focusing'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'passage-2',
    title: 'The Science Behind Memory',
    content: `Memory is the faculty of the brain by which data or information is encoded, stored, and retrieved when needed. It is the retention of information over time for the purpose of influencing future action. If past events could not be remembered, it would be impossible for language, relationships, or personal identity to develop. Memory loss is usually described as forgetfulness or amnesia. Memory is often understood as an informational processing system with explicit and implicit functioning that is made up of a sensory processor, short-term or working memory, and long-term memory. This can be related to the neuron. The sensory processor allows information from the outside world to be sensed in the form of chemical and physical stimuli and attended to various levels of focus and intent.`,
    wpm: 300,
    questions: [
      {
        id: 'q1-p2',
        text: 'What is memory defined as in the passage?',
        options: [
          'A physical part of the brain',
          'The faculty by which information is encoded, stored, and retrieved',
          'A chemical reaction in neurons',
          'The ability to forget unnecessary information'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2-p2',
        text: 'According to the passage, memory is understood as an informational processing system with:',
        options: [
          'Single unified function',
          'Random access capabilities',
          'Explicit and implicit functioning',
          'Limited storage capacity'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'passage-3',
    title: 'Cognitive Benefits of Reading',
    content: `Reading is a complex cognitive process of decoding symbols in order to construct or derive meaning. Reading is a means of language acquisition, communication, and sharing information and ideas. Like all language, it is a complex interaction between the text and the reader which is shaped by the reader's prior knowledge, experiences, attitude, and language community which is culturally and socially situated. The reading process requires continuous practice, development, and refinement. Reading requires creativity and critical analysis. Consumers of literature make ventures with each piece, innately deviating from literal words to create images that make sense to them in the unfamiliar places the texts describe. Because reading is such a complex process, it cannot be controlled or restricted to one or two interpretations. There are no concrete laws in reading, but rather allows readers an escape to produce their own products introspectively.`,
    wpm: 400,
    questions: [
      {
        id: 'q1-p3',
        text: 'What shapes the interaction between text and reader according to the passage?',
        options: [
          'The author's intention only',
          'The reading speed',
          'The reader's prior knowledge and experiences',
          'The difficulty of vocabulary'
        ],
        correctAnswer: 2
      },
      {
        id: 'q2-p3',
        text: 'According to the passage, reading:',
        options: [
          'Is a simple process of word recognition',
          'Has concrete laws that must be followed',
          'Requires creativity and critical analysis',
          'Is primarily about speed, not comprehension'
        ],
        correctAnswer: 2
      }
    ]
  },
];

const Calibration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    profile, 
    isLoading: profileLoading, 
    updateCalibrationStatus, 
    updatePreferredWpm,
    saveCalibrationResult 
  } = useProfile();
  
  const [step, setStep] = useState(0);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [completedPassages, setCompletedPassages] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, { comprehension: number }>>({}); 
  const [recommendedWpm, setRecommendedWpm] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!profileLoading && !user) {
      navigate('/login', { state: { from: '/calibration' }});
    }
  }, [user, profileLoading, navigate]);

  const handlePassageComplete = (passageId: string) => {
    setCompletedPassages(prev => [...prev, passageId]);
    setStep(1); // Move to quiz
  };

  const handleQuizComplete = async (passageId: string, score: number) => {
    setResults(prev => ({
      ...prev,
      [passageId]: { comprehension: score }
    }));
    
    // Save result to database
    const currentPassage = calibrationPassages[currentPassageIndex];
    await saveCalibrationResult(
      currentPassage.id,
      currentPassage.wpm,
      100, // Accuracy is always 100% in this implementation
      score
    );
    
    if (currentPassageIndex < calibrationPassages.length - 1) {
      // Move to next passage
      setCurrentPassageIndex(prev => prev + 1);
      setStep(0);
    } else {
      // All passages complete, calculate recommendation
      calculateRecommendation();
    }
  };

  const calculateRecommendation = () => {
    // Find highest WPM with comprehension score >= 70%
    let bestWpm = 200; // Default
    
    for (const passage of calibrationPassages) {
      const result = results[passage.id];
      if (result && result.comprehension >= 70) {
        bestWpm = Math.max(bestWpm, passage.wpm);
      }
    }
    
    setRecommendedWpm(bestWpm);
    setStep(2); // Move to results
  };

  const handleAcceptRecommendation = async () => {
    setIsSubmitting(true);
    
    try {
      if (recommendedWpm) {
        await updatePreferredWpm(recommendedWpm);
        await updateCalibrationStatus('completed');
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error saving recommendation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipCalibration = async () => {
    setIsSubmitting(true);
    
    try {
      await updateCalibrationStatus('skipped');
      navigate('/');
    } catch (error) {
      console.error('Error skipping calibration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Reading Speed Calibration</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Let's find your optimal reading speed for maximum comprehension
        </p>
      </div>

      {currentPassageIndex < calibrationPassages.length ? (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Passage {currentPassageIndex + 1} of {calibrationPassages.length}
              </span>
              <span className="text-sm text-gray-500">
                Testing {calibrationPassages[currentPassageIndex].wpm} WPM
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-2 bg-primary rounded-full" 
                style={{ width: `${(currentPassageIndex / calibrationPassages.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {step === 0 && (
            <CalibrationPassage 
              passage={calibrationPassages[currentPassageIndex]} 
              onComplete={handlePassageComplete} 
            />
          )}

          {step === 1 && (
            <ComprehensionQuiz 
              questions={calibrationPassages[currentPassageIndex].questions}
              passageId={calibrationPassages[currentPassageIndex].id}
              onComplete={handleQuizComplete}
            />
          )}
        </>
      ) : (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Results</CardTitle>
            <CardDescription>
              Based on your reading comprehension at different speeds
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendedWpm ? (
              <>
                <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
                  <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-800 dark:text-green-400">Recommendation Ready</AlertTitle>
                  <AlertDescription className="text-green-800 dark:text-green-400">
                    Your recommended reading speed is <strong>{recommendedWpm} WPM</strong>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="font-medium">Test Results:</h3>
                  {calibrationPassages.map(passage => {
                    const result = results[passage.id];
                    return (
                      <div key={passage.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{passage.wpm} WPM</p>
                          <p className="text-sm text-gray-500">{passage.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {result?.comprehension.toFixed(0)}% comprehension
                          </p>
                          <p className={`text-sm ${
                            result?.comprehension >= 70 ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {result?.comprehension >= 70 ? 'Good' : 'Below target'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button 
                    onClick={handleAcceptRecommendation} 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      'Use Recommended Speed'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    I'll Choose My Own Speed
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4">Calculating your recommendation...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentPassageIndex === 0 && step === 0 && (
        <div className="text-center mt-8">
          <Button variant="ghost" onClick={handleSkipCalibration}>
            Skip Calibration
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            You can always calibrate later from your profile settings
          </p>
        </div>
      )}
    </div>
  );
};

export default Calibration;
