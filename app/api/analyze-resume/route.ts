import "server-only";
import { NextRequest } from "next/server";

// NEXT_PUBLIC_BACKEND_URL = "http://localhost:9001/api"
// Do NOT use process.env.PORT — Next.js overrides that to its own dev port (3001).
const BACKEND_API = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9001/api").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const upstream = await fetch(`${BACKEND_API}/analyze-resume`, {
    method: "POST",
    body: formData,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
