/** The seven layers of the stone, top slab first. Each is a part of the workspace. */
export const STONE_LAYERS = [
  {
    name: "Problems",
    href: "/os/problems",
    line: "Every problem you touch, with where it came from.",
    body: "Log the problem, its topics and how it went. Onyx counts your streak and shows the topics you keep stepping around, so the next pick is deliberate.",
    detail: "Two-pointer · 14 solved · 3 to revisit",
  },
  {
    name: "Ratings",
    href: "/os/ratings",
    line: "Four judges on one timeline.",
    body: "Add your Codeforces, LeetCode, AtCoder and CodeChef handles. Every rated contest comes straight from each judge's public data and is drawn on one chart.",
    detail: "Codeforces · LeetCode · AtCoder · CodeChef",
  },
  {
    name: "Roadmap",
    href: "/os/roadmap",
    line: "A plan you can tick off.",
    body: "Say what you are aiming for and how many hours a week you really have. The AI drafts phases of checkable steps with real resources; you mark them done.",
    detail: "Phase 2 of 4 · 9 of 22 steps",
  },
  {
    name: "Resume",
    href: "/os/resume",
    line: "Read the way a hiring manager reads it.",
    body: "Drop in a PDF or DOCX. It is scored section by section for the role you want, the missing keywords are listed, and your own bullets come back sharper.",
    detail: "PDF · DOCX · TXT",
  },
  {
    name: "Career",
    href: "/os/career",
    line: "Goals with a date on them.",
    body: "From reaching Expert to shipping a side project before placements. Each morning's brief weighs your goals against everything else in the stone.",
    detail: "Due dates counted down",
  },
  {
    name: "Openings",
    href: "/os/openings",
    line: "Every application, saved to offer.",
    body: "Track each opening through its stages with the deadline counting down, and ask for a fit check against your resume before you spend an evening on it.",
    detail: "Saved → applied → interview → offer",
  },
  {
    name: "Focus",
    href: "/os/focus",
    line: "Whether the hours turned into progress.",
    body: "A focus timer logs what you studied. The week's hours sit beside what you solved, so a heavy week with nothing to show stands out.",
    detail: "25 · 50 · 90 minute blocks",
  },
] as const;
