import { callGroqAI } from "../src/lib/ai/groq";
import fs from "fs";

// Load .env
if (fs.existsSync(".env")) {
  const envContent = fs.readFileSync(".env", "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
}

const mockDirectory = [
  { id: "ADMIN", name: "Admin", role: "ADMIN", specialization: "Administrator", skills: [] },
  { id: "PM01", name: "Ayesha Khan", role: "MANAGER", specialization: "Manager / Web PM", skills: [] },
  { id: "DEV01", name: "Ali Raza", role: "AGENT", specialization: "Agent / Full-Stack", skills: [] },
];

async function testCall() {
  console.log("Testing callGroqAI with fallback support...");
  const sample = "Ayesha: Let's create UrbanCart Website for client UrbanCart Clothing due 2026-10-20. Ali will do Product catalog UI for 12 hours due 2026-10-12.";
  try {
    const result = await callGroqAI(mockDirectory, sample);
    console.log("Success! Output:", JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error("Groq Call Failed:", err?.message);
  }
}

testCall();
