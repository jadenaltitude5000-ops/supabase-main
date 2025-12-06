
import type { PortfolioItem } from './types';

// This file contains placeholder data that would normally come from a backend.

export const portfolioItems: (PortfolioItem & { images?: string[] })[] = Array.from({ length: 12 }).map((_, i) => {
    const itemType = i % 3;
    let specificContent: Partial<PortfolioItem> = {};

    switch(itemType) {
        case 0: // Image gallery
            specificContent = {
                media_type: 'image',
                images: [
                    `https://picsum.photos/seed/${i + 100}/1200/800`,
                    `https://picsum.photos/seed/${i + 200}/1200/800`,
                    `https://picsum.photos/seed/${i + 300}/1200/800`,
                ],
                image_url: `https://picsum.photos/seed/${i + 100}/800/600` // Main image
            };
            break;
        case 1: // Video
            specificContent = {
                media_type: 'video',
                video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Placeholder video
                image_url: `https://picsum.photos/seed/${i + 100}/800/600`
            };
            break;
        case 2: // App Link
            specificContent = {
                media_type: 'app',
                app_url: 'https://sentry.io', // Placeholder app link
                image_url: `https://picsum.photos/seed/${i + 100}/800/600`
            };
            break;
    }

    return {
      id: `portfolio-${i + 1}`,
      title: `Project ${String.fromCharCode(65 + i)}`,
      author_id: `user-${i+1}`,
      author: 'Sentrybase User',
      author_avatar: `https://i.pravatar.cc/150?u=user${i+1}`,
      author_headline: 'Digital Creator & Innovator',
      description: 'A detailed exploration of this project, focusing on modern UI/UX principles and scalable backend architecture. This project showcases a commitment to clean code and intuitive user experiences. The goal was to deliver a performant and aesthetically pleasing interface that meets both user needs and business objectives.',
      tags: ['UI/UX', 'Figma', 'Web Design', 'React', 'Next.js', 'Node.js', 'Firebase', 'Vercel'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...specificContent,
    } as PortfolioItem & { images: string[] };
});
