
/**
 * @fileOverview Core matchmaking and recommendation algorithms.
 * This file replaces all AI-powered logic with deterministic, rule-based systems.
 *
 * - skillSyncNet: Algorithmic replacement for the SkillSyncNet AI flow.
 */

import { z } from 'zod';
import { cosineSimilarity, createTfIdfVector, buildVocabulary } from '@/lib/algorithms/text-analysis';
import type { User, AppUser } from './types';

// Schema definitions remain for input validation.
export const ClientBriefSchema = z.object({
    project_title: z.string(),
    project_description: z.string(),
    required_skills: z.string(),
    budget: z.number(),
    timeline: z.string(),
    experience_years: z.number().optional(), // New field for fairness calculation
});
export type ClientBrief = z.infer<typeof ClientBriefSchema>;

export const FreelancerProfileSchema = z.object({
    name: z.string(),
    headline: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    skills: z.array(z.string()),
    experience_years: z.number().optional(),
    email: z.string().email().optional(),
});
export type FreelancerProfile = z.infer<typeof FreelancerProfileSchema>;

export const SkillSyncNetInputSchema = z.object({
  context: z.enum(["client_seeking_freelancer", "freelancer_seeking_project"]),
  clientBrief: ClientBriefSchema.optional(),
  freelancerProfile: FreelancerProfileSchema.optional(),
  // In a real app, vectors would be fetched from Firestore, not passed in.
  // This is simplified for demonstration.
  clientBriefVector: z.map(z.string(), z.number()),
  freelancerProfilesWithVectors: z.array(z.object({
      profile: z.custom<User>(),
      vector: z.map(z.string(), z.number())
  })),
});
export type SkillSyncNetInput = z.infer<typeof SkillSyncNetInputSchema>;

export const SkillSyncNetOutputSchema = z.object({
  match: z.object({
    freelancer: z.object({
        name: z.string(),
        headline: z.string(),
        skills: z.array(z.string()),
        matchReasoning: z.string(),
        matchConfidence: z.number(),
    }).optional(),
    project: z.object({
        title: z.string(),
        clientName: z.string(),
        description: z.string(),
        requiredSkills: z.array(z.string()),
        budget: z.number(),
        timeline: z.string(),
        matchReasoning: z.string(),
        matchConfidence: z.number(),
    }).optional(),
  }).nullable().describe("The algorithmically-vetted match. Null if no suitable match found."),
});
export type SkillSyncNetOutput = z.infer<typeof SkillSyncNetOutputSchema>;


/**
 * Deterministic, two-brain algorithmic replacement for the SkillSyncNet AI flow.
 * This function simulates what would run inside a secured Firebase Cloud Function.
 */
export async function skillSyncNet(input: SkillSyncNetInput): Promise<SkillSyncNetOutput> {
  const { context, clientBrief, freelancerProfile, clientBriefVector, freelancerProfilesWithVectors } = SkillSyncNetInputSchema.parse(input);

  if (context === "client_seeking_freelancer") {
    if (!clientBrief || !clientBriefVector) {
      throw new Error("Client brief and vector are required for this context.");
    }
    if (freelancerProfilesWithVectors.length === 0) {
        return { match: null }; // No candidates to match against
    }

    let bestMatch: { freelancer: User; score: number } | null = null;
    let highestScore = -1;

    freelancerProfilesWithVectors.forEach(({ profile, vector }) => {
      const similarity = cosineSimilarity(clientBriefVector, vector);
      
      // Fairness algorithm: Adjust score based on experience and budget
      const clientExperiencePref = clientBrief.experience_years || 0;
      const freelancerExperience = profile.experience_years || 0;
      const experienceDiff = Math.abs(clientExperiencePref - freelancerExperience);
      const experiencePenalty = Math.min(1, experienceDiff / 10); // 10% penalty per year of difference, capped at 100%

      const fairRate = (freelancerExperience * 15) + 50; // Simple formula: $50/hr base + $15/hr per year experience
      const budgetRatio = clientBrief.budget / (fairRate * 40 * (getTimelineInMonths(clientBrief.timeline))); // Assuming 40hr/week
      const budgetFairness = Math.min(1, budgetRatio); // Cap at 1, so overpaying doesn't give extra points

      // Final score combines similarity and fairness
      const finalScore = similarity * (1 - experiencePenalty) * budgetFairness;
      
      if (finalScore > highestScore) {
        highestScore = finalScore;
        bestMatch = { freelancer: profile, score: finalScore };
      }
    });

    if (!bestMatch) {
      return { match: null };
    }
    
    const { freelancer, score } = bestMatch as { freelancer: AppUser, score: number };
    
    const reasoning = `This freelancer is a strong match due to a high skill overlap with your project requirements. Their experience level is well-aligned with your project's scope, and the proposed budget is fair for their expertise.`;
    
    return {
      match: {
        freelancer: {
          name: freelancer.name,
          headline: freelancer.headline || '',
          skills: freelancer.skills || [],
          matchReasoning: reasoning,
          matchConfidence: Math.min(99, Math.round(score * 100)), // Cap confidence at 99%
        },
      },
    };
  }

  // Placeholder for freelancer_seeking_project context
  return { match: null };
}

function getTimelineInMonths(timeline: string): number {
    switch (timeline) {
        case "<1 week": return 0.25;
        case "1-2 weeks": return 0.5;
        case "2-4 weeks": return 1.0;
        case "1-2 months": return 2.0;
        case ">2 months": return 3.0; // Assume 3 for calculation
        default: return 1.0;
    }
}
