import { NextResponse } from "next/server";
import { consumeToolRequest, recordToolUsage } from "@/lib/toolAccess";

const MAX_PDF_BYTES = 5 * 1024 * 1024;
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/["'`]/g, "")
    .replace(/[{}[\]]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}

export async function POST(request) {
  try {
  const accessResult = await consumeToolRequest(request, "resume-helper");

  if (accessResult.errorResponse) {
    return accessResult.errorResponse;
  }

  const formData = await request.formData();

  const resume = formData.get("resume");

  if (!(resume instanceof File)) {
    return NextResponse.json(
      { error: "Please upload a PDF resume." },
      { status: 400 },
    );
  }

  if (resume.size > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: "Resume PDF must be 5MB or smaller." },
      { status: 400 },
    );
  }

  const pdf = require("pdf-parse/lib/pdf-parse");

  let safeResumeText = "";

  try {
    const arrayBuffer = await resume.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (!buffer.subarray(0, 4).equals(PDF_MAGIC)) {
      return NextResponse.json(
        { error: "Invalid PDF file." },
        { status: 400 },
      );
    }
    const parsed = await pdf(buffer);
    safeResumeText = sanitizeInput(parsed.text.slice(0, 40_000));
  } catch (error) {
    console.error("resume pdf parse failed", error);
    return NextResponse.json(
      { error: "Could not read that PDF. Please upload a valid resume PDF." },
      { status: 400 },
    );
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
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.5, // Lower temperature for professional consistency
        max_completion_tokens: 4096, 
        reasoning_effort: "high",

        messages: [
          {
            role: "system",
            content: `
                You are a resume reviewer for software engineering internship applications.

Analyze the provided resume text and evaluate its quality.

Return your response as ONE JSON object with this exact structure ONLY:
{
  "score": number (0–100),
  "strengths": [
    "Concise bullet describing a specific strength",
    "Concise bullet describing another strength"
  ],
  "improvements": [
    "Specific, actionable suggestion to improve the resume",
    "Specific, actionable suggestion to improve the resume",
    "Specific, actionable suggestion to improve the resume"
  ]
}

Rules:
- 3 strengths and 5 improvements exactly.
- Output STRICT JSON only. No extra text, no markdown.
- Do not rewrite the resume.
- Do not invent skills or experience.
- Be honest and constructive.
- Avoid vague advice; every bullet must be concrete and actionable.

`,
          },
          {
            role: "user",
            content: `

Resume:
${safeResumeText}
  `,
          },
        ],
      }),
      },
    );
  } catch (err) {
    console.error("groq resume-helper fetch failed", err);
    return NextResponse.json(
      { error: "Could not reach the resume service. Please try again." },
      { status: 502 },
    );
  }

  let data;
  try {
    data = await groqResponse.json();
  } catch {
    console.error("groq resume-helper: invalid json response");
    return NextResponse.json(
      { error: "The resume service returned an invalid response. Try again." },
      { status: 502 },
    );
  }

  if (!groqResponse.ok) {
    console.error("groq resume-helper error", groqResponse.status, data);
    return NextResponse.json(
      { error: "The resume service is unavailable right now. Please try again." },
      { status: 502 },
    );
  }

  const contentString = data?.choices?.[0]?.message?.content;
  if (!contentString) {
    return NextResponse.json(
      { error: "The resume service returned no content." },
      { status: 502 },
    );
  }
  let result;
  try {
    result = JSON.parse(contentString);
  } catch {
    return NextResponse.json(
      { error: "The resume service returned invalid JSON." },
      { status: 502 },
    );
  }

  const newUsage = await recordToolUsage(request, "resume-helper");

  return NextResponse.json({
    result,
    meta: { rateLimit: newUsage ?? accessResult.usage },
  });
  } catch (err) {
    console.error("resume-helper uncaught error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
