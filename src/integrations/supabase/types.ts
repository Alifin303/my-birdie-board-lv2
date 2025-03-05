export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      course_holes: {
        Row: {
          created_at: string
          handicap: number | null
          hole_number: number
          id: string
          par: number
          tee_id: string
          updated_at: string
          yards: number | null
        }
        Insert: {
          created_at?: string
          handicap?: number | null
          hole_number: number
          id?: string
          par: number
          tee_id: string
          updated_at?: string
          yards?: number | null
        }
        Update: {
          created_at?: string
          handicap?: number | null
          hole_number?: number
          id?: string
          par?: number
          tee_id?: string
          updated_at?: string
          yards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_holes_tee_id_fkey"
            columns: ["tee_id"]
            isOneToOne: false
            referencedRelation: "course_tees"
            referencedColumns: ["id"]
          },
        ]
      }
      course_tees: {
        Row: {
          color: string | null
          course_id: number
          created_at: string
          gender: string | null
          id: string
          name: string
          par: number | null
          rating: number | null
          slope: number | null
          tee_id: string
          updated_at: string
          yards: number | null
        }
        Insert: {
          color?: string | null
          course_id: number
          created_at?: string
          gender?: string | null
          id?: string
          name: string
          par?: number | null
          rating?: number | null
          slope?: number | null
          tee_id: string
          updated_at?: string
          yards?: number | null
        }
        Update: {
          color?: string | null
          course_id?: number
          created_at?: string
          gender?: string | null
          id?: string
          name?: string
          par?: number | null
          rating?: number | null
          slope?: number | null
          tee_id?: string
          updated_at?: string
          yards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_tees_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          api_course_id: string | null
          city: string | null
          created_at: string
          id: number
          name: string
          state: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          api_course_id?: string | null
          city?: string | null
          created_at?: string
          id?: number
          name: string
          state?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          api_course_id?: string | null
          city?: string | null
          created_at?: string
          id?: number
          name?: string
          state?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customer_subscriptions: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          handicap: number | null
          id: string
          last_name: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          handicap?: number | null
          id: string
          last_name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          handicap?: number | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      rounds: {
        Row: {
          course_id: number
          created_at: string
          date: string
          gross_score: number
          hole_scores: Json | null
          id: number
          net_score: number | null
          tee_id: string | null
          tee_name: string | null
          to_par_gross: number | null
          to_par_net: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: number
          created_at?: string
          date?: string
          gross_score: number
          hole_scores?: Json | null
          id?: number
          net_score?: number | null
          tee_id?: string | null
          tee_name?: string | null
          to_par_gross?: number | null
          to_par_net?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: number
          created_at?: string
          date?: string
          gross_score?: number
          hole_scores?: Json | null
          id?: number
          net_score?: number | null
          tee_id?: string | null
          tee_name?: string | null
          to_par_gross?: number | null
          to_par_net?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
