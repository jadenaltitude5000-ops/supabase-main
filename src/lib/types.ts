
import { z } from 'zod';
import type { Database as DB } from './database.types';

export type Database = DB;
export type Json = DB['public']['Tables']['users']['Row']['certifications'];

// Re-exporting generated types with corrected casing for easier use
export type AppUser = DB['public']['Tables']['users']['Row'] & {
    freelancer_profiles?: FreelancerProfile | null;
    business_profiles?: BusinessProfile | null;
};
export type Campaign = DB['public']['Tables']['campaigns']['Row'];
export type Experience = DB['public']['Tables']['experiences']['Row'];
export type Certification = DB['public']['Tables']['certifications']['Row'];
export type FreelancerProfile = DB['public']['Tables']['freelancer_profiles']['Row'];
export type BusinessProfile = DB['public']['Tables']['business_profiles']['Row'];
export type Course = DB['public']['Tables']['courses']['Row'];
export type InstructorApplication = DB['public']['Tables']['instructor_applications']['Row'];
export type Project = DB['public']['Tables']['projects']['Row'] & { role?: 'creator' | 'member' };
export type ProjectMember = DB['public']['Tables']['project_members']['Row'] & { name: string; avatar: string | null };
export type Invitation = DB['public']['Tables']['project_invitations']['Row'];
export type ProjectMessage = DB['public']['Tables']['project_messages']['Row'];
export type Post = DB['public']['Tables']['posts']['Row'] & {
    author: {
        id: string;
        name: string;
        handle: string;
        avatar: string;
        is_admin?: boolean | null;
        is_sentrybase_verified?: boolean | null;
        hasActiveSubscription?: boolean;
    };
    object_fit?: 'contain' | 'cover';
    isReply?: boolean;
};
export type Vote = DB['public']['Tables']['votes']['Row'];
export type Bookmark = DB['public']['Tables']['bookmarks']['Row'];
export type Notification = DB['public']['Tables']['notifications']['Row'];
export type CourseEnrollment = DB['public']['Tables']['course_enrollments']['Row'];
export type Plan = {
  id: string;
  name: string;
  price: string;
  features: string[];
  isCurrent: boolean;
  bestFor?: string;
};
export type User = AppUser;
export type SaaSProduct = DB['public']['Tables']['saas_products']['Row'];
export type Contract = DB['public']['Tables']['contracts']['Row'];


export interface DocumentItem {
  title: string;
  file_url: string;
  file_type: 'pdf' | 'doc' | 'docx' | 'txt';
  uploaded_at: string | Date;
}

export type PortfolioItem = DB['public']['Tables']['portfolio']['Row'] & { object_fit?: 'contain' | 'cover' };


// Interfaces for AIWorkmateRadar
export const AIWorkmateRadarInputSchema = z.object({
  currentUserVector: z.map(z.string(), z.number()),
  allUsersWithVectors: z.array(z.object({
      profile: z.custom<User>(),
      vector: z.map(z.string(), z.number())
  })),
  teamSize: z.number().int().min(1).max(10),
  currentUserId: z.string(),
  country: z.string().optional(),
});
export type AIWorkmateRadarInput = z.infer<typeof AIWorkmateRadarInputSchema>;

export type AIWorkmateRadarOutput = {
  suggestedMembers: {
    profileId: string;
    name: string;
    headline: string;
    shortBio: string;
    skills: string[];
    matchScore: number;
    secondaryMatches?: {
        profileId: string;
        name: string;
        headline: string;
        avatar: string;
    }[];
    isFallback?: boolean;
  }[];
};
