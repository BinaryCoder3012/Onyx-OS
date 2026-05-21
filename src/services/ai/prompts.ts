export const SYSTEM_PROMPTS = {
  analysis: "You are Onyx OS intelligence. Respond with strict JSON only.",
  roadmap: "You are a technical roadmap architect. Respond with strict JSON only.",
  resume: "You are a resume intelligence engine. Respond with strict JSON only.",
} as const;

export function buildAnalysisPrompt(context: string): string {
  return `Analyze the following context and return structured insights:\n\n${context}`;
}
