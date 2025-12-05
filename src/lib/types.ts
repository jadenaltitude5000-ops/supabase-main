
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

// --- ADD THESE NEW INTERFACES ---

// Type for a Portfolio Item, used in the admin page
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  objectFit?: 'contain' | 'cover';
  media_url: string; // Alias for imageUrl, good to have both
  project_url: string;
  user_id: AppUser['id'];
  created_at: string;
  updated_at: string;
}

// Type for a Document, used in the admin page
export interface DocumentItem {
  id: string;
  title: string;
  file_url: string;
  user_id: AppUser['id'];
  created_at: string;
  updated_at: string;
}

// Type for an Experience entry
export interface Experience {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  description: string;
  user_id: AppUser['id'];
  created_at: string;
  updated_at: string;
}

// Type for a Certification
export interface Certification {
  id: string;
  name: string;
  issuing_body: string;
  date: string;
  credential_url: string;
  user_id: AppUser['id'];
  created_at: string;
  updated_at: string;
}

// Type for a Freelancer Profile
export interface FreelancerProfile {
  id: string;
  hourly_rate: number;
  skills: string[];
  user_id: AppUser['id'];
  created_at: string;
  updated_at: string;
}

// Type for a Business Profile
export interface BusinessProfile {
  id: string;
  company_name: string;
  industry: string;
  website: string;
  user_id: AppUser['id'];
  created_at: string;
  updated_at: string;
}

// Type for a Course
export interface Course {
  id: string;
  title: string;
  provider: string;
  description: string;
  user_id: AppUser['id'];
  created_at: string;
  updated_at: string;
}

// Type for an Instructor Application
export interface InstructorApplication {
  id: string;
  user_id: AppUser['id'];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// You can add more interfaces here as you build out your app
// export interface Profile { ... }
// export interface Notification { ... }
