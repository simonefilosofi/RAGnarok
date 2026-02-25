import { useEffect, useRef } from "react";
import type { Message } from "../../types";
import { ChatMessage } from "./ChatMessage";

interface ChatWindowProps {
  messages: Message[];
  streaming?: boolean;
  onSuggestion?: (text: string) => void;
}

const SUGGESTIONS = [
  { icon: "📄", text: "Summarize the document" },
  { icon: "⚖️", text: "Compare sections across documents" },
  { icon: "🔍", text: "What are the key findings?" },
  { icon: "🗂️", text: "List the main topics covered" },
];

function ThorFace() {
  return (
    <svg viewBox="0 0 120 165" width="140" height="165" xmlns="http://www.w3.org/2000/svg" aria-label="Thor">
      {/* Helmet */}
      <path d="M 18 58 Q 18 14 60 14 Q 102 14 102 58 L 102 76 Q 84 84 60 84 Q 36 84 18 76 Z" fill="#9CA3AF"/>
      {/* Left wing */}
      <path d="M 18 44 C -2 32 0 62 18 60" fill="white" stroke="#D1D5DB" strokeWidth="1"/>
      {/* Right wing */}
      <path d="M 102 44 C 122 32 120 62 102 60" fill="white" stroke="#D1D5DB" strokeWidth="1"/>
      {/* Helmet brim */}
      <rect x="13" y="60" width="94" height="11" rx="5.5" fill="#6B7280"/>
      {/* Left sideburn/hair */}
      <path d="M 20 72 Q 14 92 20 114" stroke="#FCD34D" strokeWidth="11" fill="none" strokeLinecap="round"/>
      {/* Right sideburn/hair */}
      <path d="M 100 72 Q 106 92 100 114" stroke="#FCD34D" strokeWidth="11" fill="none" strokeLinecap="round"/>
      {/* Face */}
      <ellipse cx="60" cy="108" rx="40" ry="44" fill="#FDE68A"/>
      {/* Left eyebrow – angled inward (stern) */}
      <path d="M 37 92 L 51 88" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Right eyebrow */}
      <path d="M 69 88 L 83 92" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Left eye white */}
      <ellipse cx="46" cy="101" rx="7.5" ry="7" fill="white"/>
      {/* Right eye white */}
      <ellipse cx="74" cy="101" rx="7.5" ry="7" fill="white"/>
      {/* Left iris */}
      <circle cx="47" cy="101" r="4.5" fill="#1D4ED8"/>
      {/* Right iris */}
      <circle cx="75" cy="101" r="4.5" fill="#1D4ED8"/>
      {/* Left pupil */}
      <circle cx="48" cy="100" r="2" fill="#1e293b"/>
      {/* Right pupil */}
      <circle cx="76" cy="100" r="2" fill="#1e293b"/>
      {/* Eye shine left */}
      <circle cx="50" cy="98" r="1.2" fill="white"/>
      {/* Eye shine right */}
      <circle cx="78" cy="98" r="1.2" fill="white"/>
      {/* Nose */}
      <ellipse cx="60" cy="113" rx="5" ry="4" fill="#FCD34D"/>
      <path d="M 56 115 Q 60 118 64 115" stroke="#D97706" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Mouth – slight smirk */}
      <path d="M 49 123 Q 62 132 72 123" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Beard */}
      <path d="M 28 136 Q 32 160 60 165 Q 88 160 92 136 Q 78 144 60 144 Q 42 144 28 136 Z" fill="#FCD34D"/>
      {/* Beard strands */}
      <line x1="50" y1="146" x2="47" y2="162" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="60" y1="148" x2="60" y2="164" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="70" y1="146" x2="73" y2="162" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Mustache */}
      <path d="M 50 121 Q 60 126 70 121" stroke="#D97706" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function ChatWindow({ messages, onSuggestion }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="flex flex-col items-center text-center gap-6 max-w-md w-full">
          <ThorFace />
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">RAGnarok</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Ask anything about your documents.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {SUGGESTIONS.map(({ icon, text }) => (
              <button
                key={text}
                onClick={() => onSuggestion?.(text)}
                className="flex items-start gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
              >
                <span className="text-base leading-none mt-0.5">{icon}</span>
                <span className="leading-snug">{text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
