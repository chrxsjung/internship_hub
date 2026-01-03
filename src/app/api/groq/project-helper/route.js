import { NextResponse } from "next/server";

//todo: Make sure my users arent bitches and make input suepr large.

// Should i either limit size of input or make it dropdown and select bassed.

//so limit input size to like 300 chars for additrional, etc.
// later do something about spamming. maybe users can only do 3 a day. unless they zelle me money lol





//sanitize here once and paste it everywhere. 

//lets sanitize first then rate limit since rate limiting is harder i think 

export async function POST(request) {
const input = await request.json();

const MAX_CHARS = 400;
const MAX_EVERYTHING_ELSE = 100;

for (const [key, value] of Object.entries(input)) {
    if (key === "additionalInfo" && typeof value === "string" && value.length > MAX_CHARS) {
    return NextResponse.json(
        { error: `Field "${key}" is too large (max ${MAX_CHARS} chars)` },
        { status: 400 }
    );
    }
    else if (key !== "additionalInfo" && typeof value === "string" && value.length > MAX_EVERYTHING_ELSE) {
    return NextResponse.json(
        { error: `Field "${key}" is too large (max ${MAX_EVERYTHING_ELSE} chars)` },
        { status: 400 }
    );
    }
    
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
    }
);

const data = await groqResponse.json();
return NextResponse.json(data);
}

//i want it to be about fitness and logging my workouts. i wanna be able to add my friends and compete