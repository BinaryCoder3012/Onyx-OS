"use client";
import { useState } from "react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Button, Input, LoadingState, Panel } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { PlatformRatings } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ProfilePayload {
  user: { displayName: string; email: string };
  profile: {
    leetcodeHandle: string | null;
    codeforcesHandle: string | null;
    codechefHandle: string | null;
    atcoderHandle: string | null;
    githubUsername: string | null;
    ratings: PlatformRatings;
    updatedAt: string;
  } | null;
}

export function CPMatrixModule() {
  const qc = useQueryClient();
  const [lc, setLc] = useState<string | null>(null);
  const [cf, setCf] = useState<string | null>(null);
  const [cc, setCc] = useState<string | null>(null);
  const [ac, setAc] = useState<string | null>(null);
  const [gh, setGh] = useState<string | null>(null);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<ProfilePayload>("/api/profile"),
  });

  const { data: links, isLoading: linksLoading } = useQuery({
    queryKey: [
      "cp-handles",
      profileData?.profile?.leetcodeHandle,
      profileData?.profile?.codeforcesHandle,
      profileData?.profile?.codechefHandle,
      profileData?.profile?.atcoderHandle,
    ],
    queryFn: async () => {
      const { leetcodeHandle, codeforcesHandle, codechefHandle, atcoderHandle } = profileData?.profile ?? {};
      const params = new URLSearchParams();
      if (leetcodeHandle) params.append("leetcode", leetcodeHandle);
      if (codeforcesHandle) params.append("codeforces", codeforcesHandle);
      if (codechefHandle) params.append("codechef", codechefHandle);
      if (atcoderHandle) params.append("atcoder", atcoderHandle);
      return apiFetch<any>(`/api/cp/handles?${params.toString()}`);
    },
    enabled: !!profileData?.profile,
  });
  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch("/api/profile", { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  const syncMutation = useMutation({
    mutationFn: () => apiFetch("/api/profile", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  if (profileLoading || linksLoading || !profileData?.profile) return <LoadingState label="Loading CP Matrix" />;

  const p = profileData.profile;
  const r = p.ratings;

  // Platform tier helpers
  const getLeetCodeTier = (rating: number | null) => {
    if (!rating) return { name: "Unrated", color: "text-onyx-muted", border: "border-graphite-border/30 bg-carbon/10" };
    if (rating < 1400) return { name: "Beginner", color: "text-gray-400", border: "border-gray-500/30 bg-gray-500/5" };
    if (rating < 1600) return { name: "Intermediate", color: "text-green-400", border: "border-green-500/30 bg-green-500/5" };
    if (rating < 1850) return { name: "Knight ♞", color: "text-neon-cyan font-bold", border: "border-neon-cyan/40 bg-neon-cyan/5" };
    return { name: "Guardian ♛", color: "text-cyber-yellow font-bold", border: "border-cyber-yellow/40 bg-cyber-yellow/5 animate-pulse" };
  };

  const getCodeforcesTier = (rating: number | null) => {
    if (!rating) return { name: "Unrated", color: "text-onyx-muted", border: "border-graphite-border/30 bg-carbon/10" };
    if (rating < 1200) return { name: "Newbie", color: "text-gray-400", border: "border-gray-500/30 bg-gray-500/5" };
    if (rating < 1400) return { name: "Pupil", color: "text-green-400", border: "border-green-500/30 bg-green-500/5" };
    if (rating < 1600) return { name: "Specialist", color: "text-cyan-400", border: "border-cyan-500/30 bg-cyan-500/5" };
    if (rating < 1900) return { name: "Expert", color: "text-blue-400", border: "border-blue-500/30 bg-blue-500/5" };
    if (rating < 2100) return { name: "Candidate Master", color: "text-purple-400", border: "border-purple-500/30 bg-purple-500/5" };
    if (rating < 2300) return { name: "Master", color: "text-orange-400", border: "border-orange-500/30 bg-orange-500/5" };
    return { name: "Grandmaster ♕", color: "text-red-400 font-bold", border: "border-red-500/40 bg-red-500/5 animate-pulse" };
  };

  const getCodeChefTier = (rating: number | null) => {
    if (!rating) return { name: "Unrated", color: "text-onyx-muted", border: "border-graphite-border/30 bg-carbon/10" };
    if (rating < 1400) return { name: "1 Star ★", color: "text-gray-400", border: "border-gray-500/30 bg-gray-500/5" };
    if (rating < 1600) return { name: "2 Star ★★", color: "text-green-400", border: "border-green-500/30 bg-green-500/5" };
    if (rating < 1800) return { name: "3 Star ★★★", color: "text-blue-400", border: "border-blue-500/30 bg-blue-500/5" };
    if (rating < 2000) return { name: "4 Star ★★★★", color: "text-purple-400", border: "border-purple-500/30 bg-purple-500/5" };
    return { name: "5 Star+ ★★★★★", color: "text-orange-400 font-bold", border: "border-orange-500/40 bg-orange-500/5" };
  };

  const getAtCoderTier = (rating: number | null) => {
    if (!rating) return { name: "Unrated", color: "text-onyx-muted", border: "border-graphite-border/30 bg-carbon/10" };
    if (rating < 400) return { name: "Gray", color: "text-gray-400", border: "border-gray-500/30 bg-gray-500/5" };
    if (rating < 800) return { name: "Brown", color: "text-amber-600", border: "border-amber-600/30 bg-amber-600/5" };
    if (rating < 1200) return { name: "Green", color: "text-green-400", border: "border-green-500/30 bg-green-500/5" };
    if (rating < 1600) return { name: "Cyan", color: "text-cyan-400", border: "border-cyan-500/30 bg-cyan-500/5" };
    return { name: "Blue", color: "text-blue-400 font-bold", border: "border-blue-500/30 bg-blue-500/5" };
  };

  const platforms = [
    {
      id: "leetcode",
      name: "LeetCode",
      handle: p.leetcodeHandle,
      rating: r.leetcode,
      tier: getLeetCodeTier(r.leetcode),
      url: links?.leetcode ?? null,
    },
    {
      id: "codeforces",
      name: "Codeforces",
      handle: p.codeforcesHandle,
      rating: r.codeforces,
      tier: getCodeforcesTier(r.codeforces),
      url: links?.codeforces ?? null,
    },
    {
      id: "codechef",
      name: "CodeChef",
      handle: p.codechefHandle,
      rating: r.codechef,
      tier: getCodeChefTier(r.codechef),
      url: links?.codechef ?? null,
    },
    {
      id: "atcoder",
      name: "AtCoder",
      handle: p.atcoderHandle,
      rating: r.atcoder,
      tier: getAtCoderTier(r.atcoder),
      url: links?.atcoder ?? null,
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ModuleHeader title="CP Matrix" subtitle="Competitive coding sync deck" />
        <div className="flex gap-2">
          <Button
            variant="cyber"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending || (!p.leetcodeHandle && !p.codeforcesHandle && !p.codechefHandle && !p.atcoderHandle)}
          >
            {syncMutation.isPending ? "Syncing Ratings..." : "Sync Ratings"}
          </Button>
        </div>
      </div>

      {/* Grid of Platform Rankings */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {platforms.map((plat) => (
          <div
            key={plat.id}
            className={cn(
              "border p-4 rounded-md flex flex-col justify-between h-[160px] transition-all duration-300 hover:border-graphite-muted",
              plat.tier.border
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-3xs font-bold uppercase tracking-wider text-onyx-muted">
                  {plat.name}
                </span>
                {plat.url && (
                  <a
                    href={plat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[9px] text-neon-cyan hover:underline"
                  >
                    Profile ↗
                  </a>
                )}
              </div>
              <div className="pt-2">
                <p className="font-mono text-lg font-bold text-onyx-fg">
                  {plat.rating !== null ? plat.rating : "---"}
                </p>
                <span className={cn("font-mono text-3xs uppercase font-bold tracking-wider", plat.tier.color)}>
                  {plat.tier.name}
                </span>
              </div>
            </div>

            <div className="font-mono text-[9px] text-onyx-subtle truncate border-t border-graphite-border/20 pt-2 flex justify-between">
              <span>Handle:</span>
              <span className="text-onyx-fg font-bold truncate max-w-[120px]">
                {plat.handle ? `@${plat.handle}` : "Not Configured"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Handles Panel */}
      <Panel title="Configure Platform handles" className="p-4 bg-carbon-light/20 backdrop-blur-md">
        <p className="font-mono text-3xs text-onyx-muted mb-4">
          Provide your username handles across platforms. Saving updates details; Sync pulls rating statistics from active APIs.
        </p>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-1">
            <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-subtle">LeetCode</label>
            <Input 
              defaultValue={p.leetcodeHandle ?? ""} 
              onChange={(e) => setLc(e.target.value)} 
              placeholder="Username"
            />
          </div>
          <div className="space-y-1">
            <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-subtle">Codeforces</label>
            <Input 
              defaultValue={p.codeforcesHandle ?? ""} 
              onChange={(e) => setCf(e.target.value)} 
              placeholder="Username"
            />
          </div>
          <div className="space-y-1">
            <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-subtle">CodeChef</label>
            <Input 
              defaultValue={p.codechefHandle ?? ""} 
              onChange={(e) => setCc(e.target.value)} 
              placeholder="Username"
            />
          </div>
          <div className="space-y-1">
            <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-subtle">AtCoder</label>
            <Input 
              defaultValue={p.atcoderHandle ?? ""} 
              onChange={(e) => setAc(e.target.value)} 
              placeholder="Username"
            />
          </div>
          <div className="space-y-1">
            <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-subtle">GitHub</label>
            <Input 
              defaultValue={p.githubUsername ?? ""} 
              onChange={(e) => setGh(e.target.value)} 
              placeholder="Username"
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-graphite-border/30 flex items-center justify-between flex-wrap gap-3">
          <Button
            variant="accent"
            onClick={() =>
              saveMutation.mutate({
                leetcodeHandle: lc !== null ? lc : p.leetcodeHandle,
                codeforcesHandle: cf !== null ? cf : p.codeforcesHandle,
                codechefHandle: cc !== null ? cc : p.codechefHandle,
                atcoderHandle: ac !== null ? ac : p.atcoderHandle,
                githubUsername: gh !== null ? gh : p.githubUsername,
              })
            }
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : "Save Handles"}
          </Button>

          {p.updatedAt && (
            <span className="font-mono text-3xs text-onyx-muted">
              Last synced: {new Date(p.updatedAt).toLocaleString()}
            </span>
          )}
        </div>
      </Panel>
    </div>
  );
}
