
import { QuizContainer } from "@/components/quiz/QuizContainer";

export default function Quiz() {
  return (
    <div className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url('https://www.suttongreengc.co.uk/wp-content/uploads/2023/02/membership-featured.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <header className="bg-primary shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-lg font-bold tracking-tight text-white">
            MyBirdieBoard
          </h1>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center py-8 relative">
        <div className="relative z-10 w-full">
          <div className="container mx-auto">
            <div className="bg-white/90 rounded-lg shadow-md p-6 backdrop-blur-sm">
              <QuizContainer />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
