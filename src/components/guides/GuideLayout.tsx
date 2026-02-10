
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { RelatedGuides } from "@/components/RelatedGuides";

interface GuideLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  canonicalUrl: string;
  keywords: string;
  lastModified?: string;
}

export const GuideLayout = ({ 
  children, 
  title, 
  description, 
  canonicalUrl, 
  keywords,
  lastModified = new Date().toISOString()
}: GuideLayoutProps) => {
  const { pathname } = useLocation();
  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonicalPath={new URL(canonicalUrl).pathname}
        keywords={keywords}
        ogType="article"
        lastModified={lastModified}
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybirdieboard.com/" },
              { "@type": "ListItem", "position": 2, "name": canonicalUrl.includes('/compare/') ? "Compare" : "Guides", "item": canonicalUrl.includes('/compare/') ? "https://mybirdieboard.com/guides" : "https://mybirdieboard.com/guides" },
              { "@type": "ListItem", "position": 3, "name": title.split('|')[0].trim(), "item": canonicalUrl }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "image": "https://mybirdieboard.com/og-image.png",
            "url": canonicalUrl,
            "datePublished": "2024-12-01T10:00:00Z",
            "dateModified": lastModified,
            "author": { "@type": "Organization", "name": "MyBirdieBoard" },
            "publisher": { "@type": "Organization", "name": "MyBirdieBoard", "logo": { "@type": "ImageObject", "url": "https://mybirdieboard.com/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png" } },
            "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl }
          })}
        </script>
      </SEOHead>
      
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-8">
          <div className="container mx-auto px-4">
            <BreadcrumbNav />
            <div className="mt-4">
              <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
              <p className="text-lg mt-2 text-white/90">{description}</p>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto py-12 px-4">
          <article className="max-w-4xl mx-auto prose prose-lg max-w-none">
            {children}
          </article>
          
          <div className="max-w-4xl mx-auto mt-12 text-center">
            <div className="bg-accent/10 rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Ready to Track Your Golf Scores?</h3>
              <p className="text-muted-foreground mb-6">Join thousands of golfers using MyBirdieBoard to improve their game</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Related Resources:</h4>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline">Score Tracking Guide</Link>
                    <Link to="/guides/golf-handicap-calculator" className="text-primary hover:underline">Handicap Calculator</Link>
                    <Link to="/guides/best-golf-score-tracking-apps" className="text-primary hover:underline">Best Golf Apps</Link>
                    <Link to="/blog" className="text-primary hover:underline">Golf Blog</Link>
                  </div>
                </div>
                <Link to="/">
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>

            <RelatedGuides currentPath={pathname} />
          </div>
        </main>
      </div>
    </>
  );
};
