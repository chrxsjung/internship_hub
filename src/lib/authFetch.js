import { getSupabaseClient } from "@/lib/supabaseClient";

export async function getAccessToken() {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export async function fetchWithAuth(input, init = {}) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Please sign in to use this tool.");
  }

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);

  return fetch(input, {
    ...init,
    headers,
  });
}

// safe json parse for responses; empty or invalid body causes clear error instead of "Unexpected end of JSON input"
export async function parseJsonResponse(res) {
  const text = await res.text();
  if (!text || !text.trim()) {
    throw new Error(
      `Server returned an empty response (${res.status}). Ensure GROQ_API_KEY and Supabase env vars are set, and Supabase migrations are run.`,
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Server returned invalid JSON (${res.status}): ${text.slice(0, 80)}...`);
  }
}
