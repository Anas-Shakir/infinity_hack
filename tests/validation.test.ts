import { validateTranscriptDraft } from "../src/lib/validation";
import { TranscriptOutput } from "../src/lib/ai/schema";
import { DirectoryUser } from "../src/lib/ai/prompt";

const MOCK_DIRECTORY: DirectoryUser[] = [
  { id: "ADMIN", name: "Admin", role: "ADMIN", specialization: "Administrator", skills: [] },
  { id: "PM01", name: "Ayesha Khan", role: "MANAGER", specialization: "Web PM", skills: [] },
  { id: "DEV01", name: "Ali Raza", role: "AGENT", specialization: "Full-Stack", skills: [] },
];

function runValidationTests() {
  console.log("--- Starting Business Rule Validation Tests ---");

  // Test 1: Valid draft
  const validDraft: TranscriptOutput = {
    projects: [
      {
        name: "UrbanCart Website",
        clientName: "UrbanCart Clothing",
        description: "Demo shop",
        managerId: "PM01",
        deadline: "2026-10-20",
        tasks: [
          {
            title: "Product catalog UI",
            description: "Catalog screen",
            assigneeId: "DEV01",
            deadline: "2026-10-12",
            estimatedHours: 12,
          },
        ],
      },
    ],
  };

  const res1 = validateTranscriptDraft(validDraft, MOCK_DIRECTORY);
  console.log(`✓ Valid draft test: valid=${res1.valid}, issues=${res1.issues.length}`);
  if (!res1.valid || res1.issues.length > 0) throw new Error("Expected valid draft to pass");

  // Test 2: Invalid manager role + Task deadline after project deadline + Non-agent assignee + Zero hours
  const invalidDraft: TranscriptOutput = {
    projects: [
      {
        name: "Broken Project",
        clientName: "Broken Client",
        description: "",
        managerId: "DEV01", // DEV01 is an AGENT, not a MANAGER!
        deadline: "2026-10-10",
        tasks: [
          {
            title: "Task 1",
            description: "",
            assigneeId: "PM01", // PM01 is a MANAGER, not an AGENT!
            deadline: "2026-10-15", // After project deadline (10-10)!
            estimatedHours: 0, // Zero hours!
          },
        ],
      },
    ],
  };

  const res2 = validateTranscriptDraft(invalidDraft, MOCK_DIRECTORY);
  console.log(`✓ Multi-issue detection test: valid=${res2.valid}, issues detected=${res2.issues.length}`);
  if (res2.valid || res2.issues.length < 4) {
    console.error("Issues found:", res2.issues);
    throw new Error("Expected at least 4 distinct business issues");
  }

  console.log("--- ALL BUSINESS VALIDATION TESTS PASSED SUCCESSFULLY! ---\n");
}

runValidationTests();
