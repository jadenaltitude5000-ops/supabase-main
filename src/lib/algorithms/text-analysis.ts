
/**
 * @fileOverview Text Analysis Service
 * Contains algorithms for processing and analyzing text, such as TF-IDF.
 * This is a core component of the non-AI recommendation and matching engine.
 */

/**
 * Term Frequency-Inverse Document Frequency (TF-IDF)
 * A simple implementation for calculating text vectors.
 *
 * In a real, large-scale system, this would be more complex, likely pre-calculating
 * IDF values across the entire corpus of user profiles and project descriptions
 * via a scheduled batch job (e.g., a daily Firebase Function).
 */

type Document = string;

// Simple stop-word list. A production system would have a more extensive list.
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  's', 'same', 'she', 'should', 'so', 'some', 'such',
  't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up',
  'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

function calculateTf(term: string, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const termCount = tokens.filter(t => t === term).length;
  return termCount / tokens.length;
}

function calculateIdf(term: string, documents: Document[]): number {
  if (documents.length === 0) return 0;
  const docsWithTerm = documents.filter(doc => tokenize(doc).includes(term)).length;
  if (docsWithTerm === 0) return 0;
  return Math.log(documents.length / docsWithTerm);
}

/**
 * Creates a TF-IDF vector for a single document.
 * @param doc The document to vectorize.
 * @param documents The entire corpus of documents (for IDF calculation).
 * @param vocabulary A predefined set of terms to form the vector.
 * @returns A TF-IDF vector (map of term to score).
 */
export function createTfIdfVector(doc: Document, documents: Document[], vocabulary: Set<string>): Map<string, number> {
  const tokens = tokenize(doc);
  const vector = new Map<string, number>();

  vocabulary.forEach(term => {
    const tf = calculateTf(term, tokens);
    const idf = calculateIdf(term, documents); // Inefficient for real-time; should be pre-calculated.
    vector.set(term, tf * idf);
  });

  return vector;
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param vecA The first vector.
 * @param vecB The second vector.
 * @returns A similarity score between 0 and 1.
 */
export function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  const allKeys = new Set([...vecA.keys(), ...vecB.keys()]);

  allKeys.forEach(key => {
    const valA = vecA.get(key) || 0;
    const valB = vecB.get(key) || 0;
    dotProduct += valA * valB;
    magnitudeA += valA * valA;
    magnitudeB += valB * valB;
  });

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Builds a vocabulary from a corpus of documents.
 * In a production system, this would be managed in Firestore.
 */
export function buildVocabulary(documents: Document[]): Set<string> {
    const vocabulary = new Set<string>();
    documents.forEach(doc => {
        tokenize(doc).forEach(token => vocabulary.add(token));
    });
    return vocabulary;
}

    