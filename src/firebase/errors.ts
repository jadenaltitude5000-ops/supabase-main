import { AuthError } from '@supabase/supabase-js';

/**
 * Checks if the caught error is a Supabase authentication error.
 * @param error - The error object from a catch block.
 * @returns True if the error is an AuthError, false otherwise.
 */
export function isSupabaseAuthError(error: any): error is AuthError {
  return error instanceof AuthError;
}

// You can add more specific error helpers here if needed
// For example, checking for specific error messages
export function isEmailAlreadyInUseError(error: any): boolean {
  return isSupabaseAuthError(error) && error.message?.includes('already registered');
}
