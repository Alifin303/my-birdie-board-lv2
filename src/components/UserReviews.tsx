
import React from "react";
import { Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface Review {
  rating: number;
  author: string;
  text: string;
}

export const UserReviews = () => {
  const reviews: Review[] = [
    {
      rating: 5,
      author: "James R.",
      text: "I used to keep all my scores in a notebook, but MyBirdieBoard makes it so much easier! Tracking my stats has helped me drop my handicap by 3 strokes in just a few months."
    },
    {
      rating: 5,
      author: "Sarah L.",
      text: "The Course Leaderboards are a game-changer! Even when my friends and I play on different days, we can still have some friendly competition. I love MyBirdieBoard!"
    },
    {
      rating: 5,
      author: "Tom B.",
      text: "I never really understood my strengths and weaknesses until I started using MyBirdieBoard. Now, I can see exactly where I need to improve, and my scores are finally coming down!"
    },
    {
      rating: 5,
      author: "Mark T.",
      text: "Having a proper handicap without needing a club membership is awesome. MyBirdieBoard makes it super simple, and now I know exactly where I stand."
    },
    {
      rating: 5,
      author: "Rachel D.",
      text: "I signed up for the 7-day free trial and was hooked immediately. Seeing my progress in real-time keeps me motivated to play better golf!"
    },
    {
      rating: 5,
      author: "Chris M.",
      text: "Every golfer should be using this. The insights and stats are so helpful, and it's way better than trying to remember my scores or losing paper scorecards!"
    },
  ];

  return (
    <div className="py-12 bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-8">What Our Users Say</h2>
        
        <Carousel className="w-full overflow-hidden">
          <CarouselContent className="-ml-4">
            {reviews.map((review, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col border border-secondary/30">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="italic text-gray-700 mb-4 flex-grow">
                    "{review.text}"
                  </blockquote>
                  
                  <footer className="text-right font-medium text-primary">
                    {review.author}
                  </footer>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};
