"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSupabaseClient,
  hasSupabaseConfig,
  missingConfigMessage,
} from "@/lib/supabaseClient";

export default function LandingPage() {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setErrorMessage(missingConfigMessage);
      return;
    }

    let mounted = true;
    const supabase = getSupabaseClient();

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted && session?.user?.email_confirmed_at) {
        router.replace("/home");
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email_confirmed_at) {
        router.replace("/home");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("verify") === "1") {
        setStatusMessage("Please verify your email before using the tools.");
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const supabase = getSupabaseClient();

      if (mode === "signup") {
        const redirectTarget =
          typeof window !== "undefined"
            ? `${window.location.origin}/home`
            : undefined;

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTarget,
          },
        });

        if (error) {
          throw error;
        }

        setStatusMessage(
          "Account created. Check your email and verify your account before logging in.",
        );
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/home");
    } catch (error) {
      const msg = error?.message ?? "";
      const msgLower = String(msg).toLowerCase();
      const isEmailAlreadyUsed =
        msgLower.includes("already") ||
        msgLower.includes("registered") ||
        msgLower.includes("exist") ||
        msgLower.includes("duplicate");
      const isEmailRelated =
        msgLower.includes("email") || msgLower.includes("user");
      const showEmailUsed = isEmailRelated && isEmailAlreadyUsed;

      setErrorMessage(
        showEmailUsed
          ? "Email is already used."
          : typeof msg === "string" && msg !== "[object Object]"
            ? msg
            : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 pt-32 pb-12 text-white">
      <section className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
            Free tools for internship seekers
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
              free tools for SWE internship seekers
            </h1>
            <p className="max-w-2xl text-lg text-slate-300">
              I made some free tools for people looking for internships. Hopefully they help you out!
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">tools included:</h2>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li>resume optimization</li>
              <li>side project idea generator</li>
              <li>cover letter generator</li>
            </ul>
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-slate-400">
              more to come!
            </p>
          </div>
        </div>

        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-6 flex rounded-2xl bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage("");
                setStatusMessage("");
              }}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
                setStatusMessage("");
              }}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Log in
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold">
              {mode === "signup" ? "Create your free account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {mode === "signup"
                ? "Sign up with email and password, then verify your email to unlock the tools."
                : "Log in to continue using your daily tool requests."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {statusMessage && (
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {statusMessage}
              </p>
            )}

            {errorMessage && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-blue-500 px-4 py-3 font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "signup"
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-300">
            <p>Included with every account:</p>
            <ul className="mt-3 space-y-2 text-slate-400">
              <li>3 resume optimization requests per day</li>
              <li>3 project idea requests per day</li>
              <li>3 cover letter requests per day</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
