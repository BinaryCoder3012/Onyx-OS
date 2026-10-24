"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useOnyx } from "@/lib/store";
import { workspaceSnapshot } from "@/lib/context";
import { readError } from "@/lib/util";
import { Button } from "@/components/ui";
import { Markdown } from "./Markdown";
import { useShell } from "./ui-store";

gsap.registerPlugin(useGSAP);

const STARTERS = [
  "What should I practise this week?",
  "Why has my rating stalled?",
  "Which opening should I apply to first?",
  "Turn my weakest topic into a 10-problem set",
];

/** The assistant drawer. Every question carries a snapshot of the workspace. */
export function Ask() {
  const open = useShell((s) => s.askOpen);
  const input = useShell((s) => s.askDraft);
  const setInput = useShell((s) => s.setDraft);
  const setAsk = useShell((s) => s.setAsk);
  const chat = useOnyx((s) => s.chat);
  const pushChat = useOnyx((s) => s.pushChat);
  const patchChat = useOnyx((s) => s.patchChat);
  const clearChat = useOnyx((s) => s.clearChat);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abort = useRef<AbortController | null>(null);

  useGSAP(
    () => {
      if (!panel.current) return;
      gsap.to(panel.current, {
        x: open ? 0 : "104%",
        duration: open ? 0.55 : 0.35,
        ease: open ? "expo.out" : "power2.in",
      });
    },
    { dependencies: [open] },
  );

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [chat]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setError("");
    setBusy(true);
    pushChat({ role: "user", content: q });
    const replyId = pushChat({ role: "assistant", content: "" });
    const state = useOnyx.getState();
    const history = state.chat
      .filter((t) => t.id !== replyId && t.content)
      .slice(-16)
      .map(({ role, content }) => ({ role, content }));

    abort.current = new AbortController();
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context: workspaceSnapshot(state) }),
        signal: abort.current.signal,
      });
      if (!res.ok || !res.body) throw new Error(await readError(res));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        patchChat(replyId, acc);
      }
      if (!acc.trim()) patchChat(replyId, "The model returned nothing. Try asking again.");
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        const cur = useOnyx.getState().chat.find((t) => t.id === replyId);
        if (!cur?.content) patchChat(replyId, "Stopped.");
      } else {
        useOnyx.setState((s) => ({ chat: s.chat.filter((t) => t.id !== replyId) }));
        setError(err instanceof Error ? err.message : "Could not reach the model.");
      }
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setAsk(false)} aria-hidden />}
      <aside
        ref={panel}
        aria-label="Ask Onyx"
        aria-hidden={!open}
        inert={!open}
        style={{ transform: "translateX(104%)" }}
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-seam bg-slab sm:w-[440px]"
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-seam px-4">
          <div>
            <h2 className="text-[15px] font-semibold">Ask Onyx</h2>
          </div>
          <div className="flex items-center gap-1">
            {chat.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearChat} disabled={busy}>
                Clear
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setAsk(false)} aria-label="Close assistant">
              Close <kbd className="text-[11px] text-chalk-3">Esc</kbd>
            </Button>
          </div>
        </header>

        <div ref={scroller} className="scroll-quiet flex-1 space-y-5 overflow-y-auto px-4 py-5">
          {chat.length === 0 && (
            <div>
              <p className="text-[14px] leading-relaxed text-chalk-2">
                Ask about anything in your workspace. Each question sends a short snapshot of your problems, ratings,
                roadmap, resume and openings, so the answer is about you.
              </p>
              <div className="mt-4 flex flex-col items-start gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-lg border border-seam-strong px-3 py-2 text-left text-[14px] text-chalk hover:border-chalk-3"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chat.map((t) =>
            t.role === "user" ? (
              <div key={t.id} className="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-shelf px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap text-chalk">
                {t.content}
              </div>
            ) : (
              <div key={t.id} className="answer text-[14px] leading-relaxed text-chalk-2">
                {t.content ? <Markdown text={t.content} /> : <span className="text-chalk-3">Reading your workspace…</span>}
              </div>
            ),
          )}
          {error && (
            <p role="alert" className="text-[13px] text-bad">
              {error}
            </p>
          )}
        </div>

        <form
          className="shrink-0 border-t border-seam p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <div className="flex items-end gap-2 rounded-xl border border-seam-strong bg-onyx p-2 focus-within:border-sard">
            <label htmlFor="ask-input" className="sr-only">
              Your question
            </label>
            <textarea
              id="ask-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
                if (e.key === "Escape") setAsk(false);
              }}
              rows={2}
              placeholder="Ask about your ratings, plan or applications"
              className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-1.5 py-1 text-[14px] leading-relaxed text-chalk placeholder:text-chalk-3 focus:outline-none"
            />
            {busy ? (
              <Button size="sm" onClick={() => abort.current?.abort()}>
                Stop
              </Button>
            ) : (
              <Button type="submit" variant="primary" size="sm" disabled={!input.trim()}>
                Ask
              </Button>
            )}
          </div>
        </form>
      </aside>
    </>
  );
}
