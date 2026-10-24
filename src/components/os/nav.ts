export const NAV = [
  { href: "/os", label: "Today", key: "t", hint: "What to do next" },
  { href: "/os/problems", label: "Problems", key: "p", hint: "Log and revisit problems" },
  { href: "/os/ratings", label: "Ratings", key: "r", hint: "Contest ratings across judges" },
  { href: "/os/roadmap", label: "Roadmap", key: "m", hint: "Your learning plan" },
  { href: "/os/resume", label: "Resume", key: "u", hint: "Score and sharpen your resume" },
  { href: "/os/career", label: "Career", key: "c", hint: "Goals with dates" },
  { href: "/os/openings", label: "Openings", key: "o", hint: "Applications, saved to offer" },
  { href: "/os/focus", label: "Focus", key: "f", hint: "Timer and study hours" },
  { href: "/os/settings", label: "Settings", key: "s", hint: "Profile, handles, export" },
] as const;

export function navFor(pathname: string) {
  return [...NAV].sort((a, b) => b.href.length - a.href.length).find((n) => pathname === n.href || pathname.startsWith(n.href + "/")) ?? NAV[0];
}
