
import { FieldValue } from 'firebase/firestore';
import { z } from 'zod';
import type { Timestamp } from '@supabase/supabase-js';


export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  mediaType: 'image' | 'video' | 'app';
  images?: string[];
  videoUrl?: string;
  appUrl?: string;
  objectFit?: 'contain' | 'cover';
  // Denormalized author info
  authorId: string;
  author: string;
  authorAvatar: string;
  authorHeadline: string;
};

export type DocumentItem = {
  title: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'txt';
  uploadedAt: Timestamp | Date | FieldValue;
};

export type Experience = {
  title:string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Certification = {
  name: string;
  issuingOrganization: string;
  date: string;
  credentialUrl?: string;
};

export type FreelancerProfile = {
  title: string;
  skills: string[];
  hourlyRate?: number;
  availability?: 'full-time' | 'part-time' | 'contract' | 'unavailable';
  specializedNiches?: string[];
  advancedTraits?: string[];
};

export type BusinessProfile = {
  companyName?: string;
  companySize?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  hiringGoals?: string;
  industry?: string;
}

export type User = {
  id: string;
  uid: string; // From Firebase Auth
  name: string;
  handle: string;
  email: string;
  headline: string;
  bio: string;
  motto?: string;
  avatar: string;
  coverImage?: string;
  skills: string[];
  portfolio: PortfolioItem[];
  documents?: DocumentItem[];
  experiences?: Experience[];
  certifications?: Certification[];
  freelancerProfile?: FreelancerProfile;
  businessProfile?: BusinessProfile;
  category:
    | 'design'
    | 'writing'
    | 'development'
    | 'marketing'
    | 'business'
    | 'other';
  jobTitle?: string;
  company?: string;
  verified?: boolean;
  isSentrybaseVerified?: boolean;
  reliabilityScore: number;
  communityStanding: string;
  disputes: number;
  communityFlags?: {
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  currentMeetingId?: string | null;
  isHandRaised?: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
  vectors?: Record<string, number>;
  following?: string[];
  followers?: string[];
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  createdAt: Timestamp | Date | FieldValue;
  experience_years?: number;
  location?: string;
  photoURL?: string;
  displayName?: string;
  pronouns?: string;
  interests?: string[];
  education?: string;
  phoneNumber?: string;
  subscription?: {
    planId: string;
  };
  onlineStatus?: {
    status: 'online' | 'offline';
    lastSeen: Timestamp | FieldValue;
  };
  isAdmin?: boolean;
  isInstructor?: boolean;
  loginHistory?: (Timestamp | Date | FieldValue)[];
  courses?: string[];
  isBot?: boolean;
  fcmTokens?: string[];
  businessCardBackground?: string;
  externalUrl?: string;
  externalUrlName?: string;
  businessCardStealth?: boolean;
  referredBy?: string | null;
};

export type Post = {
  id: string;
  userId: string;
  type: 'default' | 'job_opportunity' | 'repost';
  author: {
    // Denormalized data for quick client-side rendering
    id: string;
    name: string;
    handle: string;
    avatar: string;
    isAdmin?: boolean;
    isSentrybaseVerified?: boolean;
    hasActiveSubscription?: boolean;
  };
  created_at: Timestamp | FieldValue;
  createdAt: Timestamp | FieldValue;
  content: string;
  image?: string;
  objectFit?: 'contain' | 'cover';
  videoUrl?: string;
  audioUrl?: string;
  fileUrl?: string;
  fileName?: string;
  voteCount?: number;
  replyCount?: number;
  repostCount?: number;
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
  isReply?: boolean;
  parent_post_id?: string;
};

export type Vote = {
    id: string;
    userId: string;
    postId: string;
    direction: 'up' | 'down';
};

export type Task = {
  id: string;
  description: string;
  assigneeId?: string;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: Timestamp;
};

export type Meeting = {
  id: string;
  title: string;
  description: string;
  hostId: string;
  participantIds: string[];
  status: 'lobby' | 'active' | 'ended';
  joinCode: string;
  createdAt: Timestamp | FieldValue;
  settings: {
    lockMeeting: boolean;
    allowScreenShare: boolean;
  };
};

export type AgendaItem = {
    id: string;
    title: string;
    durationMinutes: number;
    presenterId: string;
    isCompleted: boolean;
};

export type MinuteItem = {
    id: string;
    authorId: string;
    content: string;
    linkedAgendaItemId: string;
    timestamp: Timestamp;
};

export type Invoice = {
  id: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
};

export type PaymentMethod = {
  id: string;
  type: 'visa' | 'mastercard' | 'paypal';
  details: string;
  expiry?: string;
  isDefault: boolean;
};

export type Plan = {
  id: string;
  name: string;
  price: string;
  features: string[];
  isCurrent: boolean;
  bestFor?: string;
};

export type Referral = {
  id: string;
  name: string;
  date: string;
  status: 'Subscribed' | 'Joined' | 'Pending';
  reward: string;
};

export type Campaign = {
    id: string;
    name: string;
    status: 'Active' | 'Paused' | 'Finished';
    type: string;
    spend: string;
    conversions: number;
    createdAt: Timestamp;
};

// Workmate Radar Schemas
const UserProfileSchemaForRadar = z.custom<User>();

const UserProfileWithVectorSchema = z.object({
  profile: UserProfileSchemaForRadar,
  vector: z.map(z.string(), z.number()),
});

export const AIWorkmateRadarInputSchema = z.object({
  currentUserVector: z.map(z.string(), z.number()),
  allUsersWithVectors: z.array(UserProfileWithVectorSchema),
  teamSize: z.number().int().min(1),
  currentUserdId: z.string(),
  country: z.string().optional(),
});
export type AIWorkmateRadarInput = z.infer<typeof AIWorkmateRadarInputSchema>;

export const AIWorkmateRadarOutputSchema = z.object({
  suggestedMembers: z.array(
    z.object({
      profileId: z.string(),
      name: z.string(),
      headline: z.string(),
      shortBio: z.string(),
      skills: z.array(z.string()),
      matchScore: z.number(),
      secondaryMatches: z.array(z.object({
          profileId: z.string(),
          name: z.string(),
          headline: z.string(),
          avatar: z.string(),
      })).optional(),
      isFallback: z.boolean().optional(),
    })
  ),
});
export type AIWorkmateRadarOutput = z.infer<typeof AIWorkmateRadarOutputSchema>;

export type Bookmark = {
    id: string;
    type: 'user' | 'post' | 'job';
    ref_id: string;
    saved_at: Timestamp | FieldValue;
    content: {
        title: string;
        description: string;
        image: string;
    };
};

export type Notification = {
    id: string;
    user_id: string;
    type: 'system' | 'connection' | 'job_application' | 'project_invite';
    title: string;
    description: string;
    created_at: Timestamp | FieldValue;
    is_read: boolean;
    link?: string;
    metadata?: Record<string, any>;
};


export type Contract = {
  id: string;
  title: string;
  ownerId: string;
  status: 'draft' | 'review' | 'signed' | 'archived';
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
};

export type ContractParty = {
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer' | 'signer';
  userId?: string; // Sentrybase user ID, if applicable
  signatureStatus: 'pending' | 'signed';
  signedAt?: Timestamp | FieldValue;
};


export type InstructorApplication = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  motivation: string;
  expertise: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp | FieldValue;
};

export type Course = {
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
  created_at: Timestamp | Date | FieldValue;
};

export type CourseModule = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessonCount?: number;
};

export type CourseLesson = {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  type: 'video' | 'text';
  videoUrl?: string;
  textContent?: string;
  duration?: number; // In minutes
  order: number;
};

export type CourseEnrollment = {
  id: string; // Document ID is the Course ID for simplicity
  courseId: string;
  enrolledAt: Timestamp | FieldValue;
  progress: number; // Percentage complete
  completedLessons: string[];
};

export type CourseReview = {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp | FieldValue;
};

export type MonthlyProfileEngagementData = {
    id: string;
    createdAt: Timestamp | FieldValue;
    views: number;
    connections: number;
    searches: number;
    likes: number;
    skillSyncNetMatches: number;
}

export type Project = {
  id: string;
  projectName: string;
  creatorId: string;
  createdAt: Timestamp | FieldValue;
  isActive: boolean;
  role?: 'creator' | 'member'; // Added for denormalization
};

export type ProjectMember = {
  userId: string;
  role: 'creator' | 'member';
  joinedAt: Timestamp | FieldValue;
  name: string;
  avatar: string;
};

export type Invitation = {
  id: string;
  projectId: string;
  projectName: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  sentAt: Timestamp | FieldValue;
  respondedAt?: Timestamp | FieldValue;
};

export type ProjectMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  imageUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  createdAt: Timestamp | FieldValue;
};

// Agent Types
export interface AgenticHelperOutput {
  response: string;
}

export type AgentPersonality = 'professional' | 'comedian' | 'critic';

export type SaaSProduct = {
  id: string;
  name: string;
  description: string;
  authorId: string;
  authorName: string;
  price: string;
  tags: string[];
  websiteUrl: string;
  created_at: Timestamp;
};

    
