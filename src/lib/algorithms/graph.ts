/**
 * @fileOverview Graph Service
 * Contains algorithms for graph traversal and analysis, used for networking features.
 * Models connections between users as a graph.
 */

// Represents the graph structure, where key is userId and value is a list of connected userIds.
type AdjacencyList = Map<string, string[]>;

/**
 * Finds second-degree connections for a user.
 * @param userId The ID of the user to start from.
 * @param graph The entire connection graph (adjacency list).
 * @returns A set of user IDs representing second-degree connections.
 */
export function findSecondDegreeConnections(userId: string, graph: AdjacencyList): Set<string> {
  const firstDegree = new Set(graph.get(userId) || []);
  const secondDegree = new Set<string>();

  firstDegree.forEach(connectionId => {
    const connectionsOfConnection = graph.get(connectionId) || [];
    connectionsOfConnection.forEach(secondDegreeId => {
      // Ensure the connection is not the original user and not already a first-degree connection.
      if (secondDegreeId !== userId && !firstDegree.has(secondDegreeId)) {
        secondDegree.add(secondDegreeId);
      }
    });
  });

  return secondDegree;
}

/**
 * Suggests connections based on shared connections (mutual friends).
 * @param userId The user for whom to generate suggestions.
 * @param graph The connection graph.
 * @returns A map of suggested user IDs to the number of mutual connections.
 */
export function suggestConnectionsByMutuals(userId: string, graph: AdjacencyList): Map<string, number> {
  const suggestions = new Map<string, number>();
  const secondDegreeConnections = findSecondDegreeConnections(userId, graph);
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

  // Sort suggestions by number of mutual connections, descending.
  return new Map([...suggestions.entries()].sort((a, b) => b[1] - a[1]));
}
