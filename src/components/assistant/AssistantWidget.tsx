"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const history = messages.slice(-5); // Send last 5 messages for context
      const response = await apiFetch<{ reply: string }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message, history }),
      });
      return response.reply;
    },
    onSuccess: (reply) => {
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const newMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: newMsg }]);
    chatMutation.mutate(newMsg);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen ? (
        <div className="flex h-96 w-80 flex-col overflow-hidden border border-graphite-border bg-graphite shadow-onyx transition-all duration-300">
          <div className="flex items-center justify-between border-b border-graphite-border bg-carbon px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
              <span className="font-mono text-xs font-bold text-onyx-fg uppercase tracking-wider">Onyx OS</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-onyx-muted hover:text-onyx-fg transition-colors font-mono"
            >
              [X]
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 onyx-scrollbar bg-carbon-deep/50">
            {messages.length === 0 && (
              <p className="text-center font-mono text-2xs text-onyx-muted mt-8">
                How can I assist your career progression today?
              </p>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "max-w-[85%] rounded-md px-3 py-2 font-mono text-2xs",
                  msg.role === "user"
                    ? "ml-auto bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                    : "mr-auto bg-graphite text-onyx-fg border border-graphite-border"
                )}
              >
                {msg.content}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="mr-auto max-w-[85%] rounded-md bg-graphite px-3 py-2 border border-graphite-border">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-onyx-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-onyx-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-onyx-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center border-t border-graphite-border bg-carbon p-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Onyx AI..."
              className="flex-1 bg-transparent px-2 py-1 font-mono text-2xs text-onyx-fg outline-none placeholder:text-onyx-muted"
            />
            <button
              type="submit"
              disabled={!input.trim() || chatMutation.isPending}
              className="px-3 py-1 font-mono text-2xs text-neon-cyan disabled:text-onyx-muted transition-colors hover:bg-neon-cyan/10 rounded"
            >
              SEND
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-none border border-neon-cyan bg-graphite text-neon-cyan shadow-onyx transition-all hover:bg-neon-cyan/10"
        >
          <span className="font-mono text-lg">✦</span>
        </button>
      )}
    </div>
  );
}
