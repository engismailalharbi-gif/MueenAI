"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED = [
  "How do I reset my password?",
  "What is your refund policy?",
  "How can I track my order?",
];

function BotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history: messages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setMessages([...next, { role: "assistant", content: data.response }]);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  return (
    <main className="min-h-screen bg-[#0F172A] flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-2xl h-screen sm:h-[calc(100vh-2rem)] flex flex-col sm:rounded-2xl overflow-hidden shadow-2xl border-0 sm:border sm:border-[#1E293B]">

        {/* ── Header ── */}
        <div className="bg-[#1E293B] border-b border-[#334155] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BotIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm leading-none">Support AI</h1>
              <p className="text-[#94A3B8] text-xs mt-0.5">Powered by Claude</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">Online</span>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center gap-2 flex-shrink-0">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-xs flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Chat area ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0F172A]">

          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center">
                <BotIcon className="w-8 h-8 text-indigo-400" />
              </div>
              <div className="text-center">
                <h2 className="text-white font-semibold text-lg mb-1">How can we help?</h2>
                <p className="text-[#94A3B8] text-sm max-w-xs leading-relaxed">
                  Our AI support agent is here 24/7. Ask anything or pick a topic below.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 rounded-xl bg-[#1E293B] border border-[#334155] text-[#CBD5E1] text-sm hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-white transition-all duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mb-1 shadow-md shadow-indigo-500/20">
                  <BotIcon className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/20"
                    : "bg-[#1E293B] text-[#E2E8F0] rounded-bl-sm border border-[#334155]"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mb-1 shadow-md shadow-indigo-500/20">
                <BotIcon className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[#1E293B] border border-[#334155] px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div className="bg-[#1E293B] border-t border-[#334155] p-4 flex-shrink-0">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Describe your issue… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 bg-[#0F172A] text-[#E2E8F0] placeholder-[#475569] text-sm rounded-xl px-4 py-3 resize-none outline-none border border-[#334155] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 min-h-[44px]"
              style={{ maxHeight: "120px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <SpinnerIcon className="w-4 h-4 text-white animate-spin" />
              ) : (
                <SendIcon className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
          <p className="text-[#475569] text-xs mt-2.5 text-center">
            AI-powered support · Responses may not always be fully accurate
          </p>
        </div>

      </div>
    </main>
  );
}
