
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string; // Changed to string to match the data structure
}

interface ComprehensionQuizProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void; // Changed to match expected usage
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const ComprehensionQuiz: React.FC<ComprehensionQuizProps> = ({ 
  questions,
  answers,
  setAnswers, 
  onSubmit 
}) => {
  const [submitted, setSubmitted] = useState(false);
  
  const handleAnswerChange = (questionId: string, selectedAnswer: string) => {
    setAnswers({
      ...answers,
      [questionId]: selectedAnswer
    });
  };
  
  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit(answers);
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
              value={answers[question.id]}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              disabled={submitted}
            >
              {question.options.map((option, optionIndex) => (
                <div 
                  key={optionIndex} 
                  className={`flex items-center space-x-2 ${
                    submitted && 
                    (option === question.correctAnswer ? 
                      'bg-green-50 p-2 rounded-md border border-green-200' : 
                      answers[question.id] === option ? 
                        'bg-red-50 p-2 rounded-md border border-red-200' : 
                        '')
                  }`}
                >
                  <RadioGroupItem 
                    value={option} 
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
