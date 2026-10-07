import Groq from "groq-sdk";
import { SYSTEM_PROMPT, buildUserPrompt, DirectoryUser } from "./prompt";

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  // Remove markdown code blocks if present
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

export async function callGroqAI(directory: DirectoryUser[], transcript: string): Promise<unknown> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in environment variables.");
  }

  const groq = new Groq({
    apiKey,
    timeout: 60000, // 60s timeout
  });

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const userPrompt = buildUserPrompt(directory, transcript);

  let lastError: Error | null = null;
  // Try up to 2 times for robust AI response parsing
  for (let attempt = 1; attempt <= 2; attempt++) {
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
      const error = err as Error & { status?: number };
      lastError = error;
      if (error?.status === 429) {
        throw new Error("AI service is currently busy (Rate limited). Please wait a moment and try again.");
      }
      if (attempt === 1) {
        // Wait 1 second before 2nd attempt
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }

  throw new Error(`AI generation failed: ${lastError?.message || "Invalid JSON output"}`);
}
