import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Required in .env.local: NEXT_PUBLIC_API_URL=http://localhost:9001/api
// No fallback — a missing URL must fail loudly rather than silently proxying
// to deleted legacy infrastructure (the old Express backend on port 3007 is gone).
const JOB_BOARD_API = process.env.NEXT_PUBLIC_API_URL;

if (!JOB_BOARD_API) {
  throw new Error(
    '[jobs proxy] NEXT_PUBLIC_API_URL is not set.\n' +
    'Add to .env.local:  NEXT_PUBLIC_API_URL=http://localhost:9001/api\n' +
    'Then restart the dev server.'
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  try {
    const res = await fetch(`${JOB_BOARD_API}/jobs?${searchParams}`);
    if (!res.ok) {
      console.error(`[jobs proxy] backend returned ${res.status} ${res.statusText}`);
      return NextResponse.json(
        { error: `Job board API error ${res.status}`, jobs: [], total: 0 },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[jobs proxy] fetch failed:', message);
    return NextResponse.json(
      { error: `Job board unreachable: ${message}`, jobs: [], total: 0 },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const res = await fetch(`${JOB_BOARD_API}/jobs/ingest`, { method: 'POST' });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Ingestion trigger failed: ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Ingestion trigger failed: ${message}` }, { status: 502 });
  }
}
