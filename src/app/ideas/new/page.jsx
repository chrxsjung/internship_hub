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
      const res = await fetch("/api/groq/project_helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const result = await res.json();
      //what to do with this json
      //send this to another page?

      setResult(result.choices[0].message.content);
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
      {result && (
        <div
          ref={resultRef}
          className="mt-10 w-full max-w-md p-4 border rounded"
        >
          <h2 className="text-xl font-bold mb-2">Generated Project Idea</h2>
          <div className="prose">
            <pre className="whitespace-pre-wrap">{result}</pre>
            {/* todo: result is json. parse it and display it better */}
          </div>
        </div>
      )}
    </main>
  );
}
