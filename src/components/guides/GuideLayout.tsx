
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

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
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="keywords" content={keywords} />
        <meta name="lastmod" content={lastModified} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "url": canonicalUrl,
            "dateModified": lastModified,
            "author": {
              "@type": "Organization",
              "name": "MyBirdieBoard"
            },
            "publisher": {
              "@type": "Organization",
              "name": "MyBirdieBoard",
              "logo": {
                "@type": "ImageObject",
                "url": "https://mybirdieboard.com/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
              }
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-8">
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
            <p className="text-lg mt-2 text-white/90">{description}</p>
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
              <Link to="/">
                <Button size="lg" className="bg-accent hover:bg-accent/90">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
