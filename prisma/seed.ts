import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_ROADMAP = [
  {
    id: "foundation",
    title: "CS Foundation",
    status: "complete",
    children: [
      { id: "ds", title: "Data Structures", status: "complete", children: [] },
      { id: "algo", title: "Algorithms", status: "active", children: [] },
    ],
  },
  {
    id: "interview",
    title: "Interview Prep",
    status: "active",
    children: [
      { id: "lc", title: "LeetCode Patterns", status: "active", children: [] },
      { id: "sys", title: "System Design", status: "locked", children: [] },
    ],
  },
  {
    id: "career",
    title: "Career Launch",
    status: "locked",
    children: [
      { id: "resume", title: "Resume Polish", status: "locked", children: [] },
      { id: "apply", title: "Applications", status: "locked", children: [] },
    ],
  },
];

const DEFAULT_RESUME_SECTIONS = [
  { id: "exp", type: "experience", content: "", score: 0 },
  { id: "edu", type: "education", content: "", score: 0 },
  { id: "skills", type: "skills", content: "", score: 0 },
  { id: "proj", type: "projects", content: "", score: 0 },
];

async function main() {
  const email = "operator@onyx.dev";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      displayName: "Operator",
    },
  });

  await prisma.onyxContext.upsert({
    where: { userId: user.id },
    update: { onboardingComplete: true },
    create: {
      userId: user.id,
      activeModule: "dashboard",
      preferences: JSON.stringify({
        density: "compact",
        keyboardHints: true,
        commandPaletteEnabled: true,
      }),
      onboardingComplete: true,
    },
  });

  await prisma.dSAVault.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      problemsSolved: 0,
      topicsMastered: JSON.stringify([]),
      streakDays: 0,
      lastActivityAt: null,
    },
  });

  // Platform profile — handles empty, user fills in from CP Matrix
  await prisma.platformProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      leetcodeHandle: null,
      codeforcesHandle: null,
      githubUsername: null,
      ratings: JSON.stringify({ leetcode: null, codeforces: null, atcoder: null }),
    },
  });

  await prisma.roadmapProgress.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      nodes: JSON.stringify(DEFAULT_ROADMAP),
    },
  });

  // Resume profile — empty sections, user fills in then analyzes with AI
  await prisma.resumeProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      version: 1,
      score: 0,
      sections: JSON.stringify(DEFAULT_RESUME_SECTIONS),
      lastAnalyzedAt: null,
    },
  });

  console.log(`Seeded user: ${email} (id: ${user.id})`);
  console.log("No hardcoded data — fill in your profiles from the UI!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
