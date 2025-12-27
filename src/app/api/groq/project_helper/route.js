    import { NextResponse } from "next/server";



    //todo: Make sure my users arent bitches and make input suepr large. 
    //so limit input size to like 300 chars for additrional, etc. 
    // later do something about spamming. maybe users can only do 3 a day. unless they zelle me money lol 











    export async function POST(request) {
    const input = await request.json();

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
                        You generate side project ideas for Computer Science students building
                        portfolios for SWE internships.

                        Requirements:
                        - Output EXACTLY 3 unique project ideas
                        - You MUST base the ideas strictly on the user's preferences
                        - Keep the scope practical and internship-relevant

                        For EACH project, format the output clearly using Markdown:
                        1. Project title as a bold heading
                        2. A 2–3 sentence description
                        3. A clearly labeled "Roadmap (x Weeks)" section
                        4. A table or bullet list showing weekly or bi-weekly milestones

                        Formatting rules:
                        - Use headings, bullet points, and tables where appropriate
                        - Keep spacing clean and readable
                        - Do NOT use emojis
                        - Do NOT include explanations outside the project content

                        The output should be easy to read in a web UI.
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
