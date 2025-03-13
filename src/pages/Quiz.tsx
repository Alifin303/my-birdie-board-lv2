
import { QuizContainer } from "@/components/quiz/QuizContainer";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function Quiz() {
  return (
    <>
      <Helmet>
        <title>Golf Improvement Quiz - Find Your Weaknesses | MyBirdieBoard</title>
        <meta name="description" content="Take our quick quiz to identify what's holding your golf game back and get personalized recommendations for improvement." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col"
        style={{
          backgroundImage: `url('https://www.suttongreengc.co.uk/wp-content/uploads/2023/02/membership-featured.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
        role="main"
      >
        <header className="bg-primary shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link to="/" aria-label="Return to homepage">
              <h1 className="text-lg font-bold tracking-tight text-white">
                MyBirdieBoard
              </h1>
            </Link>
          </div>
        </header>
        
        <main className="flex-grow flex items-center justify-center py-8 relative">
          <div className="relative z-10 w-full">
            <div className="container mx-auto">
              <QuizContainer />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
