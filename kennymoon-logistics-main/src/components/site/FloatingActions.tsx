import { useMutation } from "@tanstack/react-query";
import { Loader2, MessageSquareText, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askKennymoonBot } from "@/lib/chat.functions";
import { whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Good day! I'm Moon, from Kennymoon. Ask me about our warehouse address, shipping duration, today's RMB rate, or anything else — and I'll hand you to a human on WhatsApp whenever you want.",
};

const QUICK_REPLIES = [
  "Warehouse address",
  "Shipping duration",
  "Today's RMB rate",
  "How much to ship 50kg?",
];

function MessageText({ content }: { content: string }) {
  return content.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
    if (!part.startsWith("http")) return part;
    const href = part.replace(/[.,!?]+$/, "");
    return (
      <a
        key={`${href}-${index}`}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-bold underline underline-offset-2"
      >
        Open WhatsApp
      </a>
    );
  });
}

export function FloatingActions() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const mutation = useMutation({
    mutationFn: (history: Msg[]) => askKennymoonBot({ data: { messages: history } }),
    onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.reply }]),
    onError: () =>
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Something went wrong on my side. Please reach us on WhatsApp at +234 807 434 5865 and a human will help you straight away.",
        },
      ]),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, mutation.isPending]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    mutation.mutate(next.filter((m) => m !== GREETING));
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-4 z-50 flex flex-row items-center justify-center gap-4 px-4 md:inset-x-auto md:right-6 md:bottom-6 md:flex-col md:items-end md:gap-3 md:px-0">
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with Kennymoon on WhatsApp"
          className="grid size-13 shrink-0 place-items-center rounded-full bg-leaf-gradient md:size-14 text-primary-foreground shadow-lift transition-transform duration-300 ease-out hover:-translate-y-1"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden="true">
            <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.12-.41-2.13-1.31-.79-.7-1.32-1.57-1.47-1.87-.15-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.66-.51h-.56c-.2 0-.5.07-.77.37-.27.3-1.02.99-1.02 2.42 0 1.43 1.04 2.81 1.19 3.01.15.2 2.05 3.24 5.02 4.42.7.3 1.25.48 1.68.61.71.23 1.35.2 1.86.12.57-.08 1.75-.71 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
            <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.34-1.4a9.79 9.79 0 0 0 4.7 1.2h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2Zm0 17.98h-.01a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.07.8.82-3-.19-.31a8.13 8.13 0 0 1-1.25-4.32c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.22.85 5.76 2.39a8.11 8.11 0 0 1 2.39 5.78c0 4.5-3.66 8.15-8.18 8.15Z" />
          </svg>
        </a>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close the Kennymoon assistant" : "Open the Kennymoon assistant"}
          aria-expanded={open}
          className={cn(
            "grid size-13 shrink-0 place-items-center rounded-full bg-forest md:size-14 text-gold shadow-lift transition-transform duration-300 ease-out hover:-translate-y-1",
            !open && "animate-idle-bob",
          )}
        >
          {open ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <MessageSquareText className="size-6" aria-hidden="true" />
          )}
        </button>
      </div>


      <div
        className={cn(
          "fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-sm origin-bottom flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lift transition-all duration-300 ease-out md:inset-x-auto md:right-6 md:bottom-28 md:mx-0 md:w-[24rem] md:origin-bottom-right",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0",
        )}
        role="dialog"
        aria-label="Kennymoon assistant"
        aria-hidden={!open}
      >
        <div className="bg-forest px-5 py-4 text-primary-foreground">
          <p className="text-sm font-extrabold">Ask Moon</p>
          <p className="text-xs text-primary-foreground/70">
            Kennymoon's assistant · replies in seconds
          </p>
        </div>

        <div ref={scrollRef} className="max-h-80 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              <MessageText content={m.content} />
            </div>
          ))}
          {mutation.isPending && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Moon is typing…
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-leaf hover:text-primary"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-border p-3"
        >
          <label htmlFor="bot-input" className="sr-only">
            Your message
          </label>
          <Input
            id="bot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question…"
            className="h-10"
          />
          <Button type="submit" size="icon" aria-label="Send message" disabled={mutation.isPending}>
            <Send aria-hidden="true" />
          </Button>
        </form>

        <a
          href={whatsappLink()}
          target="_blank"
          rel="noreferrer"
          className="border-t border-border bg-muted px-4 py-2.5 text-center text-xs font-semibold text-primary transition-colors hover:bg-accent"
        >
          Rather talk to a person? Chat with our team on WhatsApp →
        </a>
      </div>
    </>
  );
}
