'use server';
/**
 * @fileoverview This file initializes the Genkit AI platform with the Google AI plugin.
 *
 * It configures a global `ai` object that is used throughout the application
 * to interact with generative models for tasks like content generation,
 * function calling, and more.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit with the Google AI plugin.
// This will automatically look for the GEMINI_API_KEY environment variable.
const ai = genkit({
  plugins: [googleAI()],
  // Use a file-based tracer for local development.
  // tracers: [new FileSystemTraceStore()],
});

export { ai };
