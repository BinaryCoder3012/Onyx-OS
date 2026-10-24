import "server-only";
import type { Platform, PlatformStats, RatingPoint } from "./types";

/** Normalises each judge's public profile into one shape. All endpoints are unauthenticated. */

const UA = "Mozilla/5.0 (compatible; OnyxOS/2.0; +https://github.com/BinaryCoder3012/Onyx-OS)";

export class HandleNotFoundError extends Error {}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "User-Agent": UA, Accept: "application/json", ...(init?.headers ?? {}) },
    next: { revalidate: 600 },
  });
  if (res.status === 404) throw new HandleNotFoundError();
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return (await res.json()) as T;
}

function build(handle: string, history: RatingPoint[], extra: Partial<PlatformStats>): PlatformStats {
  const ratings = history.map((h) => h.rating);
  return {
    handle,
    rating: ratings.at(-1) ?? null,
    maxRating: ratings.length ? Math.max(...ratings) : null,
    rank: null,
    solved: null,
    history,
    fetchedAt: Date.now(),
    ...extra,
  };
}

async function codeforces(handle: string): Promise<PlatformStats> {
  type CF<T> = { status: "OK" | "FAILED"; result: T; comment?: string };
  const info = await getJson<CF<{ rating?: number; maxRating?: number; rank?: string }[]>>(
    `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`,
  ).catch((e) => {
    if (e instanceof Error && e.message.includes("400")) throw new HandleNotFoundError();
    throw e;
  });
  if (info.status !== "OK" || !info.result[0]) throw new HandleNotFoundError();
  const rating = await getJson<CF<{ contestName: string; ratingUpdateTimeSeconds: number; newRating: number }[]>>(
    `https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`,
  );
  const history = (rating.result ?? []).map((r) => ({
    t: r.ratingUpdateTimeSeconds * 1000,
    rating: r.newRating,
    contest: r.contestName,
  }));
  const u = info.result[0];
  return build(handle, history, {
    rating: u.rating ?? null,
    maxRating: u.maxRating ?? null,
    rank: u.rank ?? null,
  });
}

async function leetcode(handle: string): Promise<PlatformStats> {
  const query = `query($u:String!){
    matchedUser(username:$u){ submitStatsGlobal{ acSubmissionNum{ difficulty count } } }
    userContestRanking(username:$u){ rating topPercentage }
    userContestRankingHistory(username:$u){ attended rating contest{ title startTime } }
  }`;
  const data = await getJson<{
    data: {
      matchedUser: { submitStatsGlobal: { acSubmissionNum: { difficulty: string; count: number }[] } } | null;
      userContestRanking: { rating: number; topPercentage: number } | null;
      userContestRankingHistory: { attended: boolean; rating: number; contest: { title: string; startTime: number } }[] | null;
    };
  }>("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
    body: JSON.stringify({ query, variables: { u: handle } }),
  });
  if (!data.data?.matchedUser) throw new HandleNotFoundError();
  const history = (data.data.userContestRankingHistory ?? [])
    .filter((h) => h.attended)
    .map((h) => ({ t: h.contest.startTime * 1000, rating: Math.round(h.rating), contest: h.contest.title }));
  const solved = data.data.matchedUser.submitStatsGlobal.acSubmissionNum.find((a) => a.difficulty === "All")?.count ?? null;
  const ranking = data.data.userContestRanking;
  return build(handle, history, {
    solved,
    rank: ranking ? `Top ${ranking.topPercentage}%` : null,
  });
}

async function atcoder(handle: string): Promise<PlatformStats> {
  const rows = await getJson<{ IsRated: boolean; NewRating: number; ContestName: string; EndTime: string }[]>(
    `https://atcoder.jp/users/${encodeURIComponent(handle)}/history/json`,
  );
  const history = rows
    .filter((r) => r.IsRated)
    .map((r) => ({ t: new Date(r.EndTime).getTime(), rating: r.NewRating, contest: r.ContestName }));
  return build(handle, history, { rank: atcoderColour(history.at(-1)?.rating ?? 0) });
}

function atcoderColour(r: number) {
  if (r >= 2800) return "Red";
  if (r >= 2400) return "Orange";
  if (r >= 2000) return "Yellow";
  if (r >= 1600) return "Blue";
  if (r >= 1200) return "Cyan";
  if (r >= 800) return "Green";
  if (r >= 400) return "Brown";
  return r > 0 ? "Grey" : null;
}

async function codechef(handle: string): Promise<PlatformStats> {
  const res = await fetch(`https://www.codechef.com/users/${encodeURIComponent(handle)}`, {
    headers: { "User-Agent": UA },
    next: { revalidate: 600 },
    redirect: "manual",
  });
  // Unknown users are redirected away from the profile page.
  if (res.status >= 300 && res.status < 400) throw new HandleNotFoundError();
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  const html = await res.text();
  const ratingMatch = html.match(/class="rating-number">\s*(\d+)/);
  if (!ratingMatch && !html.includes("user-details")) throw new HandleNotFoundError();

  let history: RatingPoint[] = [];
  const all = html.match(/all_rating\s*=\s*(\[[\s\S]*?\]);/);
  if (all) {
    try {
      const rows = JSON.parse(all[1]) as { rating: string; name: string; end_date: string }[];
      history = rows.map((r) => ({
        t: new Date(r.end_date.replace(" ", "T") + "Z").getTime(),
        rating: Number(r.rating),
        contest: r.name,
      }));
    } catch {
      history = [];
    }
  }
  const stars = html.match(/(\d)&#9733;/)?.[1];
  const highest = html.match(/Highest Rating\s*(\d+)/)?.[1];
  const solved = html.match(/Total Problems Solved:\s*(\d+)/)?.[1];
  return build(handle, history, {
    rating: ratingMatch ? Number(ratingMatch[1]) : (history.at(-1)?.rating ?? null),
    maxRating: highest ? Number(highest) : null,
    rank: stars ? `${stars}★` : null,
    solved: solved ? Number(solved) : null,
  });
}

export const fetchers: Record<Platform, (handle: string) => Promise<PlatformStats>> = {
  codeforces,
  leetcode,
  atcoder,
  codechef,
};
