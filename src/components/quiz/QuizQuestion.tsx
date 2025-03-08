
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: string;
  options: { id: string; text: string }[];
  selectedAnswer: string;
  onSelect: (answerId: string) => void;
}

export function QuizQuestion({ question, options, selectedAnswer, onSelect }: QuizQuestionProps) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-xl sm:text-2xl font-bold mb-6">{question}</legend>
      
      <div className="space-y-3" role="radiogroup">
        {options.map((option) => (
          <Card 
            key={option.id}
            className={cn(
              "cursor-pointer transition-all border-2",
              selectedAnswer === option.id 
                ? "border-primary bg-primary/5" 
                : "border-transparent hover:border-primary/30"
            )}
            onClick={() => onSelect(option.id)}
            role="radio"
            aria-checked={selectedAnswer === option.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelect(option.id);
                e.preventDefault();
              }
            }}
          >
            <CardContent className="p-4 flex items-start gap-3">
              <div 
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                  selectedAnswer === option.id 
                    ? "border-primary" 
                    : "border-gray-300"
                )}
                aria-hidden="true"
              >
                {selectedAnswer === option.id && (
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                )}
              </div>
              <span className="text-sm sm:text-base">{option.text}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </fieldset>
  );
}
