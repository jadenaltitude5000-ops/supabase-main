
// This file can be used for shared TypeScript types across your app.
// It defines the shape of your database tables and other common types.

// Type for a User profile, combining Supabase Auth User with our public 'users' table
export type AppUser = {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  photo_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  follower_count: number;
  following_count: number;
  name: string;
  handle: string;
  headline: string;
  motto: string;
  avatar: string;
  businessCardBackground: string;
  businessCardStealth: boolean;
  externalUrl: string;
  externalUrlName: string;
  portfolio: PortfolioItem[];
  documents: DocumentItem[];
  experiences: Experience[];
  certifications: Certification[];
  jobTitle: string;
  company: string;
  pronouns: string;
  interests: string[];
  phoneNumber: string;
  location: string;
  category: 'freelancer' | 'business' | 'other';
  freelancerProfile: FreelancerProfile;
  businessProfile: BusinessProfile;
  isInstructor?: boolean;
  isAdmin?: boolean;
  isSentrybaseVerified?: boolean;
  subscription?: { planId: string };
  onlineStatus?: { status: 'online' | 'offline'; last_seen: string };
  experience_years?: number;
  loginHistory?: string[];
};

// Type for a Campaign, as used in ad-studio page
export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused';
  start_date: string;
  end_date: string | null;
  budget?: number;
  type: 'search' | 'social' | 'display';
  spend?: number;
  conversions?: number;
}

// Type for a Job, used in the file-uploader and other places
export interface Job {
  id: string;
  title: string;
  description: string;
  posted_by: AppUser['id'];
  created_at: string;
  updated_at: string;
}

// Type for a Portfolio Item, used in the admin page
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  objectFit?: 'contain' | 'cover';
  authorId: string;
  author: string;
  authorAvatar: string;
  authorHeadline: string;
  mediaType: 'image' | 'video' | 'app';
  images?: string[];
  videoUrl?: string;
  appUrl?: string;
  media_url?: string;
  project_url?: string;
  user_id?: AppUser['id'];
  created_at?: string | Date;
  updated_at?: string | Date;
}

// Type for a Document, used in the admin page
export interface DocumentItem {
  title: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'txt';
  uploadedAt: string | Date;
}

// Type for an Experience entry
export interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

// Type for a Certification
export interface Certification {
  name: string;
  issuingOrganization: string;
  date: string;
  credentialUrl?: string;
}

// Type for a Freelancer Profile
export interface FreelancerProfile {
  title?: string;
  skills?: string[];
  hourlyRate?: number;
  availability?: 'full-time' | 'part-time' | 'contract' | 'unavailable';
  specializedNiches?: string[];
  advancedTraits?: string[];
}

// Type for a Business Profile
export interface BusinessProfile {
  companyName?: string;
  industry?: string;
  companySize?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  hiringGoals?: string;
}

// Type for a Course
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  price: number;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  studentCount: number;
  createdAt?: string | Date;
}

// Type for an Instructor Application
export interface InstructorApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  motivation: string;
  expertise: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string | Date;
}

export type Project = {
  id: string;
  projectName: string;
  creatorId: string;
  createdAt: string;
  role: 'creator' | 'member';
};

export type ProjectMember = {
    user_id: string;
    project_id: string;
    role: string;
    name: string;
    avatar: string;
}

export type Invitation = {
    id: string;
    projectId: string;
    inviterId: string;
    inviteeId: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
};

export type ProjectMessage = {
    id: string;
    project_id: string;
    sender_id: string;
    sender_name: string;
    sender_avatar: string;
    content: string;
    created_at: string;
    image_url?: string;
    file_url?: string;
    file_name?: string;
};

export interface Post {
  id: string;
  userId: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    isAdmin?: boolean;
    isSentrybaseVerified?: boolean;
    hasActiveSubscription?: boolean;
  };
  content: string;
  image?: string;
  audioUrl?: string;
  fileUrl?: string;
  fileName?: string;
  type: 'default' | 'job_opportunity' | 'repost';
  createdAt: string | Date;
  voteCount: number;
  replyCount: number;
  repostCount: number;
  originalPost?: {
    id: string;
    authorName: string;
    authorHandle: string;
    authorAvatar: string;
    content: string;
  };
  jobDetails?: {
    title: string;
    budget: string;
    keywords: string[];
  };
  objectFit?: 'contain' | 'cover';
  isReply?: boolean;
}

export interface Vote {
    id: string;
    post_id: string;
    user_id: string;
    direction: 'up' | 'down';
}

export interface Bookmark {
    id: string;
    type: 'user' | 'post' | 'job';
    refId: string;
    savedAt: Date;
    content: {
        title: string;
        description: string;
        image: string;
    }
}

export interface Notification {
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string | Date;
    isRead: boolean;
    link?: string;
}


// Interfaces for AIWorkmateRadar
export const AIWorkmateRadarInputSchema = z.object({
  currentUserVector: z.map(z.string(), z.number()),
  allUsersWithVectors: z.array(z.object({
      profile: z.custom<User>(),
      vector: z.map(z.string(), z.number())
  })),
  teamSize: z.number().int().min(1).max(10),
  currentUserdId: z.string(),
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

export type CourseEnrollment = {
    id: string;
    courseId: string;
    userId: string;
    enrolledAt: string;
    progress: number;
};
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          bio: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
        }
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

export type Plan = {
  id: string;
  name: string;
  price: string;
  features: string[];
  isCurrent: boolean;
  bestFor?: string;
};

export type User = AppUser;

// Type for a SaaS Product
export interface SaaSProduct {
  id: string;
  name: string;
  description: string;
  authorId: string;
  authorName: string;
  price: string;
  tags: string[];
  websiteUrl: string;
  created_at?: string | Date;
}

// Type for a Contract
export interface Contract {
  id: string;
  title: string;
  owner_id: string;
  status: 'draft' | 'review' | 'signed' | 'archived';
  created_at: string | Date;
  updated_at: string | Date;
}

// Type for an ad campaign in Supabase
export type AdCampaign = {
    id: string;
    user_id: string;
    name: string;
    status: 'active' | 'paused' | 'archived';
    ad_type: 'profile' | 'product' | 'content' | 'job';
    content: string;
    targeting_keywords: string[];
    spend: number;
    conversions: number;
    created_at: string;
};
