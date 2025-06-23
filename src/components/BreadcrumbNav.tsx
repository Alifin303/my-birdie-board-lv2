
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
      'about': 'About',
      'faq': 'FAQ',
      'blog': 'Golf Blog',
      'dashboard': 'Dashboard',
      'courses': 'Golf Courses'
    };
    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  if (pathnames.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center">
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            
            return (
              <div key={name} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{getPageTitle(name)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={routeTo}>{getPageTitle(name)}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
