import Groq from "groq-sdk";
import { SYSTEM_PROMPT, buildUserPrompt, DirectoryUser } from "./prompt";

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

const FALLBACK_MODELS = [
  process.env.GROQ_MODEL,
  "llama-3.1-70b-versatile",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-70b-8192",
  "mixtral-8x7b-32768",
].filter(Boolean) as string[];

export async function callGroqAI(directory: DirectoryUser[], transcript: string): Promise<unknown> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in environment variables.");
  }

  const groq = new Groq({
    apiKey,
    timeout: 45000,
  });

  const userPrompt = buildUserPrompt(directory, transcript);

  let lastError: Error | null = null;

  // Deduplicate model list
  const modelsToTry = Array.from(new Set(FALLBACK_MODELS));

  for (const model of modelsToTry) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });

      const rawContent = completion.choices[0]?.message?.content ?? "";
      if (!rawContent) {
        throw new Error("AI returned an empty response.");
      }

      const cleaned = cleanJsonString(rawContent);
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err: unknown) {
      const error = err as Error & { status?: number; code?: string };
      lastError = error;

      // If model not found (404), try next model in fallback list
      if (error?.status === 404 || error?.message?.includes("model_not_found")) {
        console.warn(`Groq model ${model} not available (404), trying next model...`);
        continue;
      }

      if (error?.status === 429) {
        throw new Error("AI service is currently busy (Rate limited). Please wait a moment and retry.");
      }

      // If other error, throw
      break;
    }
  }

  throw new Error(`AI generation failed: ${lastError?.message || "Invalid JSON output"}`);
}
