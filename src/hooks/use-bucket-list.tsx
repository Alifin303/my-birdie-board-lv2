import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ensureCourseExists, findOrCreateCourseByApiId } from "@/integrations/supabase";
import { GolfCourse } from "@/services/golfCourseApi";

export interface BucketListCourse {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  api_course_id: string | null;
  country: string | null;
  country_code: string | null;
  added_at: string;
}

export function useBucketList() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["bucketList"],
    queryFn: async (): Promise<BucketListCourse[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from("bucket_list")
        .select(
          "course_id, added_at, courses:course_id(id, name, city, state, latitude, longitude, api_course_id, country, country_code)"
        )
        .eq("user_id", session.user.id)
        .order("added_at", { ascending: false });

      if (error) throw error;

      return (data || [])
        .filter((row: any) => row.courses)
        .map((row: any) => ({
          id: row.courses.id,
          name: row.courses.name,
          city: row.courses.city,
          state: row.courses.state,
          latitude: row.courses.latitude,
          longitude: row.courses.longitude,
          api_course_id: row.courses.api_course_id,
          country: row.courses.country,
          country_code: row.courses.country_code,
          added_at: row.added_at,
        }));
    },
  });

  const add = useMutation({
    mutationFn: async (course: GolfCourse) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You need to be logged in to use your bucket list.");

      const clubName = course.club_name || course.name || "Unknown Club";
      const courseName = course.course_name || course.name || clubName;
      const city = course.city || course.location?.city;
      const state = course.state || course.location?.state;

      let dbCourseId: number | null = null;

      if (course.isApiCourse || course.apiCourseId) {
        dbCourseId = await findOrCreateCourseByApiId(
          course.apiCourseId || String(course.id),
          courseName,
          clubName,
          city,
          state
        );
      } else {
        dbCourseId = await ensureCourseExists(course.id, undefined, courseName, clubName, city, state);
      }

      if (!dbCourseId) throw new Error("Couldn't save that course. Please try again.");

      const { error } = await supabase
        .from("bucket_list")
        .insert({ user_id: session.user.id, course_id: dbCourseId });

      // Unique violation — it's already on the list, treat as success.
      if (error && error.code !== "23505") throw error;

      return dbCourseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bucketList"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (courseId: number) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");
      const { error } = await supabase
        .from("bucket_list")
        .delete()
        .eq("user_id", session.user.id)
        .eq("course_id", courseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bucketList"] });
    },
  });

  return {
    bucketList: query.data || [],
    isLoading: query.isLoading,
    addCourse: add,
    removeCourse: remove,
  };
}
