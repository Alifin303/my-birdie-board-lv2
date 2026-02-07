import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

export const BreadcrumbNav = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Map breadcrumb segments to actual routes when they differ
  const getRouteOverride = (segments: string[]): string | null => {
    const path = '/' + segments.join('/');
    const overrides: { [key: string]: string } = {
      '/guides': '/blog',
    };
    return overrides[path] || null;
  };

  const getPageTitle = (path: string) => {
    const titles: { [key: string]: string } = {
      'guides': 'Golf Guides',
      'how-to-track-golf-scores': 'How to Track Golf Scores',
      'golf-handicap-calculator': 'Golf Handicap Calculator',
      'best-golf-score-tracking-apps': 'Best Golf Score Apps',
      'golf-performance-analytics': 'Golf Performance Analytics',
      'golf-statistics-tracker': 'Golf Statistics Tracker',
      'golf-equipment': 'Golf Equipment',
      'golf-tips': 'Golf Tips',
      'golf-lessons': 'Golf Lessons',
      'about': 'About MyBirdieBoard',
      'faq': 'Frequently Asked Questions',
      'blog': 'Golf Blog & Articles',
      'dashboard': 'Golf Dashboard',
      'courses': 'Golf Courses Directory',
      
      // Enhanced SEO-focused titles for better internal linking
      'privacy': 'Privacy Policy',
      'checkout': 'Premium Subscription',
      'admin': 'Admin Dashboard',
      'putts-per-round': 'How Many Putts Per Round is Good?',
      'how-to-calculate-golf-handicap': 'How to Calculate Golf Handicap',
      'golf-stats-to-track': 'Golf Stats You Should Track',
      'playing-without-phone': 'Playing Golf Without Your Phone',
      'golf-score-tracking-tips': 'Golf Score Tracking Tips',
      
      // Future-proofing for common golf terms
      'handicap': 'Golf Handicap Information',
      'scorecard': 'Golf Scorecard',
      'leaderboard': 'Golf Leaderboard',
      'performance': 'Golf Performance Tracking',
      'analytics': 'Golf Analytics',
      'statistics': 'Golf Statistics',
      'training': 'Golf Training',
      'practice': 'Golf Practice',
      'improvement': 'Golf Improvement',
      'beginner': 'Beginner Golf Guide',
      'advanced': 'Advanced Golf Techniques',
      'professional': 'Professional Golf',
      'tournaments': 'Golf Tournaments',
      'rules': 'Golf Rules & Regulations'
    };
    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  };

  const getBreadcrumbSchema = () => {
    if (pathnames.length === 0) return null;
    
    const breadcrumbList = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://mybirdieboard.com/"
      }
    ];

    pathnames.forEach((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      breadcrumbList.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": getPageTitle(name),
        "item": `https://mybirdieboard.com${routeTo}`
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbList
    };
  };

  if (pathnames.length === 0) return null;

  const breadcrumbSchema = getBreadcrumbSchema();

  return (
    <>
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      <div className="container mx-auto px-4 py-3 border-b border-white/10">
        <Breadcrumb>
          <BreadcrumbList className="text-white/90">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link 
                  to="/" 
                  className="flex items-center hover:text-white transition-colors duration-200 text-sm font-medium"
                  title="MyBirdieBoard - Golf Score Tracking Home"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {pathnames.map((name, index) => {
              const segments = pathnames.slice(0, index + 1);
              const routeTo = getRouteOverride(segments) || `/${segments.join('/')}`;
              const isLast = index === pathnames.length - 1;
              const pageTitle = getPageTitle(name);
              
              return (
                <div key={name} className="flex items-center">
                  <BreadcrumbSeparator className="text-white/60" />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-white font-medium text-sm">
                        {pageTitle}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link 
                          to={routeTo}
                          className="hover:text-white transition-colors duration-200 text-sm font-medium"
                          title={`${pageTitle} - MyBirdieBoard Golf`}
                        >
                          {pageTitle}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </>
  );
};
