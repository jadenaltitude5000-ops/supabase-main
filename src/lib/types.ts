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

// Type for a Campaign, as used in the ad-studio page
export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused';
  start_date: string;
  end_date: string | null;
  budget?: number;
  type: 'search' | 'social' | 'display'; // Added the missing 'type' property
  spend?: number;
  conversions?: number;
  /
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

// You can add more interfaces here as you build out your app
// export interface Profile { ... }
// export interface Notification { ... }
