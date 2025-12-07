
-- Seed data for the Sentrybase application

-- Clear existing data (optional, use with caution in production)
-- delete from "votes";
-- delete from "posts";
-- delete from "user_projects";
-- delete from "projects";
-- delete from "users";


-- Insert Users
insert into
  public.users (id, name, email, handle, headline, bio, avatar, job_title, company, skills, is_sentrybase_verified, experience_years, location)
values
  (
    '8f2d594b-4823-4e90-839c-23846b731b23',
    'Elena Vance',
    'elena.vance@example.com',
    'elenavance',
    'Principal UX Architect | Forbes 30 Under 30',
    'Crafting human-centered experiences for complex systems. Expert in enterprise SaaS, design systems, and bridging the gap between product and engineering. Passionate about mentoring the next generation of designers.',
    'https://i.pravatar.cc/150?u=elena',
    'UX Architect',
    'Innovate Inc.',
    ARRAY['UX Design', 'SaaS', 'Figma', 'Design Systems', 'User Research', 'Prototyping', 'Accessibility'],
    true,
    8,
    'Germany'
  ),
  (
    'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    'Marcus Cole',
    'marcus.cole@example.com',
    'marcuscole',
    'Senior Backend Engineer | Python & Go Specialist',
    'Building scalable, resilient backend systems. Specializing in distributed systems, API design, and cloud infrastructure on GCP and AWS. Contributor to open-source projects.',
    'https://i.pravatar.cc/150?u=marcus',
    'Backend Engineer',
    'Data-Driven Co.',
    ARRAY['Python', 'Go', 'Distributed Systems', 'API Design', 'PostgreSQL', 'GCP', 'AWS', 'Kubernetes'],
    false,
    10,
    'United Kingdom'
  ),
  (
    'b2c3d4e5-f6a7-8901-2345-678901bcdef0',
    'S. Ishikawa',
    's.ishikawa@example.com',
    'ishikawa',
    'Creative Director & Motion Designer',
    'Bringing brands to life through motion. I lead creative teams to produce compelling visual narratives for global campaigns. Expert in After Effects, Cinema 4D, and brand storytelling.',
    'https://i.pravatar.cc/150?u=ishikawa',
    'Creative Director',
    'Momentum Studios',
    ARRAY['Motion Design', 'Art Direction', 'After Effects', 'Cinema 4D', 'Brand Storytelling', '3D Animation'],
    true,
    12,
    'Japan'
  );

-- Insert Posts
insert into
  public.posts (user_id, content, type, author)
values
  (
    '8f2d594b-4823-4e90-839c-23846b731b23',
    'Just published a deep-dive on creating accessible design systems for enterprise applications. It covers component states, keyboard navigation, and ARIA patterns. Link in bio! #DesignSystems #Accessibility #UX',
    'default',
    '{"id": "8f2d594b-4823-4e90-839c-23846b731b23", "name": "Elena Vance", "handle": "elenavance", "avatar": "https://i.pravatar.cc/150?u=elena", "is_sentrybase_verified": true}'
  ),
  (
    'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    'Thinking about system design for high-throughput APIs. The trade-offs between REST, gRPC, and GraphQL are always fascinating. For internal services, the performance gains from gRPC are hard to ignore. What are your go-to patterns? #Backend #SystemDesign',
    'default',
    '{"id": "a1b2c3d4-e5f6-7890-1234-567890abcdef", "name": "Marcus Cole", "handle": "marcuscole", "avatar": "https://i.pravatar.cc/150?u=marcus"}'
  ),
  (
    'b2c3d4e5-f6a7-8901-2345-678901bcdef0',
    'We''re looking for a freelance UI/UX designer to collaborate on a new mobile banking app. Must have experience in fintech and a strong portfolio. DM for details.',
    'job_opportunity',
    '{"id": "b2c3d4e5-f6a7-8901-2345-678901bcdef0", "name": "S. Ishikawa", "handle": "ishikawa", "avatar": "https://i.pravatar.cc/150?u=ishikawa", "is_sentrybase_verified": true}'
  );

-- Insert Projects (Boardrooms)
insert into
  public.projects (id, project_name, creator_id)
values
    ('p1-a1b2-c3d4-e5f6', 'Project Phoenix', 'a1b2c3d4-e5f6-7890-1234-567890abcdef');

-- Insert Project Members
insert into
  public.user_projects (user_id, project_id, role)
values
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'p1-a1b2-c3d4-e5f6', 'creator'),
  ('8f2d594b-4823-4e90-839c-23846b731b23', 'p1-a1b2-c3d4-e5f6', 'member');

-- Insert Marketbase Items
-- Portfolio
insert into public.portfolio (title, description, image_url, tags, author_id, author, author_avatar, author_headline, media_type, object_fit)
values 
('Data Visualization Suite', 'An advanced analytics dashboard designed for a fintech startup, focusing on performance and clarity.', 'https://picsum.photos/seed/portfolio1/800/600', ARRAY['Figma', 'UX Research', 'Data Visualization'], '8f2d594b-4823-4e90-839c-23846b731b23', 'Elena Vance', 'https://i.pravatar.cc/150?u=elena', 'Principal UX Architect', 'image', 'cover');

-- SaaS Products
insert into public.saas_products (name, description, price, tags, website_url, author_id, author_name)
values 
('API Guard', 'A lightweight, powerful tool for monitoring and securing your backend APIs in real-time.', '$49/mo', ARRAY['API', 'Security', 'SaaS'], 'https://example.com', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Marcus Cole');

-- Courses
insert into public.courses (title, description, thumbnail_url, instructor_id, instructor_name, instructor_avatar, price, tags, level)
values
('Advanced Motion Graphics', 'Master the art of storytelling through motion with Adobe After Effects and Cinema 4D.', 'https://picsum.photos/seed/course-ishikawa/600/400', 'b2c3d4e5-f6a7-8901-2345-678901bcdef0', 'S. Ishikawa', 'https://i.pravatar.cc/150?u=ishikawa', 299.99, ARRAY['Motion Design', 'After Effects', 'Animation'], 'advanced');

