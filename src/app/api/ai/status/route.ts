import { NextResponse } from "next/server";

export function GET() {
  const host = process.env.OLLAMA_HOST || "https://ollama.com";
  const cloud = host.includes("ollama.com");
  return NextResponse.json({
    configured: !cloud || Boolean(process.env.OLLAMA_API_KEY),
    model: process.env.OLLAMA_MODEL || "gpt-oss:120b",
    host: cloud ? "Ollama Cloud" : "self-hosted Ollama",
  });
}
