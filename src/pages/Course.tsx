import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { supabase } from "@/integrations/supabase/client";
import { CourseScorecard } from "@/components/course/CourseScorecard";
import {
  getStaticCourse,
  courseLocation,
  courseTitle,
  courseDescription,
  courseDisplayName,
  MIN_ROUNDS_FOR_AGGREGATE,
  type StaticCourse,
} from "@/lib/course-seo";

const SITE_URL = "https://mybirdieboard.com";

interface PublicTeeWithHoles {
  par: number | null;
  course_holes: Array<{ hole_number: number; par: number }> | null;
}

function selectCompleteHolePars(tees: PublicTeeWithHoles[], expectedCount: number | null, coursePar: number | null) {
  if (!expectedCount) return null;
  const candidates = tees.flatMap((tee) => {
    const holes = [...(tee.course_holes ?? [])].sort((a, b) => a.hole_number - b.hole_number);
    const complete = holes.length === expectedCount
      && holes.every((hole, index) => hole.hole_number === index + 1 && hole.par >= 2 && hole.par <= 6);
    if (!complete) return [];
    const pars = holes.map((hole) => hole.par);
    return [{ pars, total: pars.reduce((sum, par) => sum + par, 0), teePar: tee.par }];
  });
  return (candidates.find((candidate) => candidate.total === coursePar || candidate.teePar === coursePar) ?? candidates[0])?.pars ?? null;
}

const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  // Render immediately from the build-time snapshot so the course facts
  // exist in the pre-rendered HTML (no JavaScript required).
  const initial = getStaticCourse(courseId);
  const [course, setCourse] = useState<StaticCourse | null>(initial);
  const [checked, setChecked] = useState(Boolean(initial));

  useEffect(() => {
    setCourse(getStaticCourse(courseId));
  }, [courseId]);

  // Refresh with live data on the client (covers courses added since the last build).
  useEffect(() => {
    let cancelled = false;
    const numericId = courseId ? parseInt(courseId, 10) : NaN;
    if (Number.isNaN(numericId)) {
      setChecked(true);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await (supabase as any).rpc("get_public_courses");
        if (error || cancelled || !Array.isArray(data)) return;
        const row = data.find((c: any) => c.id === numericId);
        if (!row) return;
        const inferredHoleCount = row.par ? (row.par <= 40 ? 9 : 18) : null;
        const { data: tees } = await supabase
          .from("course_tees")
          .select("par, course_holes(hole_number, par)")
          .eq("course_id", numericId);
        const holePars = Array.isArray(tees)
          ? selectCompleteHolePars(tees as PublicTeeWithHoles[], inferredHoleCount, row.par ?? null)
          : null;

        setCourse({
          id: row.id,
          name: row.name,
          city: row.city ?? null,
          state: row.state ?? null,
          latitude: row.latitude ?? null,
          longitude: row.longitude ?? null,
          par: row.par ?? null,
          holes: inferredHoleCount,
          holePars,
          teeCount: row.tee_count ?? 0,
          roundsCount: row.rounds_count ?? 0,
          averageScore: row.average_score === null || row.average_score === undefined ? null : Number(row.average_score),
        });
      } catch (e) {
        console.error("Error loading course:", e);
      } finally {
        if (!cancelled) setChecked(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-semibold">
            {checked ? "Course not found" : "Loading course information..."}
          </h1>
          {checked && (
            <p className="mt-2 text-muted-foreground">
              The requested golf course could not be found.{" "}
              <Link to="/courses" className="text-primary underline">
                Browse all courses
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    );
  }

  const location = courseLocation(course);
  const displayName = courseDisplayName(course.name);
  const canonical = `${SITE_URL}/courses/${course.id}`;
  const title = courseTitle(course.name);
  const description = courseDescription(course.name);
  const showAggregate =
    course.roundsCount >= MIN_ROUNDS_FOR_AGGREGATE && course.averageScore !== null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "GolfCourse",
    name: displayName,
    url: canonical,
    description,
    ...(location && {
      address: {
        "@type": "PostalAddress",
        addressLocality: course.city || "",
        addressRegion: course.state || "",
      },
    }),
    ...(course.latitude && course.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: course.latitude,
            longitude: course.longitude,
          },
        }
      : {}),
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Head>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link to="/courses" className="hover:text-foreground underline">
              Golf courses
            </Link>
            <span className="mx-2">/</span>
             <span>{displayName}</span>
          </nav>

           <h1 className="text-3xl sm:text-4xl font-bold mb-3">{displayName}</h1>

          {location && (
            <p className="text-lg text-muted-foreground mb-8">{location}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {course.holes && (
              <div className="bg-card rounded-lg shadow-sm p-5 text-center">
                <h2 className="text-sm font-medium text-muted-foreground mb-1">Holes</h2>
                <p className="text-2xl font-bold">{course.holes}</p>
              </div>
            )}
            {course.par && (
              <div className="bg-card rounded-lg shadow-sm p-5 text-center">
                <h2 className="text-sm font-medium text-muted-foreground mb-1">Par</h2>
                <p className="text-2xl font-bold">{course.par}</p>
              </div>
            )}
            {showAggregate && (
              <div className="bg-card rounded-lg shadow-sm p-5 text-center">
                <h2 className="text-sm font-medium text-muted-foreground mb-1">
                  Average score
                </h2>
                <p className="text-2xl font-bold">{course.averageScore}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {course.roundsCount} logged rounds
                </p>
              </div>
            )}
          </div>

           {course.holes && (
             <CourseScorecard
               key={`${course.id}-${course.holes}`}
               courseName={displayName}
               holeCount={course.holes}
               coursePar={course.par}
               holePars={course.holePars}
             />
           )}

          <section className="bg-card rounded-lg shadow-sm p-6 mb-10">
            <h2 className="text-xl font-semibold mb-2">
               Log a round at {displayName}
            </h2>
            <p className="text-muted-foreground mb-5">
              Record your score after you play, track your handicap automatically, and
              build a permanent history of every course you've played.
            </p>
            <Link
              to="/get-started"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
               Log a round at {displayName}
            </Link>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              About tracking your golf scores
            </h2>
            <p className="text-muted-foreground mb-3">
              MyBirdieBoard is a post-round golf score tracker. There's no GPS or
              rangefinder to distract you while you play — you simply log your scorecard
              afterwards and let the app handle handicap calculation, Stableford points
              and performance trends.
            </p>
            <p className="text-muted-foreground">
              Learn more in our{" "}
              <Link to="/guides/how-to-track-golf-scores" className="text-primary underline">
                guide to tracking golf scores
              </Link>{" "}
              or the{" "}
              <Link to="/tools/handicap-calculator" className="text-primary underline">
                handicap calculator
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Course;
