import { NextResponse } from "next/server";
import { consumeToolRequest } from "@/lib/toolAccess";

const MAX_PDF_BYTES = 5 * 1024 * 1024;

export async function POST(request) {
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

  if (!resume.type.toLowerCase().includes("pdf")) {
    return NextResponse.json(
      { error: "Only PDF resumes are supported." },
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
    const parsed = await pdf(buffer);
    safeResumeText = parsed.text.slice(0, 40_000);
  } catch (error) {
    console.error("resume pdf parse failed", error);
    return NextResponse.json(
      { error: "Could not read that PDF. Please upload a valid resume PDF." },
      { status: 400 },
    );
  }

  const groqResponse = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        temperature: 1,
        max_completion_tokens: 8192,
        top_p: 1,
        reasoning_effort: "medium",
        stop: null,

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
    }
  );

  const data = await groqResponse.json();

  if (!groqResponse.ok) {
    console.error("groq resume-helper error", groqResponse.status, data);
    return NextResponse.json(
      { error: "The resume service is unavailable right now. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ...data,
    meta: {
      rateLimit: accessResult.usage,
    },
  });
}

//i want it to be about fitness and logging my workouts. i wanna be able to add my friends and compete
