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
    codechefHandle: string | null;
    atcoderHandle: string | null;
    githubUsername: string | null;
    ratings: { leetcode: number | null; codeforces: number | null; codechef: number | null; atcoder: number | null };
  } | null;
}

type Step = "platform" | "resume" | "done";

const CAREER_OPTIONS = [
  "Frontend Engineer",
  "Backend Engineer",
  "Fullstack Engineer",
  "Machine Learning Engineer",
  "Data Scientist",
  "DevOps / SRE",
  "Product Manager",
  "Mobile Developer (iOS/Android)",
  "Security Engineer"
];

export function OnboardingModal() {
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>("platform");
  const [lc, setLc] = useState("");
  const [cf, setCf] = useState("");
  const [cc, setCc] = useState("");
  const [ac, setAc] = useState("");
  const [gh, setGh] = useState("");
  const [targetRole, setTargetRole] = useState(CAREER_OPTIONS[0]);
  const [resumeText, setResumeText] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [useFileUpload, setUseFileUpload] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

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

  const parseMutation = useMutation({
    mutationFn: (body: FormData) => 
      apiFetch("/api/resume/parse", { 
        method: "POST", 
        body
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resume"] });
      qc.invalidateQueries({ queryKey: ["career"] });
    }
  });

  // Don't show if loading, dismissed, or already configured
  if (isLoading || dismissed) return null;
  const p = data?.profile;
  const isConfigured = p?.leetcodeHandle || p?.codeforcesHandle || p?.codechefHandle || p?.atcoderHandle;
  if (isConfigured) return null;

  const handleSaveHandles = async () => {
    if (!lc && !cf && !cc && !ac && !gh) { setStep("resume"); return; }
    await saveMutation.mutateAsync({
      leetcodeHandle: lc || null,
      codeforcesHandle: cf || null,
      codechefHandle: cc || null,
      atcoderHandle: ac || null,
      githubUsername: gh || null,
    });
    // Auto-sync ratings after saving handles
    if (lc || cf || cc || ac) await syncMutation.mutateAsync();
    setStep("resume");
  };

  const handleFinish = async () => {
    if (targetRole) {
      localStorage.setItem("onyx_target_role", targetRole);
    }
    
    const formData = new FormData();
    formData.append("targetRole", targetRole || "");

    let hasResume = false;
    if (useFileUpload && selectedFile) {
      formData.append("file", selectedFile);
      hasResume = true;
    } else if (!useFileUpload && resumeText.trim().length >= 10) {
      formData.append("resumeText", resumeText);
      hasResume = true;
    }

    if (hasResume) {
      await parseMutation.mutateAsync(formData);
    }
    
    setStep("done");
    setTimeout(() => setDismissed(true), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon-deep/90 backdrop-blur-sm">
      <div className="w-full max-w-lg border border-graphite-border bg-graphite shadow-onyx">
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
                {step === "resume" && "Step 2 of 2 — Career & Context"}
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
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto onyx-scrollbar">
          {step === "platform" && (
            <div className="space-y-4">
              <p className="font-mono text-2xs text-onyx-muted">
                Enter your competitive programming handles. Ratings will be fetched automatically from public APIs. You can skip and fill these later in <strong className="text-onyx-fg">CP Matrix</strong>.
              </p>
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="font-mono text-2xs text-onyx-subtle">CodeChef Handle</label>
                  <Input
                    placeholder="e.g. cc_handle"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-2xs text-onyx-subtle">AtCoder Handle</label>
                  <Input
                    placeholder="e.g. ac_handle"
                    value={ac}
                    onChange={(e) => setAc(e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="font-mono text-2xs text-onyx-subtle">GitHub Username</label>
                  <Input
                    placeholder="e.g. github_user"
                    value={gh}
                    onChange={(e) => setGh(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => { setStep("resume"); }}
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

          {step === "resume" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="font-mono text-2xs text-onyx-muted">
                  What role are you targeting? This configures Onyx AI for tailored insights.
                </p>
                <div className="space-y-1">
                  <label className="font-mono text-2xs text-onyx-subtle">Target Role</label>
                  <select 
                    className="w-full border border-graphite-border bg-carbon px-3 py-2 font-mono text-xs text-onyx-fg outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  >
                    {CAREER_OPTIONS.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-mono text-2xs text-onyx-muted">
                  Provide your resume to analyze your skills and auto-create milestones.
                </p>

                {/* Sub-tabs for file vs text */}
                <div className="flex border-b border-graphite-border/30">
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-1.5 font-mono text-[10px] border-b-2 transition-all",
                      useFileUpload
                        ? "border-neon-cyan text-neon-cyan"
                        : "border-transparent text-onyx-muted hover:text-onyx-fg"
                    )}
                    onClick={() => setUseFileUpload(true)}
                  >
                    File Upload (.pdf, .docx)
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-1.5 font-mono text-[10px] border-b-2 transition-all",
                      !useFileUpload
                        ? "border-neon-cyan text-neon-cyan"
                        : "border-transparent text-onyx-muted hover:text-onyx-fg"
                    )}
                    onClick={() => setUseFileUpload(false)}
                  >
                    Paste Plain Text
                  </button>
                </div>

                {useFileUpload ? (
                  <div
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        setSelectedFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".pdf,.docx,.txt";
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files && files[0]) setSelectedFile(files[0]);
                      };
                      input.click();
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center border border-dashed rounded p-6 text-center cursor-pointer transition-all",
                      dragActive
                        ? "border-neon-cyan bg-neon-cyan/5"
                        : "border-graphite-border/65 hover:border-neon-cyan/40 bg-carbon/20"
                    )}
                  >
                    {selectedFile ? (
                      <div className="space-y-1">
                        <p className="font-mono text-2xs font-bold text-neon-cyan truncate max-w-[240px]">
                          {selectedFile.name}
                        </p>
                        <p className="font-mono text-[10px] text-onyx-muted">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-xl">⇪</span>
                        <p className="font-mono text-2xs text-onyx-fg">
                          Click or drag resume file here
                        </p>
                        <p className="font-mono text-[10px] text-onyx-muted">
                          PDF, DOCX, or TXT
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-mono text-3xs text-onyx-subtle">Resume Content</label>
                    <textarea
                      className="h-28 w-full resize-none border border-graphite-border bg-carbon p-2 font-mono text-2xs text-onyx-fg outline-none focus:border-neon-cyan/50 onyx-scrollbar"
                      placeholder="Paste your plain text resume contents here..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep("platform")}
                  className="font-mono text-2xs text-graphite-muted underline underline-offset-2 hover:text-onyx-muted"
                >
                  ← Back
                </button>
                <Button variant="accent" onClick={handleFinish} disabled={parseMutation.isPending}>
                  {parseMutation.isPending ? "Scanning AI..." : "Initialize Profile"}
                </Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="text-3xl text-neon-cyan">✓</span>
              <p className="font-mono text-xs text-onyx-fg">Initialization complete.</p>
              <p className="font-mono text-2xs text-onyx-muted">
                {targetRole && `Targeting: ${targetRole}`}
              </p>
            </div>
          )}
        </div>

        {/* Footer — privacy note */}
        <div className={cn("border-t border-graphite-border px-6 py-3", step === "done" && "hidden")}>
          <p className="font-mono text-[10px] text-graphite-muted">
            🔒 Your data stays private. We never train public AI on your content.
          </p>
        </div>
      </div>
    </div>
  );
}
