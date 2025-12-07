
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
      bookmarks: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          ref_id: string
          saved_at: string
          type: string
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          ref_id: string
          saved_at?: string
          type: string
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          ref_id?: string
          saved_at?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          company_name: string | null
          company_size: string | null
          hiring_goals: string | null
          id: string
          industry: string | null
        }
        Insert: {
          company_name?: string | null
          company_size?: string | null
          hiring_goals?: string | null
          id: string
          industry?: string | null
        }
        Update: {
          company_name?: string | null
          company_size?: string | null
          hiring_goals?: string | null
          id?: string
          industry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ad_type: string
          budget: number | null
          conversions: number | null
          created_at: string
          id: string
          name: string
          spend: number | null
          status: string | null
          targeting_keywords: string[] | null
          user_id: string
        }
        Insert: {
          ad_type: string
          budget?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          name: string
          spend?: number | null
          status?: string | null
          targeting_keywords?: string[] | null
          user_id: string
        }
        Update: {
          ad_type?: string
          budget?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          name?: string
          spend?: number | null
          status?: string | null
          targeting_keywords?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          credential_url: string | null
          date: string
          id: string
          issuing_organization: string
          name: string
          user_id: string
        }
        Insert: {
          credential_url?: string | null
          date: string
          id?: string
          issuing_organization: string
          name: string
          user_id: string
        }
        Update: {
          credential_url?: string | null
          date?: string
          id?: string
          issuing_organization?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      colleagues: {
        Row: {
          added_at: string
          colleague_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          colleague_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          colleague_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "colleagues_colleague_id_fkey"
            columns: ["colleague_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colleagues_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_parties: {
        Row: {
          contract_id: string
          email: string
          id: string
          name: string
          role: string
          signature_status: string
          signed_at: string | null
          user_id: string | null
        }
        Insert: {
          contract_id: string
          email: string
          id?: string
          name: string
          role?: string
          signature_status?: string
          signed_at?: string | null
          user_id?: string | null
        }
        Update: {
          contract_id?: string
          email?: string
          id?: string
          name?: string
          role?: string
          signature_status?: string
          signed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_parties_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_parties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_versions: {
        Row: {
          author_id: string
          content: string | null
          contract_id: string
          created_at: string
          id: string
          notes: string | null
          version_number: number
        }
        Insert: {
          author_id: string
          content?: string | null
          contract_id: string
          created_at?: string
          id?: string
          notes?: string | null
          version_number: number
        }
        Update: {
          author_id?: string
          content?: string | null
          contract_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_versions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_versions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_lessons: string[] | null
          course_id: string
          enrolled_at: string
          progress: number | null
          user_id: string
        }
        Insert: {
          completed_lessons?: string[] | null
          course_id: string
          enrolled_at?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          completed_lessons?: string[] | null
          course_id?: string
          enrolled_at?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          content_type: string | null
          course_id: string
          duration: number | null
          id: string
          module_id: string
          order: number
          text_content: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          content_type?: string | null
          course_id: string
          duration?: number | null
          id?: string
          module_id: string
          order: number
          text_content?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          content_type?: string | null
          course_id?: string
          duration?: number | null
          id?: string
          module_id?: string
          order?: number
          text_content?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          id: string
          order: number
          title: string
        }
        Insert: {
          course_id: string
          id?: string
          order: number
          title: string
        }
        Update: {
          course_id?: string
          id?: string
          order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          instructor_avatar: string | null
          instructor_id: string
          instructor_name: string | null
          level: string | null
          price: number
          rating: number | null
          student_count: number | null
          tags: string[] | null
          thumbnail_url: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          instructor_avatar?: string | null
          instructor_id: string
          instructor_name?: string | null
          level?: string | null
          price: number
          rating?: number | null
          student_count?: number | null
          tags?: string[] | null
          thumbnail_url: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          instructor_avatar?: string | null
          instructor_id?: string
          instructor_name?: string | null
          level?: string | null
          price?: number
          rating?: number | null
          student_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          company: string
          description: string | null
          end_date: string | null
          id: string
          start_date: string
          title: string
          user_id: string
        }
        Insert: {
          company: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date: string
          title: string
          user_id: string
        }
        Update: {
          company?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_profiles: {
        Row: {
          advanced_traits: string[] | null
          availability: string | null
          hourly_rate: number | null
          id: string
          skills: string[] | null
          specialized_niches: string[] | null
          title: string | null
        }
        Insert: {
          advanced_traits?: string[] | null
          availability?: string | null
          hourly_rate?: number | null
          id: string
          skills?: string[] | null
          specialized_niches?: string[] | null
          title?: string | null
        }
        Update: {
          advanced_traits?: string[] | null
          availability?: string | null
          hourly_rate?: number | null
          id?: string
          skills?: string[] | null
          specialized_niches?: string[] | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_applications: {
        Row: {
          expertise: string
          id: string
          motivation: string
          status: string
          submitted_at: string
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          expertise: string
          id?: string
          motivation: string
          status?: string
          submitted_at?: string
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          expertise?: string
          id?: string
          motivation?: string
          status?: string
          submitted_at?: string
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          id: string
          is_read: boolean
          link: string | null
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_read?: boolean
          link?: string | null
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_read?: boolean
          link?: string | null
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio: {
        Row: {
          app_url: string | null
          author: string
          author_avatar: string
          author_headline: string
          author_id: string
          created_at: string | null
          description: string
          id: string
          image_url: string
          images: string[] | null
          media_type: string
          object_fit: string | null
          tags: string[]
          title: string
          updated_at: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          app_url?: string | null
          author: string
          author_avatar: string
          author_headline: string
          author_id: string
          created_at?: string | null
          description: string
          id?: string
          image_url: string
          images?: string[] | null
          media_type?: string
          object_fit?: string | null
          tags: string[]
          title: string
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          app_url?: string | null
          author?: string
          author_avatar?: string
          author_headline?: string
          author_id?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          images?: string[] | null
          media_type?: string
          object_fit?: string | null
          tags?: string[]
          title?: string
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          audio_url: string | null
          author: Json | null
          content: string
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          image: string | null
          job_details: Json | null
          original_post: Json | null
          repost_count: number | null
          reply_count: number | null
          type: string
          user_id: string
          vote_count: number | null
        }
        Insert: {
          audio_url?: string | null
          author?: Json | null
          content: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          image?: string | null
          job_details?: Json | null
          original_post?: Json | null
          repost_count?: number | null
          reply_count?: number | null
          type?: string
          user_id: string
          vote_count?: number | null
        }
        Update: {
          audio_url?: string | null
          author?: Json | null
          content?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          image?: string | null
          job_details?: Json | null
          original_post?: Json | null
          repost_count?: number | null
          reply_count?: number | null
          type?: string
          user_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invitations: {
        Row: {
          created_at: string
          id: string
          invitee_id: string
          inviter_id: string
          project_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_id: string
          inviter_id: string
          project_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_invitations_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          joined_at: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          joined_at?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_messages: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          image_url: string | null
          project_id: string
          sender_avatar: string | null
          sender_id: string
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          project_id: string
          sender_avatar?: string | null
          sender_id: string
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          project_id?: string
          sender_avatar?: string | null
          sender_id?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          is_active: boolean
          project_name: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          is_active?: boolean
          project_name: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          is_active?: boolean
          project_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_products: {
        Row: {
          author_id: string
          author_name: string
          created_at: string | null
          description: string
          id: string
          name: string
          price: string
          tags: string[]
          website_url: string
        }
        Insert: {
          author_id: string
          author_name: string
          created_at?: string | null
          description: string
          id?: string
          name: string
          price: string
          tags: string[]
          website_url: string
        }
        Update: {
          author_id?: string
          author_name?: string
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          price?: string
          tags?: string[]
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_products_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_inquiries: {
        Row: {
          business_email: string
          business_name: string
          company_size: string | null
          created_at: string
          id: string
          industry: string | null
          message: string
          phone_number: string | null
          type: string | null
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          business_email: string
          business_name: string
          company_size?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          message: string
          phone_number?: string | null
          type?: string | null
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          business_email?: string
          business_name?: string
          company_size?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          message?: string
          phone_number?: string | null
          type?: string | null
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_contracts: {
        Row: {
          contract_id: string
          role: string
          user_id: string
        }
        Insert: {
          contract_id: string
          role: string
          user_id: string
        }
        Update: {
          contract_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_contracts_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_contracts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          project_id: string
          role: string
          user_id: string
        }
        Update: {
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          bio: string | null
          business_card_background: string | null
          business_card_stealth: boolean | null
          category: string | null
          certifications: Json | null
          company: string | null
          created_at: string
          documents: Json | null
          email: string
          experience_years: number | null
          experiences: Json | null
          external_url: string | null
          external_url_name: string | null
          handle: string
          headline: string | null
          id: string
          interests: string[] | null
          is_admin: boolean | null
          is_instructor: boolean | null
          is_sentrybase_verified: boolean | null
          job_title: string | null
          last_seen: string | null
          location: string | null
          login_history: Json | null
          motto: string | null
          name: string
          online_status: string | null
          phone_number: string | null
          portfolio: Json | null
          pronouns: string | null
          reliability_score: number | null
          skills: string[] | null
          subscription: Json | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          business_card_background?: string | null
          business_card_stealth?: boolean | null
          category?: string | null
          certifications?: Json | null
          company?: string | null
          created_at?: string
          documents?: Json | null
          email: string
          experience_years?: number | null
          experiences?: Json | null
          external_url?: string | null
          external_url_name?: string | null
          handle: string
          headline?: string | null
          id: string
          interests?: string[] | null
          is_admin?: boolean | null
          is_instructor?: boolean | null
          is_sentrybase_verified?: boolean | null
          job_title?: string | null
          last_seen?: string | null
          location?: string | null
          login_history?: Json | null
          motto?: string | null
          name: string
          online_status?: string | null
          phone_number?: string | null
          portfolio?: Json | null
          pronouns?: string | null
          reliability_score?: number | null
          skills?: string[] | null
          subscription?: Json | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          business_card_background?: string | null
          business_card_stealth?: boolean | null
          category?: string | null
          certifications?: Json | null
          company?: string | null
          created_at?: string
          documents?: Json | null
          email?: string
          experience_years?: number | null
          experiences?: Json | null
          external_url?: string | null
          external_url_name?: string | null
          handle?: string
          headline?: string | null
          id?: string
          interests?: string[] | null
          is_admin?: boolean | null
          is_instructor?: boolean | null
          is_sentrybase_verified?: boolean | null
          job_title?: string | null
          last_seen?: string | null
          location?: string | null
          login_history?: Json | null
          motto?: string | null
          name?: string
          online_status?: string | null
          phone_number?: string | null
          portfolio?: Json | null
          pronouns?: string | null
          reliability_score?: number | null
          skills?: string[] | null
          subscription?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          direction: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          direction: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
