"use client";

import { useState } from "react";
import React from "react";
import HomeButton from "@/components/HomeButton";
import ViewProjectFormExample from "@/components/ViewProjectFormExample";
import { useRef, useEffect } from "react";

//do i check for html Santiation or should i make forms dropdown or whadafuck

export default function NewIdea() {
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (result && resultRef.current) {
      //if result existrs and rtef exists, ref is the result div so scroll to it when both exists type shit
      resultRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //call api/groq/project_helper.js with data
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      //turn this into json then send to my api route then send to real groq
      const res = await fetch("/api/groq/project-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const result = await res.json();
      //what to do with this json
      //send this to another page?

      const contentString = result.choices[0].message.content;
      const parsedContent = JSON.parse(contentString);
      setResult(parsedContent);
    } catch (error) {
      console.error("Error generating project idea:", error?.message);
    }
  };

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-start pt-40">
      <HomeButton />
      <ViewProjectFormExample />

      <h1 className="text-5xl font-bold text-center">
        Side Project Inspiration
      </h1>
      <p className="mt-4 text-xl text-center">
        Fill out all these fields and instantly get a side project idea you can
        work on TODAY!!
      </p>

      <form
        onSubmit={handleSubmit}
        id="newIdeaForm"
        className="mt-8 flex flex-col gap-4 w-full max-w-md"
      >
        <label className="flex flex-col">
          Experience Level
          <input
            required
            type="text"
            name="experienceLevel"
            className="mt-2 p-2 border border-gray-300 rounded"
            placeholder="e.g., How much experience do you have?"
          />
        </label>

        <label className="flex flex-col">
          Preferred Language(s):
          <input
            required
            type="text"
            name="languages"
            className="mt-2 p-2 border border-gray-300 rounded"
            placeholder="e.g., JavaScript, Python, etc."
          />
        </label>

        <label className="flex flex-col">
          Area of Interest:
          <input
            required
            type="text"
            name="AOI"
            className="mt-2 p-2 border border-gray-300 rounded"
            placeholder="e.g., Full Stack, AI/ML, Mobile, etc."
          />
        </label>

        <label className="flex flex-col">
          Size/Scope of Project:
          <input
            required
            type="text"
            name="scope"
            className="mt-2 p-2 border border-gray-300 rounded"
            placeholder="e.g., Small, Medium, Large."
          />
        </label>

        <label className="flex flex-col">
          Time Commitment
          <input
            required
            type="text"
            name="timeCommitment"
            className="mt-2 p-2 border border-gray-300 rounded"
            placeholder="e.g., How long do you have for this project."
          />
        </label>

        <label className="flex flex-col">
          Budget
          <input
            required
            type="text"
            name="budget"
            className="mt-2 p-2 border border-gray-300 rounded"
            placeholder="e.g., What is your budget for APIs, hosting, etc.?"
          />
        </label>

        <label className="flex flex-col">
          Additional Info (Be specific!):
          <textarea
            required
            name="additionalInfo"
            className="mt-2 p-2 border border-gray-300 rounded h-36 resize-none"
            placeholder="e.g., Just yap about what you want to accomplish in this project. What do you want to learn? What hobbies and passions do you have that would motivate you to finish this project?"
          />
        </label>
        <button
          form="newIdeaForm"
          type="submit"
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          Generate Idea
        </button>
      </form>


    {/*     instead of this, maybe do something like "more detailed roadmap" then resend api call and make it a "pro plan" or some shit idk (research more about that) 
    or just fix it by allowing to press more detailed ONCE and then button gets gray. do this using usestate

    I think rather than "pro planm" for now just rate limit to 3 ideas per day, then 3 detailed per day as well. do this by rate limiting 
      <div className="mt-8 mb-24">  
        <h2 className="text-xl w-lg text-center text-red-600 border">
          PSA:
          <br /> some people told me the roadmap isn&apos;t &quot;detailed&quot;
          enough. i think its a good structure. running into issues and thinking
          through while looking at google is a critical part of learning.
          <br />i need to take my own advice here lmaoo
        </h2>
      </div>
      */}


      {result && result.projects && result.projects[0] && (
        <div className="flex flex-col justify-center  items-center w-full">
          <div
            ref={resultRef}
            className="mt-10 w-full max-w-2xl p-6 border rounded-lg shadow-lg bg-white"
          >
            <h2 className="text-3xl font-bold mb-4 text-blue-600">
              {result.projects[0].title}
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-black">
                Description
              </h3>
              <p className="text-gray-700">{result.projects[0].description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-black">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.projects[0].tech_stack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-black text-xl">
                Now that you have an actionable idea, go ahead and start coding!{" "}
              </h3>
              <h3 className="text-lg font-semibold mb-3 text-black mt-4">
                Roadmap ({result.projects[0].roadmap.weeks} weeks)
              </h3>
              {/* go through each week group then go through goals in each week group and format it to list items */}
              <div className="space-y-4">
                {result.projects[0].roadmap.milestones.map(
                  (weekGroup, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {weekGroup.label}
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {weekGroup.goals.map((bulletPt, bulletIndex) => (
                          <li key={bulletIndex} className="text-gray-600">
                            {bulletPt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
