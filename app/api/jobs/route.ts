import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const EXPRESS_API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3007/api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  try {
    const res = await fetch(`${EXPRESS_API}/jobs?${searchParams}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ jobs: [], total: 0 }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const res = await fetch(`${EXPRESS_API}/jobs/ingest`, { method: 'POST' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Ingestion trigger failed' }, { status: 502 });
  }
}
