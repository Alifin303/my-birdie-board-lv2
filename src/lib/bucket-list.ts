import { supabase } from "@/integrations/supabase/client";

export const BUCKET_LIST_CROSSED_EVENT = "bucketlist:crossed";

export interface BucketListCrossedDetail {
  courseId: number;
  courseName: string;
}

/**
 * Remove a course from the user's bucket list once they've played it.
 * Returns the course name when something was actually crossed off.
 */
export async function crossOffBucketList(
  userId: string,
  courseId: number
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("bucket_list")
      .delete()
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .select("course_id, courses:course_id(name)");

    if (error) {
      console.warn("Failed to cross off bucket list entry", error.message);
      return null;
    }
    if (!data || data.length === 0) return null;

    const name = (data[0] as any)?.courses?.name ?? null;

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent<BucketListCrossedDetail>(BUCKET_LIST_CROSSED_EVENT, {
          detail: { courseId, courseName: name || "your course" },
        })
      );
    }

    return name;
  } catch (e) {
    console.error("crossOffBucketList failed", e);
    return null;
  }
}
