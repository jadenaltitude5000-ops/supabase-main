-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.followers CASCADE;
DROP TABLE IF EXISTS public.project_members CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL PRIMARY KEY,
    full_name text,
    email text UNIQUE,
    handle text UNIQUE,
    headline text,
    bio text,
    avatar text,
    job_title text,
    company text,
    skills text[],
    is_sentrybase_verified boolean DEFAULT false,
    experience_years integer,
    location text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    login_history jsonb,
    subscription jsonb,
    last_seen timestamp with time zone,
    online_status text
);

-- Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    vote_count integer DEFAULT 0,
    reply_count integer DEFAULT 0,
    repost_count integer DEFAULT 0,
    image text,
    author jsonb,
    job_details jsonb,
    original_post jsonb,
    type text default 'default'::text,
    audio_url text,
    file_name text,
    file_url text
);

-- Create Votes Table
CREATE TABLE IF NOT EXISTS public.votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    direction text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create Followers Table
CREATE TABLE IF NOT EXISTS public.followers (
    follower_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    following_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);

-- Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    project_name text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Project Members Table
CREATE TABLE IF NOT EXISTS public.project_members (
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    role text DEFAULT 'member',
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (project_id, user_id)
);

-- Create Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id text PRIMARY KEY,
    title text NOT NULL,
    description text,
    thumbnail_url text,
    instructor_id uuid REFERENCES public.users(id),
    instructor_name text,
    instructor_avatar text,
    price real NOT NULL,
    tags text[],
    level text,
    rating real,
    student_count integer,
    created_at timestamp with time zone
);


-- Seed Data

-- Insert Users
INSERT INTO public.users (id, full_name, email, handle, headline, bio, avatar, job_title, company, skills, is_sentrybase_verified, experience_years, location) VALUES
('8a8e7a8e-7a8e-4a8e-8a8e-7a8e7a8e7a8e', 'Admin User', 'admin@sentrybase.com', 'admin', 'Lead Platform Architect', 'The primary administrator and architect of the Sentrybase platform.', 'https://i.pravatar.cc/150?u=admin', 'Lead Architect', 'Sentrybase', '{"Next.js", "TypeScript", "Supabase", "AI/ML"}', true, 10, 'Global'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Elena Vance', 'elena@example.com', 'elena', 'Senior UX Designer & Researcher', 'Crafting intuitive and user-centric digital experiences. Specializing in SaaS and complex data visualization.', 'https://i.pravatar.cc/150?u=elena', 'UX Designer', 'Innovate Inc.', '{"UX Research", "Figma", "Design Systems", "User Testing"}', true, 8, 'Berlin'),
('b2c3d4e5-f6a7-8901-2345-678901abcdef', 'Marcus Cole', 'marcus@example.com', 'mcole', 'Backend Developer', 'Building robust and scalable APIs. Python and Node.js enthusiast.', 'https://i.pravatar.cc/150?u=marcus', 'Backend Developer', 'Innovate Inc.', '{"Node.js", "Python", "PostgreSQL", "GraphQL"}', false, 6, 'London'),
('c3d4e5f6-a7b8-9012-3456-789012abcdef', 'S. Ishikawa', 's.ishikawa@example.com', 'ishikawa', 'Motion Graphics Designer', 'Bringing brands to life with motion. Expert in After Effects and Cinema 4D.', 'https://i.pravatar.cc/150?u=ishikawa', 'Motion Designer', 'Creative Assembly', '{"After Effects", "Cinema 4D", "Motion Graphics", "UI Animation"}', true, 7, 'Tokyo');

-- Insert Posts
INSERT INTO public.posts (user_id, content, author) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Just published a new case study on designing accessible data visualizations. It was a challenging but rewarding project. #UIUX #Accessibility', '{"id": "a1b2c3d4-e5f6-7890-1234-567890abcdef", "name": "Elena Vance", "handle": "elena", "avatar": "https://i.pravatar.cc/150?u=elena"}'),
('b2c3d4e5-f6a7-8901-2345-678901abcdef', 'Excited to share that our new API gateway, built with Node.js and GraphQL, is now handling 100% of production traffic. Big win for the team!', '{"id": "b2c3d4e5-f6a7-8901-2345-678901abcdef", "name": "Marcus Cole", "handle": "mcole", "avatar": "https://i.pravatar.cc/150?u=marcus"}');

-- Insert Job Opportunity Post
INSERT INTO public.posts (user_id, content, type, job_details, author) VALUES
('8a8e7a8e-7a8e-4a8e-8a8e-7a8e7a8e7a8e', 'We are looking for an experienced developer to join our team and help build the future of our analytics platform. Must have 5+ years with React & TypeScript.', 'job_opportunity', '{"title": "Senior Frontend Developer (Remote)", "budget": "120000", "keywords": ["React", "TypeScript", "Frontend"]}', '{"id": "8a8e7a8e-7a8e-4a8e-8a8e-7a8e7a8e7a8e", "name": "Admin User", "handle": "admin", "avatar": "https://i.pravatar.cc/150?u=admin"}');

-- Insert Followers
INSERT INTO public.followers (follower_id, following_id) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', '8a8e7a8e-7a8e-4a8e-8a8e-7a8e7a8e7a8e'),
('b2c3d4e5-f6a7-8901-2345-678901abcdef', 'a1b2c3d4-e5f6-7890-1234-567890abcdef');

-- Insert Projects and Members
INSERT INTO public.projects (id, creator_id, project_name) VALUES ('d4e5f6a7-b8c9-0123-4567-890123abcdef', '8a8e7a8e-7a8e-4a8e-8a8e-7a8e7a8e7a8e', 'Project Phoenix');
INSERT INTO public.project_members (project_id, user_id, role) VALUES
('d4e5f6a7-b8c9-0123-4567-890123abcdef', '8a8e7a8e-7a8e-4a8e-8a8e-7a8e7a8e7a8e', 'creator'),
('d4e5f6a7-b8c9-0123-4567-890123abcdef', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'member');

-- Insert Courses
INSERT INTO public.courses (id, title, description, thumbnail_url, instructor_id, instructor_name, instructor_avatar, price, tags, level, rating, student_count, created_at) VALUES
('course-1', 'Advanced React & TypeScript for SaaS', 'Deep dive into building scalable and maintainable SaaS applications using advanced React patterns and TypeScript.', 'https://picsum.photos/seed/course1/600/400', '8a8e7a8e-7a8e-4a8e-8a8e-7a8e7a8e7a8e', 'Admin User', 'https://i.pravatar.cc/150?u=admin', 199.99, '{"React", "TypeScript", "SaaS"}', 'advanced', 4.9, 1250, NOW()),
('course-2', 'UI/UX Design Fundamentals for Developers', 'Learn the core principles of UI/UX design to build more intuitive and user-friendly applications. No design background required.', 'https://picsum.photos/seed/course2/600/400', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Elena Vance', 'https://i.pravatar.cc/150?u=elena', 99.99, '{"UI/UX", "Figma", "Design Systems"}', 'beginner', 4.8, 8430, NOW());
