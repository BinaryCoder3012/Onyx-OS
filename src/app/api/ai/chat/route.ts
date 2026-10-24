import { z } from "zod";
import { NextResponse } from "next/server";
import { streamChat } from "@/lib/ollama";
import { aiError } from "@/lib/ai/handler";

export const maxDuration = 60;

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) }))
    .min(1)
    .max(40),
  context: z.string().max(12000).default(""),
});

const SYSTEM = `You are Onyx, the assistant inside Onyx OS, a workspace where a programmer tracks problems they solve, contest ratings, a learning roadmap, their resume, career goals, job openings and focus time.

Speak plainly and briefly, like a sharp senior engineer mentoring a friend. Use the workspace snapshot below to make answers specific to this person: cite their actual numbers, topics, deadlines and gaps. If the snapshot lacks something you need, say what to add and where (for example "add your Codeforces handle under Ratings"). Never invent stats about them.

For coding questions give correct, idiomatic code with complexity. Use short markdown: paragraphs, bullet lists, fenced code. No headings, no tables.`;

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Send { messages: [{ role, content }], context }." }, { status: 400 });
  }
  try {
    const stream = await streamChat(
      [
        { role: "system", content: `${SYSTEM}\n\n--- Workspace snapshot ---\n${body.context || "(empty workspace)"}` },
        ...body.messages,
      ],
      req.signal,
    );
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return aiError(err);
  }
}
