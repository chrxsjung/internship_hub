import { NextResponse } from "next/server";
import { consumeToolRequest, recordToolUsage } from "@/lib/toolAccess";
import { z } from "zod";

function sanitizeInput(input) {
  if (typeof input !== "string") {
    return input;
  }

  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/["'`]/g, "")
    .replace(/[{}[\]]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}

const projectIdeaSchema = z
  .object({
    experienceLevel: z.string().trim().min(1).max(100),
    languages: z.string().trim().min(1).max(100),
    AOI: z.string().trim().min(1).max(100),
    scope: z.string().trim().min(1).max(100),
    timeCommitment: z.string().trim().min(1).max(100),
    budget: z.string().trim().min(1).max(100),
    additionalInfo: z.string().trim().min(1).max(400),
  })
  .strict();

export async function POST(request) {
  try {
  const accessResult = await consumeToolRequest(request, "project-helper");

  if (accessResult.errorResponse) {
    return accessResult.errorResponse;
  }

  let rawInput;
  try {
    rawInput = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 },
    );
  }
  const parsedInput = projectIdeaSchema.safeParse(rawInput);

  if (!parsedInput.success) {
    return NextResponse.json(
      { error: "Please submit valid text values for all required fields." },
      { status: 400 },
    );
  }

  const input = {};
  for (const [key, value] of Object.entries(parsedInput.data)) {
    input[key] = sanitizeInput(value);
  }

  let groqResponse;
  try {
    groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-32b",
        response_format: { type: "json_object" },
        temperature: 0.9, // Higher for creative/unique project ideas
        max_completion_tokens: 8192,
        top_p: 0.95,

        messages: [
          {
            role: "system",
            content: `
                You generate side project ideas for Computer Science students building their portfolios for SWE internships.

                Requirements:
                - Output EXACTLY 1 unique project idea
                - You MUST base the idea STRICTLY on the user's preferences
                - Do NOT introduce domains, technologies, or topics outside the user's preferences
                - The project must be suitable as a SOLO internship project

                Output rules:
                - Return ONLY valid JSON
                - Do NOT include markdown, comments, explanations, or extra text
                - Do NOT wrap the output in code fences
                - The JSON MUST strictly match the schema below

                For the project, return the following structured fields:
                - id: short, unique, kebab-case string
                - title: string
                - description: string (2–3 sentences)
                - tech_stack: array of strings
                - roadmap:
                - weeks: number (based on the user's preferred project length)
                - milestones: array of objects, each with:
                    - label: string (e.g., "Week 1", "Weeks 3–4")
                    - goals: array of strings

                Schema (example shape; values are illustrative):
                {
                "projects": [
                    {
                    "id": "example-project-id",
                    "title": "Example Project Title",
                    "description": "A short 2–3 sentence description of the project.",
                    "tech_stack": ["Next.js", "PostgreSQL", "Tailwind CSS"],
                    "roadmap": {
                        "weeks": 4,
                        "milestones": [
                        {
                            "label": "Week 1",
                            "goals": ["Set up project", "Define schema"]
                        }
                        ]
                    }
                    }
                ]
                }

                Return exactly ONE project inside the projects array.


                        `,
          },
          {
            role: "user",
            content: `User preferences (JSON): ${JSON.stringify(input)}`,
          },
        ],
      }),
      },
    );
  } catch (err) {
    console.error("groq project-helper fetch failed", err);
    return NextResponse.json(
      { error: "Could not reach the project ideas service. Please try again." },
      { status: 502 },
    );
  }

  let data;
  try {
    data = await groqResponse.json();
  } catch {
    console.error("groq project-helper: invalid json response");
    return NextResponse.json(
      { error: "The project ideas service returned an invalid response. Try again." },
      { status: 502 },
    );
  }

  if (!groqResponse.ok) {
    console.error("groq project-helper error", groqResponse.status, data);
    return NextResponse.json(
      { error: "The project ideas service is unavailable right now. Please try again." },
      { status: 502 },
    );
  }

  const contentString = data?.choices?.[0]?.message?.content;
  if (!contentString) {
    return NextResponse.json(
      { error: "The project ideas service returned an empty result. Try again." },
      { status: 502 },
    );
  }

  let result;
  try {
    result = JSON.parse(contentString);
  } catch {
    return NextResponse.json(
      { error: "The project ideas service returned malformed output. Try again." },
      { status: 502 },
    );
  }

  const newUsage = await recordToolUsage(request, "project-helper");

  return NextResponse.json({
    result,
    meta: {
      rateLimit: newUsage ?? accessResult.usage,
    },
  });
  } catch (err) {
    console.error("project-helper uncaught error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
