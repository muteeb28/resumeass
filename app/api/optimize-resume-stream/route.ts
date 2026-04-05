import "server-only";
import { NextRequest } from "next/server";

const BACKEND_API = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9001/api").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const upstream = await fetch(`${BACKEND_API}/optimize-resume-stream`, {
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
