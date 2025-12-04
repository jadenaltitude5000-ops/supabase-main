'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useUserCollection hook.
 * @template T Type of the document data.
 */
export interface UseUserCollectionResult<T> {
  data: WithId<T>[] | null; // Array of documents with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a Firestore query in real-time.
 * Handles nullable queries.
 * 
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedQuery or BAD THINGS WILL HAPPEN.
 * Use useMemo to memoize it per React guidance. Also make sure that its dependencies are stable references.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {Query<DocumentData> | null | undefined} memoizedQuery -
 * The Firestore Query. Waits if null/undefined.
 * @returns {UseUserCollectionResult<T>} Object with data, isLoading, error.
 */
export function useUserCollection<T = any>(
  memoizedQuery: Query<DocumentData> | null | undefined,
): UseUserCollectionResult<T> {
  type StateDataType = WithId<T>[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: WithId<T>[] = [];
        snapshot.forEach(doc => {
          results.push({ ...(doc.data() as T), id: doc.id });
        });
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        console.error("Firestore onSnapshot error:", err);

        // Check if the error is specifically a permission-denied error.
        if (err.code === 'permission-denied') {
          // We need to access a private property to get the path for the error message.
          // WARNING: This is not part of the public API and could break in future SDK versions.
          const path = (memoizedQuery as any)._query?.path?.segments.join('/') || 'unknown collection';
          
          const permissionError = new FirestorePermissionError({
            operation: 'list',
            path: path,
          });

          // Set the specific permission error in the state.
          setError(permissionError);

          // Emit the rich, contextual error for the global error boundary to catch.
          errorEmitter.emit('permission-error', permissionError);

        } else {
          // For all other errors (network, etc.), set the original Firestore error.
          setError(err);
        }

        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, isLoading, error };
}
