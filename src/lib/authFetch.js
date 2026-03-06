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
