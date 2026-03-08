import { NextResponse } from "next/server";
import { consumeToolRequest, recordToolUsage } from "@/lib/toolAccess";

const MAX_PDF_BYTES = 5 * 1024 * 1024;
const MAX_JOB_DESCRIPTION_CHARS = 3999;
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

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

export async function POST(request) {
  try {
  const accessResult = await consumeToolRequest(request, "cover-letter");

  if (accessResult.errorResponse) {
    return accessResult.errorResponse;
  }

  const formData = await request.formData();

  let jobDescriptions = formData.get("jobDescription");

  // formdata sends textarea newlines as \r\n; normalize to \n
  if (typeof jobDescriptions === "string") {
    jobDescriptions = jobDescriptions.replace(/\r\n/g, "\n");
  }

  if (typeof jobDescriptions !== "string" || !jobDescriptions.trim()) {
    return NextResponse.json(
      { error: "Please paste a job description." },
      { status: 400 },
    );
  }

  if (jobDescriptions.length > MAX_JOB_DESCRIPTION_CHARS) {
    return NextResponse.json(
      { error: "Job description must be 3999 characters or less." },
      { status: 400 },
    );
  }

  jobDescriptions = sanitizeInput(jobDescriptions);
  const resume = formData.get("resume"); // this is a File, not text

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
    console.error("cover letter pdf parse failed", error);
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
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        response_format: { type: "json_object" },
        temperature: 0.8, // Slight variety for creative hooks
        max_completion_tokens: 2048,
        top_p: 1,

        messages: [
          {
            role: "system",
            content: `
                You generate short, professional cover letters for internship applications using ONLY the provided resume and job description.

                Some people will copy paste the job description, and sometimes they will have unnessary info. Focus ONLY on the relevant parts of the job description. 

Requirements:
- Base the content strictly on the user’s resume and the job description.
- Do NOT invent skills, experience, or achievements.
- Do NOT include information that is not explicitly present in the resume.
- Keep the cover letter concise and focused.

Formatting:
- Limit the cover letter to 3 short paragraphs.
- Ensure it fits on a single page.
- Use a professional, straightforward tone.
- Avoid fluff, repetition, and overly generic statements.
End the cover letter with a professional closing (for example: "Sincerely," "Best regards," or "Kind regards,") followed by a placeholder for the applicant’s name.

Respond ONLY in valid JSON with the following structure:
{
  "cover_letter": "The complete cover letter text here."
}

`,
          },
          {
            role: "user",
            content: `
Job Description:
${jobDescriptions}

Resume:
${safeResumeText}
  `,
          },
        ],
      }),
      },
    );
  } catch (err) {
    console.error("groq cover-letter fetch failed", err);
    return NextResponse.json(
      { error: "Could not reach the cover letter service. Please try again." },
      { status: 502 },
    );
  }

  let data;
  try {
    data = await groqResponse.json();
  } catch {
    console.error("groq cover-letter: invalid json response");
    return NextResponse.json(
      { error: "The cover letter service returned an invalid response. Try again." },
      { status: 502 },
    );
  }

  if (!groqResponse.ok) {
    console.error("groq cover-letter error", groqResponse.status, data);
    return NextResponse.json(
      { error: "The cover letter service is unavailable right now. Please try again." },
      { status: 502 },
    );
  }

  const contentString = data?.choices?.[0]?.message?.content;
  if (!contentString) {
    return NextResponse.json(
      { error: "The cover letter service returned an empty result. Try again." },
      { status: 502 },
    );
  }

  let result;
  try {
    result = JSON.parse(contentString);
  } catch {
    return NextResponse.json(
      { error: "The cover letter service returned malformed output. Try again." },
      { status: 502 },
    );
  }

  const newUsage = await recordToolUsage(request, "cover-letter");

  return NextResponse.json({
    result,
    meta: {
      rateLimit: newUsage ?? accessResult.usage,
    },
  });
  } catch (err) {
    console.error("cover-letter uncaught error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
