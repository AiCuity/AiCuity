
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import CalibrationPassage from "@/components/Calibration/CalibrationPassage";
import ComprehensionQuiz from "@/components/Calibration/ComprehensionQuiz";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

// Sample calibration passages with increasing complexity and WPM
const CALIBRATION_PASSAGES = [
  {
    id: "easy-100",
    title: "Basic Reading (100 WPM)",
    content: "Reading is a cognitive process of decoding symbols to derive meaning. It is a form of language processing. Reading is a means for language acquisition, communication, and sharing information and ideas. Reading involves word recognition, comprehension, fluency, and motivation.",
    wpm: 100,
    questions: [
      { id: "q1", text: "What is reading described as?", options: ["A physical activity", "A cognitive process", "A mathematical calculation", "A form of entertainment"], correctAnswer: "A cognitive process" },
      { id: "q2", text: "What does reading involve?", options: ["Only comprehension", "Only word recognition", "Word recognition, comprehension, fluency, and motivation", "None of the above"], correctAnswer: "Word recognition, comprehension, fluency, and motivation" }
    ]
  },
  {
    id: "medium-300",
    title: "Intermediate Reading (300 WPM)",
    content: "The human brain is remarkably adaptable when it comes to reading. Studies have shown that with practice, the average reader can significantly increase their reading speed while maintaining comprehension. This is because the brain learns to process familiar patterns more efficiently over time, allowing it to decode text faster. However, there is a natural limit to how fast one can read while still fully understanding the content.",
    wpm: 300,
    questions: [
      { id: "q1", text: "What happens to reading speed with practice?", options: ["It decreases", "It remains the same", "It increases significantly", "It fluctuates unpredictably"], correctAnswer: "It increases significantly" },
      { id: "q2", text: "Why can the brain read faster with practice?", options: ["Because eyes get stronger", "Because it processes familiar patterns more efficiently", "Because text becomes easier", "Because vocabulary increases"], correctAnswer: "Because it processes familiar patterns more efficiently" }
    ]
  },
  {
    id: "advanced-500",
    title: "Advanced Reading (500 WPM)",
    content: "Rapid Serial Visual Presentation (RSVP) is a method for displaying text in which each word is shown sequentially in the same position on a screen. This technique eliminates the need for eye movements during reading, which typically consume a significant portion of reading time. RSVP can potentially allow for much higher reading speeds, but it may affect comprehension differently than traditional reading methods. Some studies suggest that while factual recall might be preserved, deeper comprehension and inference might be impacted at very high presentation rates.",
    wpm: 500,
    questions: [
      { id: "q1", text: "What does RSVP eliminate during reading?", options: ["The need for comprehension", "The need for eye movements", "The need for memory", "The need for vocabulary"], correctAnswer: "The need for eye movements" },
      { id: "q2", text: "What might be impacted at very high presentation rates?", options: ["Only factual recall", "Only vocabulary recognition", "Deeper comprehension and inference", "Visual processing"], correctAnswer: "Deeper comprehension and inference" }
    ]
  },
  {
    id: "expert-700",
    title: "Expert Reading (700 WPM)",
    content: "The neurocognitive mechanisms underlying reading comprehension involve a complex network of brain regions that work in concert. The visual word form area (VWFA) in the left fusiform gyrus is specialized for recognizing written words, while Wernicke's area in the left temporal lobe is crucial for language comprehension. Meanwhile, Broca's area in the left frontal lobe is involved in language processing and production. The prefrontal cortex is engaged for higher-order cognitive functions such as inference and integration. Individual differences in reading ability can be attributed to the efficiency of these neural circuits and their interconnections, which can be influenced by factors such as genetics, education, and reading experience.",
    wpm: 700,
    questions: [
      { id: "q1", text: "Which brain region is specialized for recognizing written words?", options: ["Wernicke's area", "The prefrontal cortex", "Broca's area", "The visual word form area (VWFA)"], correctAnswer: "The visual word form area (VWFA)" },
      { id: "q2", text: "What factors can influence neural circuits related to reading?", options: ["Only genetics", "Only education", "Only reading experience", "Genetics, education, and reading experience"], correctAnswer: "Genetics, education, and reading experience" }
    ]
  }
];

const Calibration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading, updatePreferredWpm, updateCalibrationStatus, saveCalibrationResult } = useProfile();
  
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [readingMode, setReadingMode] = useState(true); // true for reading, false for quiz
  const [results, setResults] = useState<Array<{ passageId: string, wpm: number, score: number }>>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [calibrationComplete, setCalibrationComplete] = useState(false);
  const [recommendedWpm, setRecommendedWpm] = useState(300);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("You must be logged in to calibrate your reading speed");
      navigate("/login");
    }
  }, [user, isLoading, navigate]);
  
  // Calculate progress percentage
  const totalSteps = CALIBRATION_PASSAGES.length * 2; // Reading + quiz for each passage
  const currentStep = currentPassageIndex * 2 + (readingMode ? 0 : 1);
  const progress = Math.round((currentStep / totalSteps) * 100);
  
  const currentPassage = CALIBRATION_PASSAGES[currentPassageIndex];
  
  const handleReadingComplete = () => {
    setReadingMode(false);
  };
  
  const handleQuizSubmit = (answers: Record<string, string>) => {
    const currentQuiz = currentPassage.questions;
    let correctAnswers = 0;
    
    // Calculate score
    Object.entries(answers).forEach(([questionId, selectedAnswer]) => {
      const question = currentQuiz.find(q => q.id === questionId);
      if (question && question.correctAnswer === selectedAnswer) {
        correctAnswers++;
      }
    });
    
    const score = (correctAnswers / currentQuiz.length) * 100;
    
    // Save result for this passage
    setResults([...results, {
      passageId: currentPassage.id,
      wpm: currentPassage.wpm,
      score: score
    }]);
    
    // Move to next passage or complete calibration
    if (currentPassageIndex < CALIBRATION_PASSAGES.length - 1) {
      setCurrentPassageIndex(currentPassageIndex + 1);
      setReadingMode(true);
      setQuizAnswers({});
    } else {
      completeCalibration();
    }
  };
  
  const completeCalibration = async () => {
    // Calculate recommended WPM based on results
    const validResults = results.filter(r => r.score >= 70); // Only consider passages with good comprehension
    
    let optimalWpm = 300; // Default
    if (validResults.length > 0) {
      // Find the highest WPM where comprehension was still good
      const maxValidWpm = Math.max(...validResults.map(r => r.wpm));
      optimalWpm = maxValidWpm;
    }
    
    setRecommendedWpm(optimalWpm);
    setCalibrationComplete(true);
    
    if (user) {
      // Save to database
      try {
        // Save individual calibration results
        for (const result of results) {
          await saveCalibrationResult(
            result.passageId,
            result.wpm,
            result.score, // Accuracy score
            result.score  // Using the same score for comprehension for now
          );
        }
        
        // Update user's preferred WPM
        await updatePreferredWpm(optimalWpm);
        
        // Update calibration status
        await updateCalibrationStatus('calibrated');
        
        toast.success("Calibration results saved successfully!");
      } catch (error) {
        console.error("Error saving calibration results:", error);
        toast.error("Failed to save calibration results");
      }
    }
  };
  
  const handleApplySettings = () => {
    navigate('/');
    toast.success(`Your reading speed is now set to ${recommendedWpm} WPM`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Reading Speed Calibration</h1>
        </div>
        
        {!calibrationComplete ? (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  {readingMode ? "Reading Test" : "Comprehension Quiz"}: {currentPassage.title}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {readingMode 
                    ? `Read at ${currentPassage.wpm} WPM. Focus on understanding the content.` 
                    : "Answer questions about the passage you just read."}
                </p>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {readingMode ? (
                <CalibrationPassage 
                  text={currentPassage.content} 
                  wpm={currentPassage.wpm}
                  title={currentPassage.title}
                  onComplete={handleReadingComplete}
                />
              ) : (
                <ComprehensionQuiz 
                  questions={currentPassage.questions}
                  answers={quizAnswers}
                  setAnswers={setQuizAnswers}
                  onSubmit={handleQuizSubmit}
                />
              )}
            </Card>
            
            <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle>Calibration in progress</AlertTitle>
              <AlertDescription>
                You're testing your reading speed at different rates. Complete all passages to find your optimal reading speed.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold">Calibration Complete!</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                <p>Based on your performance, your recommended reading speed is:</p>
                <div className="text-4xl font-bold text-center py-4">{recommendedWpm} WPM</div>
                <p className="text-sm text-gray-500">
                  This speed balances optimal reading speed with good comprehension. You can always adjust this later.
                </p>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full" onClick={handleApplySettings}>
                  Apply and Continue
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                  Skip for now
                </Button>
              </div>
            </Card>
            
            <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Calibration Saved</AlertTitle>
              <AlertDescription>
                Your results have been saved to your profile. You can recalibrate anytime from your profile settings.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calibration;
