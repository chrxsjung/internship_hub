import { NextResponse } from "next/server";

//todo: Make sure my users arent bitches and make input suepr large.

//use pdf parse

export async function POST(request) {
  const formData = await request.formData();

  const resume = formData.get("resume"); // this is a File, not text

  //so make resume file binary cojntents into a buffer to send to parse pdf then that turns into text

  //make resume into arraybuffer Buffer built in node js then i would Buffer from arraybuffer and sand that to pdf-parse
  const pdf = require("pdf-parse/lib/pdf-parse");

  const arrayBuffer = await resume.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const parsed = await pdf(buffer);
  const safeResumeText = parsed.text.slice(0, 40_000);

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
  return NextResponse.json(data);
}

//i want it to be about fitness and logging my workouts. i wanna be able to add my friends and compete
