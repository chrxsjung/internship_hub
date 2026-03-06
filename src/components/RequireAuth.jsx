"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getSupabaseClient,
  hasSupabaseConfig,
  missingConfigMessage,
} from "@/lib/supabaseClient";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState(() =>
    hasSupabaseConfig() ? "loading" : "missing-config",
  );

  useEffect(() => {
    let mounted = true;
    let subscription = null;

    if (!hasSupabaseConfig()) {
      return;
    }

    const supabase = getSupabaseClient();

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        router.replace("/");
        return;
      }

      if (!session.user.email_confirmed_at) {
        router.replace("/");
        return;
      }

      setStatus("ready");
    }

    checkSession();

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/");
        return;
      }

      if (!session.user.email_confirmed_at) {
        router.replace("/");
        return;
      }

      if (mounted) {
        setStatus("ready");
      }
    });

    subscription = authListener.data.subscription;

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router, pathname]);

  if (status === "missing-config") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-center text-red-200 shadow-xl">
          {missingConfigMessage}
        </div>
      </main>
    );
  }

  if (status !== "ready") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-5 text-center text-slate-200 shadow-xl">
          Checking your account...
        </div>
      </main>
    );
  }

  return children;
}
