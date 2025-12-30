import { NextResponse } from "next/server";

//todo: Make sure my users arent bitches and make input suepr large.

//use pdf parse

export async function POST(request) {
  const formData = await request.formData();

  const jobDescriptions = formData.get("jobDescription");
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
  return NextResponse.json(data);
}

//i want it to be about fitness and logging my workouts. i wanna be able to add my friends and compete
