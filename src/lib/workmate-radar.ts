
/**
 * @fileOverview Deterministic AI Workmate Radar Algorithm
 * This file contains the deterministic algorithm for the AI Workmate Radar feature,
 * replacing any AI/ML-based logic with a rule-based system.
 */
'use server';

import { cosineSimilarity } from '@/lib/algorithms/text-analysis';
import type { AppUser, AIWorkmateRadarInput, AIWorkmateRadarOutput } from '@/lib/types';
import { AIWorkmateRadarInputSchema } from '@/lib/types';


/**
 * Deterministic, rule-based algorithm to find suitable team members.
 * This simulates what would run on a secure backend. The client provides
 * its own data, and the backend would securely compare it against a candidate pool.
 *
 * @param input The input containing the current user's profile vector and a SAFE list of candidates.
 * @returns A list of suggested team members with a calculated match score.
 */
export async function aiWorkmateRadar(input: AIWorkmateRadarInput): Promise<AIWorkmateRadarOutput> {
    const { currentUserVector, allUsersWithVectors, teamSize, currentUserId, country } = AIWorkmateRadarInputSchema.parse(input);

    const candidates = allUsersWithVectors.filter(
        (user) => user.profile.id !== currentUserId
    );

    const scoredCandidates = candidates
      .map((candidate) => {
        const similarity = cosineSimilarity(
          currentUserVector,
          candidate.vector
        );
        const score = Math.round(similarity * 100);

        // Filter by country if 'Global' is not selected
        if (country && country !== 'Global' && candidate.profile.location !== country) {
            return { ...candidate, score: 0 }; // Exclude if location doesn't match
        }

        return { ...candidate, score };
      })
      .filter(c => c.score > 10) // Filter out very low scores
      .sort((a, b) => b.score - a.score);

    // If primary matching yields results, use them.
    if (scoredCandidates.length > 0) {
        const topMatches = scoredCandidates.slice(0, teamSize);

        return {
            suggestedMembers: topMatches.map(member => ({
                profileId: member.profile.id,
                name: member.profile.name || 'Unnamed User',
                headline: member.profile.headline || 'No headline available',
                shortBio: member.profile.bio || 'No bio available',
                skills: member.profile.skills || [],
                matchScore: member.score,
            }))
        };
    }

    // --- Fallback Logic: "Who You Might Profit With" ---
    const currentUserProfile = allUsersWithVectors.find(u => u.profile.id === currentUserId)?.profile as AppUser | undefined;
    if (!currentUserProfile) {
        return { suggestedMembers: [] };
    }
    const currentUserAge = currentUserProfile.experience_years ? (20 + currentUserProfile.experience_years) : 30; // Approximation
    const currentUserCountry = currentUserProfile.location;

    const fallbackCandidates = candidates
        .map(candidate => {
            const typedProfile = candidate.profile as AppUser;
            const candidateAge = typedProfile.experience_years ? (20 + typedProfile.experience_years) : 30;
            const ageDifference = Math.abs(currentUserAge - candidateAge);
            const isSameCountry = typedProfile.location === currentUserCountry;

            let score = 0;
            if (isSameCountry) score += 40;
            if (ageDifference <= 5) score += 30;
            else if (ageDifference <= 10) score += 15;

            // Small boost for having any skills in common
            const commonSkills = (currentUserProfile.skills || []).filter(skill => (typedProfile.skills || []).includes(skill));
            if (commonSkills.length > 0) {
                score += commonSkills.length * 5;
            }

            return { ...candidate, score };
        })
        .filter(c => c.score > 30) // Only show reasonably relevant fallback suggestions
        .sort((a, b) => b.score - a.score);

    const fallbackMatches = fallbackCandidates.slice(0, teamSize);

    return {
        suggestedMembers: fallbackMatches.map(member => ({
            profileId: member.profile.id,
            name: member.profile.name || 'Unnamed User',
            headline: member.profile.headline || 'No headline available',
            shortBio: `Potential collaborator in your area.`,
            skills: member.profile.skills || [],
            matchScore: member.score,
            isFallback: true, // Custom flag to indicate this is a secondary match
        }))
    };
}
