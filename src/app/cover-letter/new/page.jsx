"use client";

import React, { useEffect, useRef, useState } from "react";
import HomeButton from "@/components/HomeButton";
import RequireAuth from "@/components/RequireAuth";
import { fetchWithAuth, parseJsonResponse } from "@/lib/authFetch";

export default function CoverLetter() {
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobDescLength, setJobDescLength] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [usageMessage, setUsageMessage] = useState("");
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
    setLoading(true);
    setErrorMessage("");
    setUsageMessage("");

    try {
      const formData = new FormData(e.target);
      const res = await fetchWithAuth("/api/groq/cover-letter", {
        method: "POST",
        body: formData,
      });

      const payload = await parseJsonResponse(res);

      if (!res.ok) {
        const err = payload?.error;
        const msg = typeof err === "string" ? err : err?.message ?? `Request failed (${res.status})`;
        throw new Error(msg);
      }

      if (payload?.meta?.rateLimit) {
        setUsageMessage(
          `${payload.meta.rateLimit.remaining} cover letter requests remaining today.`,
        );
      }

      if (payload?.result) {
        setResult(payload.result);
      } else {
        const err = payload?.error;
        const msg = typeof err === "string" ? err : err?.message ?? "Unexpected response from the server.";
        throw new Error(msg);
      }
    } catch (error) {
      const msg = error?.message;
      setErrorMessage(
        typeof msg === "string" && msg !== "[object Object]" ? msg : "Error generating cover letter.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <main className="min-h-screen p-6 flex flex-col items-center justify-start pt-40">
        <HomeButton />

        <h1 className="text-5xl font-bold text-center">Cover Letter Generator</h1>
        <p className="mt-4 text-xl text-center">
          Generate a tailored cover letter for your internship applications.
        </p>
        <p className="mt-3 text-sm text-slate-400">
          free plan: 3 cover letter requests per day
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

          <label className="flex flex-col relative">
            <span className="font-medium">Job Description <span className="text-slate-400 font-normal">(max 3,999 chars)</span></span>
            <textarea
              required
              name="jobDescription"
              maxLength={3999}
              onInput={(e) => setJobDescLength(e.target.value.length)}
              className="mt-2 p-2 border border-gray-300 rounded h-36 resize-none pr-12"
              placeholder="Paste job description here!"
            />
            <span className="absolute bottom-2 right-3 text-xs text-slate-500">
              {Math.min(jobDescLength, 3999)}/3999
            </span>
          </label>

          {errorMessage && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </p>
          )}

          {usageMessage && (
            <p className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-200">
              {usageMessage}
            </p>
          )}

          <button
            form="newCoverLetterForm"
            type="submit"
            disabled={loading}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate Cover Letter"}
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
    </RequireAuth>
  );
}
