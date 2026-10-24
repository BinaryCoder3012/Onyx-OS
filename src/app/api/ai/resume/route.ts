import { NextResponse } from "next/server";
import { z } from "zod";
import { chatJson } from "@/lib/ollama";
import { aiError } from "@/lib/ai/handler";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024;

const Review = z.object({
  score: z.number().min(0).max(100),
  verdict: z.string(),
  sections: z
    .array(z.object({ name: z.string(), score: z.number().min(0).max(100), notes: z.array(z.string()).max(4) }))
    .min(2)
    .max(7),
  rewrites: z.array(z.object({ before: z.string(), after: z.string() })).max(5),
  missingKeywords: z.array(z.string()).max(12),
});

async function extractText(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { extractText: pdfText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(buf);
    const { text } = await pdfText(pdf, { mergePages: true });
    return text;
  }
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
    return value;
  }
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return new TextDecoder().decode(buf);
  }
  throw new UnsupportedFile();
}

class UnsupportedFile extends Error {}

/**
 * Accepts multipart form data: `file` (PDF, DOCX, TXT) or `text`, plus `targetRole`.
 * Returns the extracted text with the review so the client can keep both.
 */
export async function POST(req: Request) {
  let text = "";
  let targetRole = "";
  try {
    const form = await req.formData();
    targetRole = String(form.get("targetRole") ?? "").slice(0, 120);
    const file = form.get("file");
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "That file is over 4 MB. Export a smaller PDF." }, { status: 413 });
      }
      text = await extractText(file);
    } else {
      text = String(form.get("text") ?? "");
    }
  } catch (err) {
    if (err instanceof UnsupportedFile) {
      return NextResponse.json({ error: "Upload a PDF, DOCX or TXT file." }, { status: 415 });
    }
    return NextResponse.json({ error: "Could not read that file. Is it a text PDF rather than a scan?" }, { status: 400 });
  }

  text = text.replace(/\s+\n/g, "\n").replace(/[ \t]{2,}/g, " ").trim();
  if (text.length < 200) {
    return NextResponse.json(
      { error: "Found almost no text in it. Scanned PDFs have no text layer; paste the text instead." },
      { status: 422 },
    );
  }

  try {
    const review = await chatJson(
      Review,
      "You review software engineering resumes the way a hiring manager at a strong tech company would in a 30-second screen, then coach like a mentor. Score honestly: 85+ is rare and means ready for top companies. Judge impact (numbers, scope), clarity, technical depth, and fit for the target role. Rewrites take real bullets from the resume and make them sharper with action, scope and a measurable result; never invent numbers, use [X] placeholders instead.",
      `Target role: ${targetRole || "software engineer"}\n\nResume:\n${text.slice(0, 14000)}`,
      `{"score":integer 0-100,"verdict":string (two sentences),"sections":[{"name":string (Experience, Projects, Skills, Education, Impact, Formatting...),"score":integer,"notes":string[] (1-3 specific notes)}],"rewrites":[{"before":string (a bullet copied from the resume),"after":string}] (2-4),"missingKeywords":string[] (skills or terms the target role expects that are absent)}`,
    );
    return NextResponse.json({ text: text.slice(0, 20000), review });
  } catch (err) {
    return aiError(err);
  }
}
