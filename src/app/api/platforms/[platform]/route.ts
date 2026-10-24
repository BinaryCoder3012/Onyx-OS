import { NextResponse } from "next/server";
import { fetchers, HandleNotFoundError } from "@/lib/platforms";
import type { Platform } from "@/lib/types";

const HANDLE = /^[A-Za-z0-9_.\-]{2,40}$/;

export async function GET(req: Request, ctx: { params: Promise<{ platform: string }> }) {
  const { platform } = await ctx.params;
  const handle = new URL(req.url).searchParams.get("handle")?.trim() ?? "";

  if (!(platform in fetchers)) {
    return NextResponse.json({ error: `Unknown platform "${platform}".` }, { status: 404 });
  }
  if (!HANDLE.test(handle)) {
    return NextResponse.json({ error: "Handles are 2–40 letters, digits, dots, dashes or underscores." }, { status: 400 });
  }

  try {
    const stats = await fetchers[platform as Platform](handle);
    return NextResponse.json(stats, { headers: { "Cache-Control": "public, s-maxage=600" } });
  } catch (err) {
    if (err instanceof HandleNotFoundError) {
      return NextResponse.json({ error: `No ${platform} user called "${handle}".` }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: `${platform} did not answer (${message}). Try again in a minute.` }, { status: 502 });
  }
}
