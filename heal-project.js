// heal-project.js

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { glob } = require('glob');

// --- CONFIGURATION ---
const GEMINI_API_KEY = 'AIzaSyAi6RxxH-m4pyWR1xnUV1ZBwWIwDdGMOeA'
const FILE_PATTERNS = ['src/**/*.{ts,tsx}']; // Files to process
const EXCLUDE_PATTERNS = ['**/*.d.ts'];      // Files to ignore
// ---------------------



const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' }); // Use flash for speed

const prompt = `
You are an expert TypeScript developer tasked with a single, critical refactoring task.

Your instructions are to fix the provided code file based on this master plan:
1.  **Correct all property names to snake_case.** The database uses snake_case (e.g., image_url, author_id, created_at). The application code incorrectly uses camelCase. Change ALL instances of camelCase properties to their correct snake_case equivalents (e.g., item.imageUrl becomes item.image_url).
2.  **Fix all Supabase queries.** Ensure table names and object keys in queries match the snake_case database schema.
3.  **Fix type assertions.** Replace unsafe assertions like 'data as MyType[]' with the safer 'data as unknown as MyType[]' pattern.
4.  **Fix null vs undefined.** Resolve any conflicts where a database null value is passed to a component expecting undefined, using the nullish coalescing operator (?? undefined).
5.  **DO NOT change logic.** Only fix syntax, types, and property names to match the schema.
6.  **Respond with ONLY the complete, fixed code.** Do not include any explanations, markdown formatting, or apologies. The response must be a raw, valid code file that can be saved directly.

Here is the file content:
`;

async function healFile(filePath) {
  try {
    console.log(`\n🔧 Processing: ${filePath}`);
    const originalCode = fs.readFileSync(filePath, 'utf8');

    const result = await model.generateContent(prompt + `\n\`\`\`typescript\n${originalCode}\n\`\`\``);
    const fixedCode = result.response.text();

    if (!fixedCode || fixedCode.trim().length === 0) {
      console.warn(`⚠️  Received empty response for ${filePath}. Skipping.`);
      return;
    }

    fs.writeFileSync(filePath, fixedCode, 'utf8');
    console.log(`✅ Healed: ${filePath}`);

  } catch (error) {
    console.error(`❌ FAILED to heal ${filePath}: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting project-wide healing process...');
  const files = await glob(FILE_PATTERNS, { ignore: EXCLUDE_PATTERNS });
  console.log(`Found ${files.length} files to process.`);

  for (const file of files) {
    await healFile(file);
    // Add a small delay to avoid hitting API rate limits too hard
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🎉 Healing process complete.');
  console.log('Please run "git diff" to review the changes and "npm run build" to check for errors.');
}

main();