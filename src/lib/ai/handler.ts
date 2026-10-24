import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AIUnavailableError } from "@/lib/ollama";

/** Wraps an AI route: validates the body and turns failures into readable JSON errors. */
export function aiRoute<B, R>(schema: z.ZodType<B>, run: (body: B) => Promise<R>) {
  return async (req: Request) => {
    let body: B;
    try {
      body = schema.parse(await req.json());
    } catch (err) {
      const msg =
        err instanceof z.ZodError
          ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
          : "Body must be JSON.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    try {
      return NextResponse.json(await run(body));
    } catch (err) {
      return aiError(err);
    }
  };
}

export function aiError(err: unknown) {
  if (err instanceof AIUnavailableError) {
    return NextResponse.json({ error: "AI is off: add OLLAMA_API_KEY to the server environment." }, { status: 503 });
  }
  const message = err instanceof Error ? err.message : "unknown error";
  return NextResponse.json({ error: `The model failed: ${message}` }, { status: 502 });
}
