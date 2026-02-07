
import { QuizContainer } from "@/components/quiz/QuizContainer";
import { Head } from "vite-react-ssg";
import { Link } from "react-router-dom";

export default function Quiz() {
  return (
    <>
      <Head>
        <title>Golf Improvement Quiz - Find Your Weaknesses | MyBirdieBoard</title>
        <meta name="description" content="Take our quick quiz to identify what's holding your golf game back and get personalized recommendations for improvement." />
        <link rel="canonical" href="https://mybirdieboard.com/quiz" />
        
        {/* Open Graph meta tags */}
        <meta property="og:title" content="Golf Improvement Quiz - Find Your Weaknesses | MyBirdieBoard" />
        <meta property="og:description" content="Take our quick quiz to identify what's holding your golf game back and get personalized recommendations for improvement." />
        <meta property="og:url" content="https://mybirdieboard.com/quiz" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://mybirdieboard.com/og-image.png" />
        <meta property="og:image:alt" content="MyBirdieBoard Golf Improvement Quiz" />
        
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Golf Improvement Quiz - Find Your Weaknesses" />
        <meta name="twitter:description" content="Discover what's holding your golf game back with our personalized assessment quiz." />
        <meta name="twitter:image" content="https://mybirdieboard.com/og-image.png" />
        <meta name="twitter:image:alt" content="Golf Improvement Quiz" />
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://mybirdieboard.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Quiz",
                "item": "https://mybirdieboard.com/quiz"
              }
            ]
          })}
        </script>
      </Head>
      
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
