export interface Database {
  public: {
    Tables: {
      classes: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          description: string
          location: string
          class_date: string
          duration_minutes: number
          qa_is_open: boolean
          qa_open: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          description?: string
          location?: string
          class_date: string
          duration_minutes?: number
          qa_is_open?: boolean
          qa_open?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          description?: string
          location?: string
          class_date?: string
          duration_minutes?: number
          qa_is_open?: boolean
          qa_open?: boolean
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          class_id: string
          attendee_name: string
          checked_in_at: string
        }
        Insert: {
          id?: string
          class_id: string
          attendee_name: string
          checked_in_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          attendee_name?: string
          checked_in_at?: string
        }
      }
      slides: {
        Row: {
          id: string
          class_id: string | null
          title: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          class_id?: string | null
          title: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string | null
          title?: string
          url?: string
        }
      }
      qa_sessions: {
        Row: {
          id: string
          title: string
          is_open: boolean
          class_id: string | null
          created_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          title: string
          is_open?: boolean
          class_id?: string | null
          created_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          is_open?: boolean
          class_id?: string | null
          closed_at?: string | null
        }
      }
      questions: {
        Row: {
          id: string
          class_id: string
          question: string
          is_answered: boolean
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          question: string
          is_answered?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          question?: string
          is_answered?: boolean
        }
      }
      question_upvotes: {
        Row: {
          id: string
          question_id: string
          user_identifier: string
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          user_identifier: string
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          user_identifier?: string
        }
      }
      question_replies: {
        Row: {
          id: string
          question_id: string
          reply: string
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          reply: string
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          reply?: string
        }
      }
      professor_suggestions: {
        Row: {
          id: string
          class_id: string
          name: string
          topic: string
          votes: number
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          name: string
          topic: string
          votes?: number
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          name?: string
          topic?: string
          votes?: number
        }
      }
      professor_suggestion_votes: {
        Row: {
          id: string
          suggestion_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          suggestion_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          suggestion_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
