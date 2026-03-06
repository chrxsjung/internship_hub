 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ToolCard from "@/components/ToolCard";
import ToolCardComingSoon from "@/components/ToolCardComingSoon";
import RequireAuth from "@/components/RequireAuth";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabaseClient";

const DAILY_LIMIT = 3;

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [usage, setUsage] = useState({
    "resume-helper": 0,
    "project-helper": 0,
    "cover-letter": 0,
  });

  useEffect(() => {
    async function loadUser() {
      if (!hasSupabaseConfig()) return;

      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? "");
    }

    loadUser();
  }, []);

  useEffect(() => {
    async function loadUsage() {
      if (!hasSupabaseConfig()) return;

      const supabase = getSupabaseClient();
      const { data } = await supabase.rpc("get_my_daily_tool_usage");

      if (data) {
        const next = {
          "resume-helper": 0,
          "project-helper": 0,
          "cover-letter": 0,
        };
        for (const row of data) {
          next[row.tool] = row.request_count ?? 0;
        }
        setUsage(next);
      }
    }

    loadUsage();
  }, []);

  const handleLogout = async () => {
    if (!hasSupabaseConfig()) {
      router.replace("/");
      return;
    }

    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/");
  };

  const remaining = (tool) => Math.max(0, DAILY_LIMIT - (usage[tool] ?? 0));

  return (
    <RequireAuth>
      <main className="relative min-h-screen pt-24 pb-6 px-6 flex flex-col items-center justify-center">
        <div className="absolute top-6 right-6">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
          >
            Log out
          </button>
        </div>

        <div className="w-full max-w-6xl">
          <div className="mb-12 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-300">
                Free tools for internship seekers
              </p>
              <h1 className="mt-3 text-5xl font-bold text-white">
                Internship Hub
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-300">
                Use your account to improve your resume, generate stronger side project ideas,
                and draft internship cover letters faster.
              </p>
              <p className="mt-3 text-sm text-slate-400">
                Signed in as {email || "your account"}.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-5 py-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Daily free limits</p>
              <p className="mt-2">{remaining("resume-helper")}/3 resume help remaining</p>
              <p>{remaining("project-helper")}/3 projects remaining</p>
              <p>{remaining("cover-letter")}/3 cover letters remaining</p>
              <p className="mt-2 text-xs text-slate-500">Resets every 24 hours</p>
            </div>
          </div>

          <div className="mt-10 flex gap-6 flex-row flex-wrap justify-center">
            <ToolCard
              link="/resume/new"
              title="Resume Optimization"
              description="See how well your resume is optimized for ATS and in general. Get immediate suggestions to improve it."
            />
            <ToolCard
              link="/ideas/new"
              title="Project Ideas Generator"
              description="Generate new project ideas to enhance your portfolio. Filters like languages, niche, time commitment, are available."
            />
            <ToolCard
              link="/cover-letter/new"
              title="Cover Letter Generator"
              description="Generate a strong cover letter draft based on your resume and the job description."
            />
            <ToolCardComingSoon
              link="/ideas/new"
              title="Company Specific Interview Qs"
              description="Company specific interview questions to help you prepare more effectively."
            />
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
