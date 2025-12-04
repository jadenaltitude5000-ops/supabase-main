
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await'.
  createUserWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
        // Although we don't block on this, we should still handle auth-specific errors
        // This is different from Firestore permission errors, but we can log them for now.
        console.error("Authentication Error during sign-up:", error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await'.
  signInWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
        console.error("Authentication Error during sign-in:", error);
    });
}
