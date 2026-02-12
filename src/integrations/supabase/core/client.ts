
// DEPRECATED: This file is kept for backwards compatibility.
// All code should import from "@/integrations/supabase/client" directly.
// Do NOT create a separate Supabase client here to avoid duplicate GoTrueClient instances.

export { supabase, getSiteUrl, logSupabaseOperation } from '../client';
export type { DatabaseError } from '../client';
