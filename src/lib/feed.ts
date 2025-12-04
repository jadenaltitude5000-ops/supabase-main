
/**
 * @fileOverview Supreme Feed Algorithm
 * This file contains the deterministic algorithm for ranking and personalizing the user's feed.
 * It replaces all AI-based content generation and ranking.
 */
'use server';

import { cosineSimilarity } from './algorithms/text-analysis';
import type { Post } from './types'; 

type UserVector = Map<string, number>;
type PostVector = Map<string, number>;

// Weights for different interaction types
const INTERACTION_WEIGHTS = {
  job_opportunity: 1.0,
  repost: 0.8,
  default: 0.5,
};

/**
 * Calculates the relevance of a post to a user.
 * @param userVector The user's skill/interest TF-IDF vector.
 * @param postVector The post's content TF-IDF vector.
 * @returns A relevance score between 0 and 1.
 */
function calculateRelevance(userVector: UserVector, postVector: PostVector): number {
  if (userVector.size === 0 || postVector.size === 0) {
    return 0;
  }
  return cosineSimilarity(userVector, postVector);
}

/**
 * Calculates a recency score with exponential decay.
 * @param postTimestamp The timestamp of the post.
 * @returns A score between 0 and 1, decreasing with age.
 */
function calculateRecency(postTimestamp: Date): number {
  const now = new Date();
  const ageInHours = (now.getTime() - postTimestamp.getTime()) / (1000 * 60 * 60);
  const decayRate = 7 * 24; // Half-life of 7 days
  return Math.exp(-ageInHours / decayRate);
}

function getPostType(post: Post): keyof typeof INTERACTION_WEIGHTS {
    if (post.jobDetails) {
        return 'job_opportunity';
    }
    if (post.originalPost) {
        return 'repost';
    }
    return 'default';
}

/**
 * The supreme feed generation algorithm.
 * @param userId The ID of the user for whom to generate the feed.
 * @param posts A list of all potential feed items from Firestore.
 * @param userVector The user's pre-calculated TF-IDF vector.
 * @param postVectors A map of postId to pre-calculated post TF-IDF vectors.
 * @param followedUserIds A set of user IDs that the current user follows.
 * @returns A sorted list of posts for the user's feed.
 */
export async function generatePersonalizedFeed(
  userId: string,
  posts: Post[],
  userVector: UserVector,
  postVectors: Map<string, PostVector>,
  followedUserIds: Set<string>
): Promise<Post[]> {
  const scoredPosts = posts.map(post => {
    const postVector = postVectors.get(post.id) || new Map();
    
    const postType = getPostType(post);
    const interactionWeight = INTERACTION_WEIGHTS[postType];

    const postDate = (post.createdAt as any)?.toDate ? (post.createdAt as any).toDate() : new Date();
    const recencyScore = calculateRecency(postDate);

    const relevanceScore = calculateRelevance(userVector, postVector);

    const followerBoost = followedUserIds.has(post.author.id) ? 1.2 : 1.0;

    let finalScore = interactionWeight * recencyScore * (0.5 + relevanceScore * 0.5) * followerBoost;

    const professionalKeywords = ['hiring', 'project', 'contract', 'portfolio', 'update', 'skill'];
    const unprofessionalKeywords = ['lol', 'meme', 'funny', 'amazing', 'wow'];
    
    const content = post.content.toLowerCase();
    if (unprofessionalKeywords.some(kw => content.includes(kw)) && !professionalKeywords.some(kw => content.includes(kw))) {
        finalScore *= 0.1;
    }
    
    if (post.image) {
        finalScore *= 0.3;
    }

    return { ...post, score: finalScore };
  });

  scoredPosts.sort((a, b) => (b as any).score - (a as any).score);
  
  return scoredPosts;
}
