
import { useState } from "react";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResults } from "./QuizResults";
import { SignUpForm } from "./SignUpForm";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { QuizIntro } from "./QuizIntro";

type QuizStep = 'intro' | 'question1' | 'question2' | 'question3' | 'question4' | 'question5' | 'results' | 'signup';

export function QuizContainer() {
  const [step, setStep] = useState<QuizStep>('intro');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showIntro, setShowIntro] = useState(true);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    switch (step) {
      case 'intro':
        setStep('question1');
        break;
      case 'question1':
        setStep('question2');
        break;
      case 'question2':
        setStep('question3');
        break;
      case 'question3':
        setStep('question4');
        break;
      case 'question4':
        setStep('question5');
        break;
      case 'question5':
        setStep('results');
        break;
      case 'results':
        setStep('signup');
        break;
    }
  };

  const startQuiz = () => {
    setShowIntro(false);
    handleNext();
  };

  // Define quiz questions
  const questions = {
    question1: {
      question: "How often do you check your score trends after a round?",
      options: [
        { id: "A", text: "Always — I log every round somewhere." },
        { id: "B", text: "Sometimes — I look at my final score but forget the details." },
        { id: "C", text: "Rarely — I just remember the good shots and bad ones." },
        { id: "D", text: "Never — I just know if I played well or not." }
      ]
    },
    question2: {
      question: "When was the last time you compared your score to other golfers at your favorite course?",
      options: [
        { id: "A", text: "Recently — I love a little competition." },
        { id: "B", text: "I've tried, but there's no easy way to do it." },
        { id: "C", text: "I have no idea what others are scoring — I just play my game." },
        { id: "D", text: "Never — I didn't even know I could do that." }
      ]
    },
    question3: {
      question: "What's the hardest part about improving your game?",
      options: [
        { id: "A", text: "Figuring out why my scores aren't dropping." },
        { id: "B", text: "Staying motivated without clear goals." },
        { id: "C", text: "Not knowing what I'm doing wrong." },
        { id: "D", text: "Tracking progress feels like a hassle." }
      ]
    },
    question4: {
      question: "How do you currently set goals for your game?",
      options: [
        { id: "A", text: "I track my personal bests and try to beat them." },
        { id: "B", text: "I want to break a certain score — like 90 or 80." },
        { id: "C", text: "I go round by round, hoping to play better each time." },
        { id: "D", text: "I don't have clear goals — I just want to improve." }
      ]
    },
    question5: {
      question: "How confident are you that your game is actually improving?",
      options: [
        { id: "A", text: "Very — I track my scores and see the progress." },
        { id: "B", text: "Somewhat — I think I'm getting better, but I'm not sure." },
        { id: "C", text: "Not really — it feels like I'm stuck at the same level." },
        { id: "D", text: "I have no idea — I don't track my game closely." }
      ]
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <QuizIntro 
        isOpen={showIntro} 
        onClose={() => setShowIntro(false)}
        onStart={startQuiz}
      />
      
      {step.startsWith('question') && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg animate-fade-in border border-white/20">
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Question {step.replace('question', '')} of 5
              </span>
              <span className="text-sm font-medium">
                {Math.round((parseInt(step.replace('question', '')) / 5) * 100)}% Complete
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(parseInt(step.replace('question', '')) / 5) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <QuizQuestion
            question={questions[step as keyof typeof questions].question}
            options={questions[step as keyof typeof questions].options}
            selectedAnswer={answers[step] || ''}
            onSelect={(answer) => handleAnswer(step, answer)}
          />
          
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleNext}
              disabled={!answers[step]}
              className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {step === 'results' && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <QuizResults onContinue={handleNext} />
        </div>
      )}
      
      {step === 'signup' && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <SignUpForm />
        </div>
      )}
    </div>
  );
}
