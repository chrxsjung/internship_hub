"use client";

import HomeButton from "@/components/HomeButton";
import ProjectIdeaButton from "@/components/ProjectIdeaButton";
export default function IdeaExample() {
  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-start pt-40">
      <h1 className="text-5xl font-bold text-center">Example Project Idea</h1>
      <p className="mt-4 text-xl text-center">
        Try to make your answers similar to this. Being super duper specific
        helps od.
      </p>

      <div className="w-full max-w-md">
        <HomeButton />
        <ProjectIdeaButton />

        <div className="mt-10 flex flex-col gap-5">
          <div className="flex flex-col">
            <span className="font-medium">Experience Level</span>
            <div className="mt-2 p-3 border border-gray-300 rounded bg-gray-100 text-gray-800">
              Beginner – Intermediate
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-medium">Preferred Language(s)</span>
            <div className="mt-2 p-3 border border-gray-300 rounded bg-gray-100 text-gray-800">
              JavaScript, Python
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-medium">Area of Interest</span>
            <div className="mt-2 p-3 border border-gray-300 rounded bg-gray-100 text-gray-800">
              Full Stack (APIs + database + UI)
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-medium">Size / Scope of Project</span>
            <div className="mt-2 p-3 border border-gray-300 rounded bg-gray-100 text-gray-800">
              Medium (core features + 1–2 stretch goals)
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-medium">Time Commitment</span>
            <div className="mt-2 p-3 border border-gray-300 rounded bg-gray-100 text-gray-800">
              1 month (2 hrs/day on weekdays, 4 hrs/day on weekends)
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-medium">Budget</span>
            <div className="mt-2 p-3 border border-gray-300 rounded bg-gray-100 text-gray-800">
              $0–$20 (free tier hosting + free APIs if possible)
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-medium">Additional Info (Be specific!)</span>
            <div className="mt-2 p-3 border border-gray-300 rounded bg-gray-100 text-gray-800 whitespace-pre-wrap mb-12">
              I want a project that stands out on my resume and demonstrates
              real-world full-stack skills: authentication, database modeling,
              API design, and a clean UI. I’m interested in fitness and want
              something I’d actually use weekly. I also want to show I can build
              features end-to-end and write good README/docs.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
