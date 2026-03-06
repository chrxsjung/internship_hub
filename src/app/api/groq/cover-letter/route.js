import { NextResponse } from "next/server";
import { consumeToolRequest } from "@/lib/toolAccess";

const MAX_PDF_BYTES = 5 * 1024 * 1024;
const MAX_JOB_DESCRIPTION_CHARS = 4000;

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
  const accessResult = await consumeToolRequest(request, "cover-letter");

  if (accessResult.errorResponse) {
    return accessResult.errorResponse;
  }

  const formData = await request.formData();

  let jobDescriptions = formData.get("jobDescription");

  if (typeof jobDescriptions !== "string" || !jobDescriptions.trim()) {
    return NextResponse.json(
      { error: "Please paste a job description." },
      { status: 400 },
    );
  }

  if (jobDescriptions.length > MAX_JOB_DESCRIPTION_CHARS) {
    return NextResponse.json(
      { error: "Job description must be 4000 characters or less." },
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

  //so make resume file binary cojntents into a buffer to send to parse pdf then that turns into text

  //make resume into arraybuffer Buffer built in node js then i would Buffer from arraybuffer and sand that to pdf-parse
  const pdf = require("pdf-parse/lib/pdf-parse");

  let safeResumeText = "";

  try {
    const arrayBuffer = await resume.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsed = await pdf(buffer);
    safeResumeText = parsed.text.slice(0, 40_000);
  } catch (error) {
    console.error("cover letter pdf parse failed", error);
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
    }
  );

  const data = await groqResponse.json();

  if (!groqResponse.ok) {
    console.error("groq cover-letter error", groqResponse.status, data);
    return NextResponse.json(
      { error: "The cover letter service is unavailable right now. Please try again." },
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
