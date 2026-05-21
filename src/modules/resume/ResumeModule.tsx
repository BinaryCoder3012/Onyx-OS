"use client";

import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Button, Input, LoadingState, Panel, StatCard, Badge } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import type { ResumeSection } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface ResumeData {
  version: number;
  score: number;
  sections: ResumeSection[];
  lastAnalyzedAt: string | null;
}

export function ResumeModule() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [targetRole, setTargetRole] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("onyx_target_role") ?? "";
    }
    return "";
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isManualPaste, setIsManualPaste] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["resume"],
    queryFn: () => apiFetch<ResumeData | null>("/api/resume"),
  });

  const patchMutation = useMutation({
    mutationFn: ({ sectionId, content }: { sectionId: string; content: string }) =>
      apiFetch("/api/resume", {
        method: "PATCH",
        body: JSON.stringify({ sectionId, content }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resume"] }),
  });

  const parseMutation = useMutation({
    mutationFn: (formData: FormData) =>
      apiFetch<{ resumeScore: number; sectionsCount: number; goalsCreated: number }>("/api/resume/parse", {
        method: "POST",
        body: formData,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resume"] });
      setSelectedFile(null);
      setPastedText("");
      setIsManualPaste(false);
      setShowUploadPanel(false);
    },
  });

  // Drag and drop handlers
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || ext === "docx" || ext === "txt") {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUploadSubmit = () => {
    if (!targetRole.trim()) {
      alert("Please enter a target role first.");
      return;
    }

    const formData = new FormData();
    formData.append("targetRole", targetRole);

    if (isManualPaste) {
      if (!pastedText.trim() || pastedText.trim().length < 10) {
        alert("Please paste your resume text (minimum 10 characters).");
        return;
      }
      formData.append("resumeText", pastedText);
    } else {
      if (!selectedFile) {
        alert("Please select a file to upload.");
        return;
      }
      formData.append("file", selectedFile);
    }

    parseMutation.mutate(formData);
  };

  // Helper for rendering progress bar colors based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "bg-neon-cyan";
    if (score >= 60) return "bg-cyber-yellow";
    return "bg-red-500";
  };

  const getScoreTextClass = (score: number) => {
    if (score >= 80) return "text-neon-cyan";
    if (score >= 60) return "text-cyber-yellow";
    return "text-red-400";
  };

  if (isLoading) return <LoadingState label="Loading resume intelligence" />;

  const displayUpload = !data || showUploadPanel;

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto pb-6">
      <div className="flex justify-between items-center">
        <ModuleHeader title="Resume Intelligence" subtitle="ATS validation & gap analysis" />
        {data && (
          <Button 
            variant="outline" 
            onClick={() => setShowUploadPanel(!showUploadPanel)}
          >
            {showUploadPanel ? "Cancel Upload" : "Upload New Resume"}
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Input & Upload Panel */}
        <div className={displayUpload ? "lg:col-span-12" : "lg:col-span-4"}>
          <div className="flex flex-col gap-4">
            {/* Target Role input always visible */}
            <Panel title="Analysis Context" className="p-4 bg-carbon-light/30 backdrop-blur-md">
              <div className="space-y-3">
                <div>
                  <label className="block font-mono text-2xs text-onyx-subtle mb-1">Target Professional Role</label>
                  <Input 
                    placeholder="e.g. Fullstack Engineer, Data Scientist" 
                    value={targetRole} 
                    onChange={(e) => {
                      setTargetRole(e.target.value);
                      localStorage.setItem("onyx_target_role", e.target.value);
                    }} 
                  />
                  <p className="mt-1 font-mono text-3xs text-onyx-muted">
                    We compare your resume strengths against this target role.
                  </p>
                </div>
              </div>
            </Panel>

            {/* Resume Upload Form */}
            {displayUpload && (
              <Panel 
                title={isManualPaste ? "Paste Resume Text" : "Upload Resume File"} 
                className="p-4"
              >
                <div className="space-y-4">
                  {/* Mode switcher */}
                  <div className="flex border-b border-graphite-border/30">
                    <button
                      className={`px-4 py-2 font-mono text-2xs border-b-2 transition-all ${
                        !isManualPaste 
                          ? "border-neon-cyan text-neon-cyan" 
                          : "border-transparent text-onyx-muted hover:text-onyx-fg"
                      }`}
                      onClick={() => setIsManualPaste(false)}
                    >
                      File Upload (.pdf, .docx, .txt)
                    </button>
                    <button
                      className={`px-4 py-2 font-mono text-2xs border-b-2 transition-all ${
                        isManualPaste 
                          ? "border-neon-cyan text-neon-cyan" 
                          : "border-transparent text-onyx-muted hover:text-onyx-fg"
                      }`}
                      onClick={() => setIsManualPaste(true)}
                    >
                      Paste Raw Text
                    </button>
                  </div>

                  {!isManualPaste ? (
                    /* File Drag & Drop Zone */
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={selectedFile ? undefined : triggerFileSelect}
                      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-all ${
                        dragActive 
                          ? "border-neon-cyan bg-neon-cyan/5" 
                          : "border-graphite-border hover:border-neon-cyan/40 hover:bg-carbon-light/10"
                      } ${selectedFile ? "cursor-default" : ""}`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      {selectedFile ? (
                        <div className="space-y-3 w-full max-w-md">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl">📄</span>
                            <div className="text-left">
                              <p className="font-mono text-2xs font-bold text-onyx-fg truncate max-w-[200px] sm:max-w-xs">
                                {selectedFile.name}
                              </p>
                              <p className="font-mono text-3xs text-onyx-muted">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="outline" 
                              className="px-2 py-1 font-mono text-3xs text-red-400 hover:text-red-300"
                              onClick={() => setSelectedFile(null)}
                            >
                              Remove File
                            </Button>
                            <Button
                              variant="outline"
                              className="px-2 py-1 font-mono text-3xs"
                              onClick={triggerFileSelect}
                            >
                              Choose Another
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-3xl text-onyx-subtle animate-pulse">⇪</div>
                          <p className="font-mono text-2xs text-onyx-fg">
                            Drag & drop your resume file here or{" "}
                            <span className="text-neon-cyan underline cursor-pointer">browse</span>
                          </p>
                          <p className="font-mono text-3xs text-onyx-muted">
                            Supports PDF, Word (.docx), or plain text (.txt) up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Manual Paste Text Area */
                    <div>
                      <textarea
                        className="w-full min-h-[160px] bg-carbon border border-graphite-border focus:border-neon-cyan/50 outline-none p-3 font-mono text-2xs text-onyx-fg resize-y"
                        placeholder="Paste your raw resume text contents here..."
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    {data && (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowUploadPanel(false)}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      variant="cyber"
                      onClick={handleUploadSubmit}
                      disabled={parseMutation.isPending || (!selectedFile && !isManualPaste)}
                    >
                      {parseMutation.isPending ? "Analyzing Resume & Goals..." : "Parse & Analyze"}
                    </Button>
                  </div>
                </div>
              </Panel>
            )}

            {/* Overall Score display when not uploading */}
            {data && !displayUpload && (
              <Panel title="ATS Profile Summary" className="p-4">
                <div className="flex flex-col gap-4">
                  <StatCard 
                    label="ATS Score" 
                    value={data.score} 
                    suffix="/100" 
                    variant="neon" 
                  />
                  <div className="space-y-1">
                    <p className="font-mono text-3xs text-onyx-subtle flex justify-between">
                      <span>Last Audited:</span>
                      <span className="text-onyx-fg font-bold">
                        {data.lastAnalyzedAt 
                          ? new Date(data.lastAnalyzedAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "Never"}
                      </span>
                    </p>
                    <p className="font-mono text-3xs text-onyx-subtle flex justify-between">
                      <span>Analysis Version:</span>
                      <span className="text-onyx-fg">v{data.version}</span>
                    </p>
                  </div>
                </div>
              </Panel>
            )}
          </div>
        </div>

        {/* Parsed Sections Editor */}
        {data && !displayUpload && (
          <div className="lg:col-span-8 space-y-4">
            <Panel title="Identified Resume Sections" className="p-4">
              <div className="space-y-6">
                <p className="font-mono text-3xs text-onyx-muted">
                  Review the extracted contents. Edits here will automatically save on blur and update scores.
                </p>

                <div className="space-y-4">
                  {data.sections.map((s) => (
                    <div 
                      key={s.id}
                      className="border border-graphite-border/30 rounded bg-carbon-light/10 p-3 hover:border-graphite-border/60 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="cyber" className="capitalize">
                            {s.type}
                          </Badge>
                          <span className="font-mono text-3xs text-onyx-muted">Section score</span>
                        </div>
                        <span className={`font-mono text-2xs font-bold ${getScoreTextClass(s.score)}`}>
                          {s.score}%
                        </span>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="w-full h-1 bg-graphite-border/30 rounded-full overflow-hidden mb-3">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${getScoreColorClass(s.score)}`} 
                          style={{ width: `${s.score}%` }}
                        />
                      </div>

                      <textarea
                        className="w-full min-h-[100px] resize-y border border-graphite-border/20 bg-carbon/60 p-2 font-mono text-2xs text-onyx-fg outline-none focus:border-neon-cyan/40 focus:bg-carbon rounded transition-all"
                        defaultValue={s.content}
                        placeholder={`Enter details for ${s.type}...`}
                        onBlur={(e) => {
                          if (e.target.value !== s.content) {
                            patchMutation.mutate({ sectionId: s.id, content: e.target.value });
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}
