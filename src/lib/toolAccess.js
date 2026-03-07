import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DAILY_LIMIT = 3;

function createAuthedClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Please sign in and verify your email to use this tool." },
    { status: 401 },
  );
}

export async function requireVerifiedUser(request) {
  const authHeader = request.headers.get("authorization") || "";
  const accessToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!accessToken) {
    return { errorResponse: unauthorizedResponse() };
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      errorResponse: NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 },
      ),
    };
  }

  const supabase = createAuthedClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return { errorResponse: unauthorizedResponse() };
  }

  if (!user.email_confirmed_at) {
    return {
      errorResponse: NextResponse.json(
        { error: "Please verify your email before using the tools." },
        { status: 403 },
      ),
    };
  }

  return { supabase, user };
}

export async function consumeToolRequest(request, tool) {
  let authResult;
  try {
    authResult = await requireVerifiedUser(request);
  } catch (err) {
    console.error("requireVerifiedUser failed", err);
    return {
      errorResponse: NextResponse.json(
        { error: "Auth failed. Check Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)." },
        { status: 500 },
      ),
    };
  }

  if (authResult.errorResponse) {
    return authResult;
  }

  const { supabase, user } = authResult;
  let data, error;
  try {
    const result = await supabase.rpc("increment_daily_tool_usage", {
      p_tool: tool,
    });
    data = result.data;
    error = result.error;
  } catch (err) {
    console.error("supabase rpc increment_daily_tool_usage failed", err);
    return {
      errorResponse: NextResponse.json(
        { error: "Could not verify usage limit. Run Supabase migrations (increment_daily_tool_usage RPC)." },
        { status: 500 },
      ),
    };
  }

  if (error) {
    console.error("tool usage rpc failed", error);
    return {
      errorResponse: NextResponse.json(
        { error: "Could not verify your daily usage limit." },
        { status: 500 },
      ),
    };
  }

  const usage = Array.isArray(data) ? data[0] : data;

  if (!usage?.allowed) {
    return {
      errorResponse: NextResponse.json(
        {
          error: `You have used all ${DAILY_LIMIT} requests for this tool today.`,
          tool,
          used: usage?.used ?? DAILY_LIMIT,
          remaining: usage?.remaining ?? 0,
        },
        { status: 429 },
      ),
    };
  }

  return { supabase, user, usage };
}
