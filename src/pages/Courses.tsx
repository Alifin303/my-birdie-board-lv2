import { Link, Navigate, useParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import {
  courseDisplayName,
  staticCourses,
  COURSES_PER_PAGE,
  COURSES_TOTAL_PAGES,
  coursesPagePath,
} from "@/lib/course-seo";

const SITE = "https://mybirdieboard.com";

const Courses = () => {
  // Every page is pre-rendered from the build-time snapshot, so each page's
  // course links are in the initial HTML with no scrolling or JS required.
  const { page: pageParam } = useParams();
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  if (pageParam && (Number.isNaN(page) || page < 2 || page > COURSES_TOTAL_PAGES)) {
    return <Navigate to="/courses" replace />;
  }

  const start = (page - 1) * COURSES_PER_PAGE;
  const courses = staticCourses.slice(start, start + COURSES_PER_PAGE);
  const path = coursesPagePath(page);
  const suffix = page > 1 ? ` – Page ${page} of ${COURSES_TOTAL_PAGES}` : "";

  return (
    <>
      <SEOHead
        title={`Golf Courses Directory${suffix} | MyBirdieBoard`}
        description={
          page > 1
            ? `Browse golf courses (page ${page} of ${COURSES_TOTAL_PAGES}). View course details and scorecards, and track your rounds with MyBirdieBoard.`
            : "Browse golf courses by location, view course details, and try an interactive scorecard with MyBirdieBoard."
        }
        canonicalPath={path}
      >
        {page > 1 && <link rel="prev" href={`${SITE}${coursesPagePath(page - 1)}`} />}
        {page < COURSES_TOTAL_PAGES && <link rel="next" href={`${SITE}${coursesPagePath(page + 1)}`} />}
      </SEOHead>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6">
            Golf Courses{page > 1 ? ` – Page ${page}` : ""}
          </h1>

          <p className="text-center mb-3 text-muted-foreground max-w-2xl mx-auto">
            Browse golf courses where players have tracked rounds on MyBirdieBoard. Select a course to view its details and scorecard.
          </p>
          <p className="text-center mb-8 text-muted-foreground max-w-2xl mx-auto">
            Don&apos;t see your course?{" "}
            <Link to="/get-started" className="font-medium text-primary underline underline-offset-4">
              Add it in seconds when you log your first round
            </Link>
            .
          </p>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg">No courses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <Link to={`/courses/${course.id}`} className="block p-6">
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2">{courseDisplayName(course.name)}</h2>
                    {(course.city || course.state) && (
                      <p className="text-muted-foreground">
                        {[course.city, course.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          )}

          {COURSES_TOTAL_PAGES > 1 && (
            <nav aria-label="Course directory pages" className="mt-10 flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                {page > 1 ? (
                  <Link to={coursesPagePath(page - 1)} rel="prev" className="rounded-md border border-border px-4 py-2 font-medium hover:bg-muted">
                    ← Previous page
                  </Link>
                ) : <span className="px-4 py-2 text-muted-foreground">← Previous page</span>}
                <span className="text-muted-foreground">Page {page} of {COURSES_TOTAL_PAGES}</span>
                {page < COURSES_TOTAL_PAGES ? (
                  <Link to={coursesPagePath(page + 1)} rel="next" className="rounded-md border border-border px-4 py-2 font-medium hover:bg-muted">
                    Next page →
                  </Link>
                ) : <span className="px-4 py-2 text-muted-foreground">Next page →</span>}
              </div>
              <ul className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: COURSES_TOTAL_PAGES }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    <Link
                      to={coursesPagePath(n)}
                      aria-current={n === page ? "page" : undefined}
                      className={`inline-block min-w-9 rounded-md px-3 py-1 text-center text-sm ${n === page ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}
                    >
                      {n}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </>
  );
};

export default Courses;
