"use client";

import React, { useEffect, useRef, useState } from "react";
import HomeButton from "@/components/HomeButton";
import RequireAuth from "@/components/RequireAuth";
import { fetchWithAuth, parseJsonResponse } from "@/lib/authFetch";

export default function ResumeOptimization() {
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
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
      const res = await fetchWithAuth("/api/groq/resume-helper", {
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
          `${payload.meta.rateLimit.remaining} resume requests remaining today.`,
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
        typeof msg === "string" && msg !== "[object Object]" ? msg : "Error generating resume optimization.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <main className="min-h-screen p-6 flex flex-col items-center justify-start pt-40">
        <HomeButton />

        <h1 className="text-5xl font-bold">Is your resume buns?</h1>
        <p className="mt-4 text-xl">Find out instantly with this tool.</p>
        <p className="mt-2 text-xl">
          tips for ATS optimization, keyword enhancement, formatting, etc.
        </p>
        <p className="mt-3 text-sm text-slate-400">
          free plan: 3 resume requests per day
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
            {loading ? "Generating..." : "Generate Resume Optimization"}
          </button>
        </form>

        <div className="mt-12 max-w-xl border border-blue-200 rounded-lg p-8  bg-white">
          <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
            Tips for a Goated Resume
          </h2>

          <ul className="space-y-4">
            <li className="flex gap-3 text-left">
              <span className="text-blue-600 font-bold text-xl leading-none">
                ✓
              </span>
              <span className="text-gray-700">
                Use action verbs to describe your experiences.
              </span>
            </li>
            <li className="flex gap-3 text-left">
              <span className="text-blue-600 font-bold text-xl leading-none">
                ✓
              </span>
              <span className="text-gray-700">
                Quantify your achievements with numbers!!!
              </span>
            </li>

            <li className="flex gap-3 text-left">
              <span className="text-blue-600 font-bold text-xl leading-none">
                ✓
              </span>
              <span className="text-gray-700">
                Include relevant keywords from the job description naturally
                throughout your resume.
              </span>
            </li>

            <li className="flex gap-3 text-left">
              <span className="text-blue-600 font-bold text-xl leading-none">
                ✓
              </span>
              <span className="text-gray-700">
                Use{" "}
                <a
                  href="https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Jake&apos;s resume template on Overleaf
                </a>{" "}
                as layout.
              </span>
            </li>
            <li className="flex gap-3 text-left">
              <span className="text-blue-600 font-bold text-xl leading-none">
                ✓
              </span>
              <span className="text-gray-700">
                Save it as a PDF and name it{" "}
                <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                  FirstNameLastName_Resume.pdf
                </span>
              </span>
            </li>
          </ul>
        </div>

        {result && result.score && result.strengths && result.improvements && (
          <div className="flex flex-col justify-center  items-center w-full">
            <div
              ref={resultRef}
              className="mt-10 w-full max-w-2xl p-6 border rounded-lg shadow-lg bg-white"
            >
              <h2 className="text-3xl font-bold mb-4 text-blue-600">
                Score : {result.score}
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-green-600">
                  Strengths
                </h3>

                <ul className="list-disc list-inside space-y-1">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-red-600">
                  Improvements
                </h3>

                <ul className="list-disc list-inside space-y-1">
                  {result.improvements.map((improvement, index) => (
                    <li key={index} className="text-gray-700">
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </RequireAuth>
  );
}
