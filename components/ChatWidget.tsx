"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils/cn";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi — I’m here to help you choose gently. Tell me what you’re looking for (hands / feet / face / body).",
    },
  ]);
  const [busy, setBusy] = React.useState(false);

  const hideOnAdmin = pathname?.startsWith("/admin");
  if (hideOnAdmin) return null;

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", content: text }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context: { path: pathname } }),
      });
      const data = await res.json();
      const reply = typeof data?.reply === "string" ? data.reply : "I’m here. Could you rephrase that gently?";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "I’m having trouble replying right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Hush Helper</p>
              <p className="text-xs text-muted-foreground">Gentle, informative, not salesy.</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border border-border bg-muted px-3 py-1.5 text-sm"
            >
              Close
            </button>
          </div>
          <div className="max-h-[50vh] space-y-3 overflow-auto p-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-fit max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-accent text-white"
                    : "mr-auto bg-muted text-foreground",
                )}
              >
                {m.content}
              </div>
            ))}
            {busy ? (
              <div className="mr-auto w-fit rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                Typing…
              </div>
            ) : null}
          </div>
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask gently…"
                disabled={busy}
              />
              <Button type="submit" disabled={busy}>
                Send
              </Button>
            </form>
            <p className="mt-2 text-[11px] text-muted-foreground">
              We don’t provide medical advice. Patch-test and choose what feels comfortable.
            </p>
          </div>
        </div>
      ) : (
        <Button onClick={() => setOpen(true)} className="rounded-full px-4">
          Chat
        </Button>
      )}
    </div>
  );
}


