"use client";

import { useState } from "react";
import React from "react";
import HomeButton from "@/components/HomeButton";
import ViewProjectFormExample from "@/components/ViewProjectFormExample";
import { useRef, useEffect } from "react";

//do i check for html Santiation or should i make forms dropdown or whadafuck

export default function CoverLetter() {
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const [uploaded, setUploaded] = useState(false);
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

      //turn this into json then send to my api route then send to real groq
      const res = await fetch("/api/groq/cover-letter", {
        method: "POST",
        //browser knows multipart and also since files juist do formdata 
        body: formData,
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

      <h1 className="text-5xl font-bold text-center">Cover Letter Generator</h1>
      <p className="mt-4 text-xl text-center">
        Generate a tailored cover letter for your internship applications.
      </p>

      <form
        onSubmit={handleSubmit}
        id="newCoverLetterForm"
        className="mt-8 flex flex-col gap-4 w-full max-w-md"
      >
        <label className="flex flex-col gap-1">
          <span className="font-medium flex items-center gap-2">
            Upload Resume as PDF
            {uploaded && <span className="text-green-600">✓</span>}
          </span>

          <input
            required
            type="file"
            name="resume"
            accept="application/pdf"
            onChange={(e) => setUploaded(!!e.target.files?.length)}

            className="mt-2 p-2 border border-gray-300 rounded"
          />
        </label>

         <label className="flex flex-col">
          Job Description 
          <textarea
            required
            name="jobDescription"
            className="mt-2 p-2 border border-gray-300 rounded h-36 resize-none"
            placeholder="Paste job description here!"
          />
        </label>

        <button
          form="newCoverLetterForm"
          type="submit"
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          Generate Cover Letter
        </button>
      </form>

      {result && result.cover_letter && (
        <div className="flex flex-col justify-center  items-center w-full">
          <div
            ref={resultRef}
            className="mt-10 w-full max-w-2xl p-6 border rounded-lg shadow-lg bg-white"
          >
            <h2 className="text-3xl font-bold mb-4 text-blue-600">
              Cover Letter
            </h2>

            <pre className="whitespace-pre-wrap text-gray-800">
              {result.cover_letter}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}
