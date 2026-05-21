"use client";

import { Button, Input } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface ProfilePayload {
  user: { email: string; displayName: string };
  profile: {
    leetcodeHandle: string | null;
    codeforcesHandle: string | null;
    githubUsername: string | null;
    ratings: { leetcode: number | null; codeforces: number | null; atcoder: number | null };
  } | null;
}

type Step = "platform" | "target" | "done";

export function OnboardingModal() {
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>("platform");
  const [lc, setLc] = useState("");
  const [cf, setCf] = useState("");
  const [gh, setGh] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [dismissed, setDismissed] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<ProfilePayload>("/api/profile"),
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

  // Don't show if loading, dismissed, or already configured
  if (isLoading || dismissed) return null;
  const p = data?.profile;
  const isConfigured = p?.leetcodeHandle || p?.codeforcesHandle;
  if (isConfigured) return null;

  const handleSaveHandles = async () => {
    if (!lc && !cf && !gh) { setStep("target"); return; }
    await saveMutation.mutateAsync({
      leetcodeHandle: lc || null,
      codeforcesHandle: cf || null,
      githubUsername: gh || null,
    });
    // Auto-sync ratings after saving handles
    if (lc || cf) await syncMutation.mutateAsync();
    setStep("target");
  };

  const handleFinish = () => {
    if (targetRole) {
      // Store target in localStorage for resume module to pick up
      localStorage.setItem("onyx_target_role", targetRole);
    }
    setStep("done");
    setTimeout(() => setDismissed(true), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon-deep/90 backdrop-blur-sm">
      <div className="w-full max-w-md border border-graphite-border bg-graphite shadow-onyx">
        {/* Header */}
        <div className="border-b border-graphite-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-lg text-neon-cyan">◆</span>
            <div>
              <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-onyx-fg">
                Onyx OS — Setup
              </h2>
              <p className="font-mono text-2xs text-onyx-muted">
                {step === "platform" && "Step 1 of 2 — Platform handles"}
                {step === "target" && "Step 2 of 2 — Your target"}
                {step === "done" && "All set"}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-px bg-graphite-border">
            <div
              className="h-px bg-neon-cyan transition-all duration-500"
              style={{ width: step === "platform" ? "50%" : "100%" }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {step === "platform" && (
            <div className="space-y-4">
              <p className="font-mono text-2xs text-onyx-muted">
                Enter your competitive programming handles. Ratings will be fetched automatically from public APIs. You can skip and fill these later in <strong className="text-onyx-fg">CP Matrix</strong>.
              </p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-mono text-2xs text-onyx-subtle">LeetCode Username</label>
                  <Input
                    placeholder="e.g. leetcode_user"
                    value={lc}
                    onChange={(e) => setLc(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-2xs text-onyx-subtle">Codeforces Handle</label>
                  <Input
                    placeholder="e.g. cf_handle"
                    value={cf}
                    onChange={(e) => setCf(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-2xs text-onyx-subtle">GitHub Username</label>
                  <Input
                    placeholder="e.g. github_user"
                    value={gh}
                    onChange={(e) => setGh(e.target.value)}
                  />
                </div>
              </div>
              {/* Privacy assurance */}
              <p className="font-mono text-[10px] text-graphite-muted">
                🛡️ We only read your public profile data. No login credentials required.
              </p>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => { setStep("target"); }}
                  className="font-mono text-2xs text-graphite-muted underline underline-offset-2 hover:text-onyx-muted"
                >
                  Skip for now
                </button>
                <Button
                  variant="accent"
                  onClick={handleSaveHandles}
                  disabled={saveMutation.isPending || syncMutation.isPending}
                >
                  {saveMutation.isPending || syncMutation.isPending ? "Saving & syncing..." : "Save & Continue"}
                </Button>
              </div>
            </div>
          )}

          {step === "target" && (
            <div className="space-y-4">
              <p className="font-mono text-2xs text-onyx-muted">
                What role are you targeting? This helps Onyx AI tailor your resume analysis and opportunity matching.
              </p>
              <div className="space-y-1">
                <label className="font-mono text-2xs text-onyx-subtle">Target Role</label>
                <Input
                  placeholder="e.g. SWE Intern at FAANG, Backend Engineer, ML Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setStep("platform")}
                  className="font-mono text-2xs text-graphite-muted underline underline-offset-2 hover:text-onyx-muted"
                >
                  ← Back
                </button>
                <Button variant="accent" onClick={handleFinish}>
                  {targetRole ? "Finish Setup" : "Skip & Finish"}
                </Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="text-3xl text-neon-cyan">✓</span>
              <p className="font-mono text-xs text-onyx-fg">Setup complete. Onyx OS is ready.</p>
              <p className="font-mono text-2xs text-onyx-muted">
                {targetRole && `Targeting: ${targetRole}`}
              </p>
            </div>
          )}
        </div>

        {/* Footer — privacy note */}
        <div className={cn("border-t border-graphite-border px-6 py-3", step === "done" && "hidden")}>
          <p className="font-mono text-[10px] text-graphite-muted">
            🔒 Your data stays private. We never train AI on your content or share with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
