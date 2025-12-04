/**
 * @fileOverview CohortSync - Algorithmic Networking and Grouping
 * This file contains algorithms for graph traversal, connection recommendations,
 * and rule-based cohort clustering.
 */
'use server';

import type { User } from './types';

// In a real application, this would interact with Firestore.
type AdjacencyList = Map<string, string[]>; // Key: userId, Value: array of connected/followed userIds

/**
 * Finds second-degree connections for a user.
 * @param userId The ID of the user to start from.
 * @param graph The entire connection graph (adjacency list).
 * @returns A set of user IDs representing second-degree connections.
 */
export async function findSecondDegreeConnections(userId: string, graph: AdjacencyList): Promise<Set<string>> {
  const firstDegree = new Set(graph.get(userId) || []);
  const secondDegree = new Set<string>();

  firstDegree.forEach(connectionId => {
    const connectionsOfConnection = graph.get(connectionId) || [];
    connectionsOfConnection.forEach(secondDegreeId => {
      // The connection must not be the original user and not already a first-degree connection.
      if (secondDegreeId !== userId && !firstDegree.has(secondDegreeId)) {
        secondDegree.add(secondDegreeId);
      }
    });
  });

  return secondDegree;
}

/**
 * Suggests connections based on shared connections (mutuals).
 * @param userId The user for whom to generate suggestions.
 * @param graph The connection graph.
 * @returns A map of suggested user IDs to the number of mutual connections.
 */
export async function suggestConnectionsByMutuals(userId: string, graph: AdjacencyList): Promise<Map<string, number>> {
  const suggestions = new Map<string, number>();
  const secondDegreeConnections = await findSecondDegreeConnections(userId, graph);
  const myConnections = new Set(graph.get(userId) || []);

  secondDegreeConnections.forEach(potentialSuggestionId => {
    const theirConnections = new Set(graph.get(potentialSuggestionId) || []);
    let mutualCount = 0;
    myConnections.forEach(myConnectionId => {
      if (theirConnections.has(myConnectionId)) {
        mutualCount++;
      }
    });
    if (mutualCount > 0) {
      suggestions.set(potentialSuggestionId, mutualCount);
    }
  });

  // Sort suggestions by the number of mutual connections, descending.
  return new Map([...suggestions.entries()].sort((a, b) => b[1] - a[1]));
}

/**
 * Forms cohorts based on shared skills and project history using a rule-based clustering approach.
 * This simulates a k-means-like algorithm without the iterative complexity.
 * @param users An array of user objects, including their skills and projects.
 * @returns A map of cohort names to user IDs.
 */
export async function formCohorts(users: { id: string; skills: string[]; portfolio: any[] }[]): Promise<Map<string, string[]>> {
    const cohorts = new Map<string, string[]>(); // Key: cohort name (e.g., 'react-fintech'), Value: user IDs

    // Rule 1: Cluster by primary skill
    users.forEach(user => {
        if (user.skills && user.skills.length > 0) {
            const primarySkill = user.skills[0].toLowerCase().replace(/\s+/g, '-');
            if (!cohorts.has(primarySkill)) {
                cohorts.set(primarySkill, []);
            }
            cohorts.get(primarySkill)!.push(user.id);
        }
    });

    // Rule 2: Refine clusters by secondary skills or project tags (simplified)
    // A more advanced version would create sub-clusters or new clusters based on common intersections.
    // For example, finding users within the 'react' cohort who also have 'd3.js' and 'fintech' skills.

    // Filter out very small cohorts
    for (const [key, value] of cohorts.entries()) {
        if (value.length < 3) { // A cohort requires at least 3 members
            cohorts.delete(key);
        }
    }

    return cohorts;
}

// API-like functions for the new follow feature
/**
 * Follow a user. In a real app, this would be a Firebase Function.
 * @param followerId The user initiating the follow.
 * @param followedId The user being followed.
 */
export async function followUser(followerId: string, followedId: string): Promise<{ success: boolean; isMutual: boolean }> {
  // 1. Add followedId to follower's 'following' subcollection in Firestore.
  //    db.collection('users').doc(followerId).collection('following').doc(followedId).set({});
  // 2. Add followerId to followed's 'followers' subcollection.
  //    db.collection('users').doc(followedId).collection('followers').doc(followerId).set({});
  // 3. Check for mutuality.
  //    const isFollowingBackDoc = await db.collection('users').doc(followedId).collection('following').doc(followerId).get();
  //    const isMutual = isFollowingBackDoc.exists;
  //    if (isMutual) {
  //      // Could create a "connection" document or update both user docs
  //    }
  console.log(`${followerId} is now following ${followedId}`);
  // This is a simulation. In a real app, you'd get the mutual status from the database check.
  const isMutual = Math.random() > 0.5; 
  return { success: true, isMutual };
}
