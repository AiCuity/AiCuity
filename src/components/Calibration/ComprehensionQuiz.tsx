
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface ComprehensionQuizProps {
  questions: Question[];
  passageId: string;
  onComplete: (passageId: string, score: number) => void;
}

const ComprehensionQuiz: React.FC<ComprehensionQuizProps> = ({ 
  questions, 
  passageId,
  onComplete 
}) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  
  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };
  
  const handleSubmit = () => {
    setSubmitted(true);
    
    // Calculate score (percentage correct)
    const totalQuestions = questions.length;
    const correctAnswers = questions.reduce((count, question) => {
      return answers[question.id] === question.correctAnswer ? count + 1 : count;
    }, 0);
    
    const scorePercentage = (correctAnswers / totalQuestions) * 100;
    onComplete(passageId, scorePercentage);
  };
  
  const allQuestionsAnswered = questions.every(q => answers[q.id] !== undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comprehension Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-3">
            <h3 className="font-medium">
              {index + 1}. {question.text}
            </h3>
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
              disabled={submitted}
            >
              {question.options.map((option, optionIndex) => (
                <div 
                  key={optionIndex} 
                  className={`flex items-center space-x-2 ${
                    submitted && 
                    (optionIndex === question.correctAnswer ? 
                      'bg-green-50 p-2 rounded-md border border-green-200' : 
                      answers[question.id] === optionIndex ? 
                        'bg-red-50 p-2 rounded-md border border-red-200' : 
                        '')
                  }`}
                >
                  <RadioGroupItem 
                    value={optionIndex.toString()} 
                    id={`${question.id}-option-${optionIndex}`} 
                  />
                  <Label htmlFor={`${question.id}-option-${optionIndex}`}>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
        
        {!submitted && (
          <Button 
            onClick={handleSubmit} 
            disabled={!allQuestionsAnswered}
            className="w-full mt-4"
          >
            Submit Answers
          </Button>
        )}
        
        {submitted && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-center">
            <p className="font-medium text-blue-800">
              Your answers have been submitted. Continuing to the next step...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComprehensionQuiz;
