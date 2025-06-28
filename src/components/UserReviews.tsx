
import React from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "@/components/ui/carousel";

interface Review {
  rating: number;
  author: string;
  text: string;
  datePublished?: string;
}

export const UserReviews = () => {
  const reviews: Review[] = [
    {
      rating: 5,
      author: "James R.",
      text: "I used to keep all my scores in a notebook, but MyBirdieBoard makes it so much easier! Tracking my stats has helped me drop my handicap by 3 strokes in just a few months.",
      datePublished: "2024-01-15"
    },
    {
      rating: 5,
      author: "Sarah L.",
      text: "The Course Leaderboards are a game-changer! Even when my friends and I play on different days, we can still have some friendly competition. I love MyBirdieBoard!",
      datePublished: "2024-02-03"
    },
    {
      rating: 5,
      author: "Tom B.",
      text: "I never really understood my strengths and weaknesses until I started using MyBirdieBoard. Now, I can see exactly where I need to improve, and my scores are finally coming down!",
      datePublished: "2024-02-18"
    },
    {
      rating: 5,
      author: "Mark T.",
      text: "Having a proper handicap without needing a club membership is awesome. MyBirdieBoard makes it super simple, and now I know exactly where I stand.",
      datePublished: "2024-03-05"
    },
    {
      rating: 5,
      author: "Rachel D.",
      text: "I signed up for the 7-day free trial and was hooked immediately. Seeing my progress in real-time keeps me motivated to play better golf!",
      datePublished: "2024-03-22"
    },
    {
      rating: 5,
      author: "Chris M.",
      text: "Every golfer should be using this. The insights and stats are so helpful, and it's way better than trying to remember my scores or losing paper scorecards!",
      datePublished: "2024-04-10"
    },
  ];

  // Enhanced structured data for reviews with proper schema
  const generateReviewStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "MyBirdieBoard",
      "description": "The best golf score tracking app for beginners and experienced golfers. Track scores, calculate handicap, and analyze performance.",
      "brand": {
        "@type": "Brand",
        "name": "MyBirdieBoard"
      },
      "category": "Golf Score Tracking App",
      "url": "https://mybirdieboard.com",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": reviews.length.toString(),
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": reviews.map(review => ({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating.toString(),
          "bestRating": "5",
          "worstRating": "1"
        },
        "author": {
          "@type": "Person",
          "name": review.author
        },
        "reviewBody": review.text,
        "datePublished": review.datePublished,
        "publisher": {
          "@type": "Organization",
          "name": "MyBirdieBoard"
        }
      })),
      "offers": {
        "@type": "Offer",
        "price": "2.99",
        "priceCurrency": "GBP",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31"
      }
    };
  };

  return (
    <div className="py-12 bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-2">What Our Users Say</h2>
        <p className="text-center text-muted-foreground mb-8">
          See why golfers choose MyBirdieBoard as their preferred golf score tracking app
        </p>
        
        <div className="relative">
          <Carousel className="w-full overflow-hidden">
            <CarouselContent className="-ml-4">
              {reviews.map((review, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div 
                    className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col border border-secondary/30"
                    itemScope
                    itemType="https://schema.org/Review"
                  >
                    <div className="flex items-center mb-4" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                      <meta itemProp="ratingValue" content={review.rating.toString()} />
                      <meta itemProp="bestRating" content="5" />
                      <meta itemProp="worstRating" content="1" />
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    
                    <blockquote className="italic text-gray-700 mb-4 flex-grow" itemProp="reviewBody">
                      "{review.text}"
                    </blockquote>
                    
                    <footer className="text-right font-medium text-primary">
                      <span itemProp="author" itemScope itemType="https://schema.org/Person">
                        <span itemProp="name">{review.author}</span>
                      </span>
                      {review.datePublished && (
                        <meta itemProp="datePublished" content={review.datePublished} />
                      )}
                    </footer>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious 
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-0 bg-white/80 border-primary hover:bg-primary hover:text-white" 
              variant="outline" 
            />
            <CarouselNext 
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-0 bg-white/80 border-primary hover:bg-primary hover:text-white" 
              variant="outline" 
            />
          </Carousel>
        </div>
      </div>
      
      {/* Enhanced JSON-LD structured data for reviews */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateReviewStructuredData())
        }}
      />
    </div>
  );
};
