
-- Seed data for the users table
INSERT INTO
  public.users (id, full_name, email, handle, headline, bio, avatar, job_title, company, skills, is_sentrybase_verified, experience_years, location)
VALUES
  ('8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c', 'Alex Johnson', 'alex.johnson@example.com', 'alexj', 'Senior Frontend Developer', 'Building beautiful and responsive user interfaces. 10 years of experience in the tech industry, specializing in React and Next.js.', 'https://i.pravatar.cc/150?u=alexj', 'Senior Frontend Developer', 'Tech Solutions Inc.', '{"React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Node.js", "Figma"}', true, 10, 'United States'),
  ('b3e3e3e3-3e3e-3e3e-3e3e-3e3e3e3e3e3e', 'Samantha Bee', 'samantha.bee@example.com', 'sambee', 'Lead UX Designer', 'Crafting user-centric design solutions for complex problems. Passionate about accessibility and intuitive design.', 'https://i.pravatar.cc/150?u=sambee', 'Lead UX Designer', 'Creative Minds LLC', '{"UX Design", "UI Design", "Figma", "Sketch", "Prototyping", "User Research"}', true, 8, 'Canada'),
  ('c4f4f4f4-4f4f-4f4f-4f4f-4f4f4f4f4f4f', 'Michael Chen', 'michael.chen@example.com', 'mikechen', 'Full-Stack Developer', 'I build robust and scalable web applications from front to back. Let''s connect and build something great.', 'https://i.pravatar.cc/150?u=mikechen', 'Full-Stack Developer', 'Innovate Digital', '{"React", "Node.js", "Express", "MongoDB", "PostgreSQL", "Docker"}', false, 6, 'United Kingdom'),
  ('d5a5a5a5-5a5a-5a5a-5a5a-5a5a5a5a5a5a', 'Emily White', 'emily.white@example.com', 'emwhite', 'Content Strategist', 'Helping brands tell their story through compelling content. Specializing in SEO and content marketing.', 'https://i.pravatar.cc/150?u=emwhite', 'Content Strategist', 'ContentCo', '{"Content Strategy", "SEO", "Copywriting", "Editing", "Blogging"}', true, 7, 'Australia'),
  ('e6b6b6b6-6b6b-6b6b-6b6b-6b6b6b6b6b6b', 'David Green', 'david.green@example.com', 'dgreen', 'DevOps Engineer', 'Automating infrastructure and streamlining deployments. AWS certified.', 'https://i.pravatar.cc/150?u=dgreen', 'DevOps Engineer', 'CloudSphere', '{"AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"}', false, 9, 'Germany');

-- Seed data for the posts table
INSERT INTO
  public.posts (user_id, content, type, job_details)
VALUES
  ('8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c', 'Just launched a new project using Next.js 14! The performance improvements from the App Router are incredible. #webdev #nextjs', 'default', null),
  ('b3e3e3e3-3e3e-3e3e-3e3e-3e3e3e3e3e3e', 'Published a new case study on redesigning a fintech app''s onboarding flow. Reduced drop-off by 25%. #uxdesign #casestudy', 'default', null),
  ('c4f4f4f4-4f4f-4f4f-4f4f-4f4f4f4f4f4f', 'Hiring a freelance UI designer for a 3-month project. Must have experience with design systems and Figma. #hiring #uidesign', 'job_opportunity', '{"title": "UI Designer for Design System", "budget": "7500", "keywords": ["UI Design", "Figma", "Design System"]}'),
  ('d5a5a5a5-5a5a-5a5a-5a5a-5a5a5a5a5a5a', 'What are your favorite tools for content planning and organization? I''m currently exploring Notion and Trello.', 'default', null),
  ('e6b6b6b6-6b6b-6b6b-6b6b-6b6b6b6b6b6b', 'The key to successful DevOps is a culture of collaboration, not just a set of tools. #devops #culture', 'default', null);

-- Seed data for colleagues (followers)
INSERT INTO
  public.colleagues (user_id, colleague_id)
VALUES
  -- Alex follows Samantha and Michael
  ('8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c', 'b3e3e3e3-3e3e-3e3e-3e3e-3e3e3e3e3e3e'),
  ('8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c', 'c4f4f4f4-4f4f-4f4f-4f4f-4f4f4f4f4f4f'),
  -- Samantha follows Alex and Emily
  ('b3e3e3e3-3e3e-3e3e-3e3e-3e3e3e3e3e3e', '8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c'),
  ('b3e3e3e3-3e3e-3e3e-3e3e-3e3e3e3e3e3e', 'd5a5a5a5-5a5a-5a5a-5a5a-5a5a5a5a5a5a');

-- Seed data for projects and members
INSERT INTO public.projects (id, project_name, creator_id) VALUES ('a1b2c3d4-e5f6-a1b2-c3d4-e5f6a1b2c3d4', 'Sentrybase Website Relaunch', '8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c');

INSERT INTO public.project_members (project_id, user_id, role) VALUES 
('a1b2c3d4-e5f6-a1b2-c3d4-e5f6a1b2c3d4', '8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c', 'creator'),
('a1b2c3d4-e5f6-a1b2-c3d4-e5f6a1b2c3d4', 'b3e3e3e3-3e3e-3e3e-3e3e-3e3e3e3e3e3e', 'member');

INSERT INTO public.user_projects (project_id, user_id, role) VALUES 
('a1b2c3d4-e5f6-a1b2-c3d4-e5f6a1b2c3d4', '8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c', 'creator'),
('a1b2c3d4-e5f6-a1b2-c3d4-e5f6a1b2c3d4', 'b3e3e3e3-3e3e-3e3e-3e3e-3e3e3e3e3e3e', 'member');


-- Seed data for portfolio items
INSERT INTO public.portfolio (id, user_id, title, description, image_url, tags, author_id, author, author_avatar, author_headline, media_type) VALUES
('p1', '8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c', 'E-commerce Dashboard', 'A clean and modern dashboard for an e-commerce platform.', 'https://picsum.photos/seed/p1/800/600', '{"React", "Data Viz", "UI/UX"}', '8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c', 'Alex Johnson', 'https://i.pravatar.cc/150?u=alexj', 'Senior Frontend Developer', 'image'),
('p2', 'b3e3e3e3-3e3e-3e3e-3e3e-3e3e3e3e3e3e', 'Mobile Banking App Concept', 'A user-centric concept for a next-gen mobile banking application.', 'https://picsum.photos/seed/p2/800/600', '{"Figma", "Prototyping", "Mobile UI"}', 'b3e3e3e3-3e3e-3e3e-3e3e-3e3e3e3e3e3e', 'Samantha Bee', 'https://i.pravatar.cc/150?u=sambee', 'Lead UX Designer', 'image');


-- Seed data for SaaS products
INSERT INTO public.saas_products (id, name, description, author_id, author_name, price, tags, website_url) VALUES
('s1', 'Formify', 'No-code form builder for startups.', 'c4f4f4f4-4f4f-4f4f-4f4f-4f4f4f4f4f4f', 'Michael Chen', '$19/mo', '{"SaaS", "Forms", "No-Code"}', 'https://example.com/formify'),
('s2', 'ContentCal', 'AI-powered content calendar and scheduler.', 'd5a5a5a5-5a5a-5a5a-5a5a-5a5a5a5a5a5a', 'Emily White', '$29/mo', '{"SaaS", "Content Marketing", "AI"}', 'https://example.com/contentcal');


-- Seed data for courses
INSERT INTO public.courses (id, title, description, thumbnail_url, instructor_id, instructor_name, instructor_avatar, price, tags, level) VALUES
('c1', 'React for Beginners', 'Learn the fundamentals of React in this comprehensive course.', 'https://picsum.photos/seed/c1/600/400', '8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c', 'Alex Johnson', 'https://i.pravatar.cc/150?u=alexj', 99.99, '{"React", "JavaScript"}', 'beginner'),
('c2', 'Advanced UI/UX', 'Master advanced UI/UX principles and techniques.', 'https://picsum.photos/seed/c2/600/400', 'b3e3e3e3-3e3e-3e3e-3e3e-3e3e3e3e3e3e', 'Samantha Bee', 'https://i.pravatar.cc/150?u=sambee', 149.99, '{"UI/UX", "Design Systems"}', 'advanced');

-- Seed data for contracts
INSERT INTO public.contracts (id, title, owner_id, status) VALUES 
('contract-1', 'Website Redesign Agreement', '8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c', 'draft'),
('contract-2', 'Logo Design Contract', 'b3e3e3e3-3e3e-3e3e-3e3e-3e3e3e3e3e3e', 'signed');

-- Seed user_contracts mapping
INSERT INTO public.user_contracts (user_id, contract_id, role) VALUES
('8d1c8c00-0d73-4e35-9a3b-5519b7c53c0c', 'contract-1', 'owner'),
('b3e3e3e3-3e3e-3e3e-3e3e-3e3e3e3e3e3e', 'contract-2', 'owner');
