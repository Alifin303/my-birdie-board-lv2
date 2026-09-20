import { searchCourses } from "@/services/golfCourseApi";
import { searchCourses as searchDatabaseCourses } from "@/integrations/supabase/course/course-queries";

export interface CourseSearchResult {
  id: number | string;
  name: string;
  clubName: string;
  city: string;
  state: string;
  isUserAdded: boolean;
  isApiCourse: boolean;
  apiCourseId?: string;
}

/**
 * Combined course search used by the add-round flow and the bucket list dialog:
 * local database first, then the golf course API (de-duplicated).
 */
export async function searchAllCourses(query: string): Promise<CourseSearchResult[]> {
  if (!query.trim()) return [];

  const dbResponse = await searchDatabaseCourses(query);
  const dbResults = dbResponse.data || [];

  const dbCourses: CourseSearchResult[] = dbResults.map((course: any) => ({
    id: typeof course.id === "string" ? parseInt(course.id, 10) : course.id,
    name: course.name || "",
    clubName: course.name?.split(" - ")[0] || course.name || "",
    city: course.city || "",
    state: course.state || "",
    isUserAdded: !course.api_course_id,
    isApiCourse: !!course.api_course_id,
    apiCourseId: course.api_course_id || undefined,
  }));

  let apiCourses: CourseSearchResult[] = [];
  try {
    const apiResponse = await searchCourses(query);
    const apiResults = Array.isArray(apiResponse.results) ? apiResponse.results : [];
    const knownApiIds = new Set(
      dbResults.filter((c: any) => c.api_course_id).map((c: any) => String(c.api_course_id))
    );

    apiCourses = apiResults
      .filter((course: any) => !knownApiIds.has(String(course.id)))
      .map((course: any) => ({
        id: course.id,
        name: course.course_name || course.name || course.club_name || "",
        clubName: course.club_name || course.name || "",
        city: course.location?.city || "",
        state: course.location?.state || "",
        isUserAdded: false,
        isApiCourse: true,
        apiCourseId: course.id?.toString(),
      }));
  } catch (e) {
    console.error("Course API search failed, showing local results only", e);
  }

  return [...dbCourses, ...apiCourses];
}
