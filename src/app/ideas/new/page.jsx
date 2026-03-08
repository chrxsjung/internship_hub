"use client";

import React, { useEffect, useRef, useState } from "react";
import HomeButton from "@/components/HomeButton";
import ViewProjectFormExample from "@/components/ViewProjectFormExample";
import RequireAuth from "@/components/RequireAuth";
import { fetchWithAuth, parseJsonResponse } from "@/lib/authFetch";

export default function NewIdea() {
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [lengths, setLengths] = useState({
    experienceLevel: 0,
    languages: 0,
    AOI: 0,
    scope: 0,
    timeCommitment: 0,
    budget: 0,
    additionalInfo: 0,
  });
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
      const data = Object.fromEntries(formData.entries());
      const res = await fetchWithAuth("/api/groq/project-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload = await parseJsonResponse(res);

      if (!res.ok) {
        const err = payload?.error;
        const msg = typeof err === "string" ? err : err?.message ?? `Request failed (${res.status})`;
        throw new Error(msg);
      }

      if (payload?.meta?.rateLimit) {
        setUsageMessage(
          `${payload.meta.rateLimit.remaining} project idea requests remaining today.`,
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
        typeof msg === "string" && msg !== "[object Object]" ? msg : "Error generating project idea.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
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
        <p className="mt-3 text-sm text-slate-400">
          free plan: 3 project idea requests per day
        </p>

        <form
          onSubmit={handleSubmit}
          id="newIdeaForm"
          className="mt-8 flex flex-col gap-4 w-full max-w-md"
        >
          <label className="flex flex-col relative">
            <span className="font-medium">Experience Level <span className="text-slate-400 font-normal">(max 100 chars)</span></span>
            <input
              required
              type="text"
              name="experienceLevel"
              maxLength={100}
              onInput={(e) => setLengths((p) => ({ ...p, experienceLevel: e.target.value.length }))}
              className="mt-2 p-2 border border-gray-300 rounded pr-12"
              placeholder="e.g., How much experience do you have?"
            />
            <span className="absolute bottom-2 right-3 text-xs text-slate-500">{Math.min(lengths.experienceLevel, 100)}/100</span>
          </label>

          <label className="flex flex-col relative">
            <span className="font-medium">Preferred Language(s) <span className="text-slate-400 font-normal">(max 100 chars)</span></span>
            <input
              required
              type="text"
              name="languages"
              maxLength={100}
              onInput={(e) => setLengths((p) => ({ ...p, languages: e.target.value.length }))}
              className="mt-2 p-2 border border-gray-300 rounded pr-12"
              placeholder="e.g., JavaScript, Python, etc."
            />
            <span className="absolute bottom-2 right-3 text-xs text-slate-500">{Math.min(lengths.languages, 100)}/100</span>
          </label>

          <label className="flex flex-col relative">
            <span className="font-medium">Area of Interest <span className="text-slate-400 font-normal">(max 100 chars)</span></span>
            <input
              required
              type="text"
              name="AOI"
              maxLength={100}
              onInput={(e) => setLengths((p) => ({ ...p, AOI: e.target.value.length }))}
              className="mt-2 p-2 border border-gray-300 rounded pr-12"
              placeholder="e.g., Full Stack, AI/ML, Mobile, etc."
            />
            <span className="absolute bottom-2 right-3 text-xs text-slate-500">{Math.min(lengths.AOI, 100)}/100</span>
          </label>

          <label className="flex flex-col relative">
            <span className="font-medium">Size/Scope of Project <span className="text-slate-400 font-normal">(max 100 chars)</span></span>
            <input
              required
              type="text"
              name="scope"
              maxLength={100}
              onInput={(e) => setLengths((p) => ({ ...p, scope: e.target.value.length }))}
              className="mt-2 p-2 border border-gray-300 rounded pr-12"
              placeholder="e.g., Small, Medium, Large."
            />
            <span className="absolute bottom-2 right-3 text-xs text-slate-500">{Math.min(lengths.scope, 100)}/100</span>
          </label>

          <label className="flex flex-col relative">
            <span className="font-medium">Time Commitment <span className="text-slate-400 font-normal">(max 100 chars)</span></span>
            <input
              required
              type="text"
              name="timeCommitment"
              maxLength={100}
              onInput={(e) => setLengths((p) => ({ ...p, timeCommitment: e.target.value.length }))}
              className="mt-2 p-2 border border-gray-300 rounded pr-12"
              placeholder="e.g., How long do you have for this project."
            />
            <span className="absolute bottom-2 right-3 text-xs text-slate-500">{Math.min(lengths.timeCommitment, 100)}/100</span>
          </label>

          <label className="flex flex-col relative">
            <span className="font-medium">Budget <span className="text-slate-400 font-normal">(max 100 chars)</span></span>
            <input
              required
              type="text"
              name="budget"
              maxLength={100}
              onInput={(e) => setLengths((p) => ({ ...p, budget: e.target.value.length }))}
              className="mt-2 p-2 border border-gray-300 rounded pr-12"
              placeholder="e.g., What is your budget for APIs, hosting, etc.?"
            />
            <span className="absolute bottom-2 right-3 text-xs text-slate-500">{Math.min(lengths.budget, 100)}/100</span>
          </label>

          <label className="flex flex-col relative">
            <span className="font-medium">Additional Info (Be specific!) <span className="text-slate-400 font-normal">(max 400 chars)</span></span>
            <textarea
              required
              name="additionalInfo"
              maxLength={400}
              onInput={(e) => setLengths((p) => ({ ...p, additionalInfo: e.target.value.length }))}
              className="mt-2 p-2 border border-gray-300 rounded h-36 resize-none pr-12"
              placeholder="e.g., Just yap about what you want to accomplish in this project. What do you want to learn? What hobbies and passions do you have that would motivate you to finish this project?"
            />
            <span className="absolute bottom-2 right-3 text-xs text-slate-500">{Math.min(lengths.additionalInfo, 400)}/400</span>
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
            form="newIdeaForm"
            type="submit"
            disabled={loading}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate Idea"}
          </button>
        </form>



        {result?.projects?.[0] && (
          <div className="flex flex-col justify-center items-center w-full">
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

              {result.projects[0].tech_stack?.length > 0 && (
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
              )}

              {result.projects[0].roadmap && (
                <div className="mb-4">
                  <h3 className="text-black text-xl">
                    Now that you have an actionable idea, go ahead and start coding!
                  </h3>
                  <h3 className="text-lg font-semibold mb-3 text-black mt-4">
                    Roadmap ({result.projects[0].roadmap.weeks} weeks)
                  </h3>
                  {result.projects[0].roadmap.milestones?.length > 0 && (
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
                            {weekGroup.goals?.length > 0 && (
                              <ul className="list-disc list-inside space-y-1">
                                {weekGroup.goals.map((bulletPt, bulletIndex) => (
                                  <li key={bulletIndex} className="text-gray-600">
                                    {bulletPt}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </RequireAuth>
  );
}
