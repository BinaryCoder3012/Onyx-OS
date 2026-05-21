"use client";

import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Button, LoadingState, Panel } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useOnyxStore } from "@/store/useOnyxStore";
import type { OnyxContext, OnyxPreferences } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ProfilePayload {
  user: { email: string; displayName: string };
  profile: unknown;
}

export function SettingsModule() {
  const qc = useQueryClient();
  const setContext = useOnyxStore((s) => s.setContext);
  const context = useOnyxStore((s) => s.context);
  const prefs = context?.preferences;

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<ProfilePayload>("/api/profile"),
  });

  const saveMutation = useMutation({
    mutationFn: (preferences: OnyxPreferences) =>
      apiFetch<{ context: OnyxContext | null }>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ preferences }),
      }),
    onSuccess: (res) => {
      if (res.context) setContext(res.context);
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  if (isLoading || !data) return <LoadingState label="Loading settings" />;

  const current: OnyxPreferences = prefs ?? {
    density: "compact",
    keyboardHints: true,
    commandPaletteEnabled: true,
  };

  const toggle = (key: keyof OnyxPreferences) => {
    if (typeof current[key] === "boolean") {
      saveMutation.mutate({ ...current, [key]: !current[key] });
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <ModuleHeader title="Settings" subtitle="Operator preferences" status="idle" />
      <Panel title="Account" className="p-4 font-mono text-2xs">
        <p className="text-onyx-fg">{data.user.displayName}</p>
        <p className="text-onyx-muted">{data.user.email}</p>
      </Panel>
      <Panel title="Preferences" className="space-y-3 p-4 font-mono text-2xs">
        <label className="flex items-center justify-between">
          <span className="text-onyx-muted">Keyboard hints</span>
          <Button variant="outline" onClick={() => toggle("keyboardHints")}>
            {current.keyboardHints ? "On" : "Off"}
          </Button>
        </label>
        <label className="flex items-center justify-between">
          <span className="text-onyx-muted">Command palette</span>
          <Button variant="outline" onClick={() => toggle("commandPaletteEnabled")}>
            {current.commandPaletteEnabled ? "On" : "Off"}
          </Button>
        </label>
        <label className="flex items-center justify-between">
          <span className="text-onyx-muted">Density</span>
          <Button
            variant="outline"
            onClick={() =>
              saveMutation.mutate({
                ...current,
                density: current.density === "compact" ? "comfortable" : "compact",
              })
            }
          >
            {current.density}
          </Button>
        </label>
      </Panel>
      <Panel title="Data Privacy & Security" className="space-y-3 p-4 font-mono text-2xs">
        <div className="flex flex-col gap-2 rounded border border-graphite-border bg-carbon-elevated p-3">
          <div className="flex items-center gap-2 text-neon-cyan">
            <span className="text-sm">🛡️</span>
            <span className="font-bold">Your Data is Private</span>
          </div>
          <p className="text-onyx-muted">
            Onyx OS respects your privacy. Your code, API keys, and personal data are strictly used for your active session and platform integration. We <strong className="text-onyx-fg">never</strong> use your data to train our AI models, and we do not share your profile with third parties.
          </p>
          <div className="mt-2 text-[10px] text-graphite-muted">
            AI features are powered by your configured API provider (e.g. Gemini, OpenAI) utilizing their respective API data policies.
          </div>
        </div>
      </Panel>
    </div>
  );
}
