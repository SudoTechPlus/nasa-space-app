import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 🔒 Optional: validate or authenticate request here
    if (!body?.command) {
      return NextResponse.json({ error: "Missing command" }, { status: 400 });
    }

    // Forward request to n8n webhook
    const n8nRes = await fetch(process.env.N8N_WEBHOOK_URL as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await n8nRes.json();

    return NextResponse.json({ success: true, n8nResponse: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
