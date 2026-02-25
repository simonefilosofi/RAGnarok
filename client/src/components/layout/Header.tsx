import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { useSessionStore } from "../../store/sessionStore";
import { SettingsModal } from "../ui/SettingsModal";

type View = "chat" | "documents";

interface HeaderProps {
  user: User;
  onSignOut: () => void;
  view: View;
  onViewChange: (v: View) => void;
}

function HammerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Mjolnir: wide head + short handle */}
      <rect x="2" y="4" width="16" height="7" rx="2" />
      <rect x="9" y="11" width="4" height="8" rx="1.5" />
      <rect x="10.5" y="18" width="5" height="2" rx="1" />
    </svg>
  );
}

export function Header({ user, onSignOut, view, onViewChange }: HeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const groqKey = useSessionStore((s) => s.groqKey);

  return (
    <>
      <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 relative flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-brand-600">⚡ RAGnarok</span>
        </div>

        {/* Centered view switcher */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => onViewChange("chat")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === "chat"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <span>💬</span> Chat
            </button>
            <button
              type="button"
              onClick={() => onViewChange("documents")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === "documents"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <span>📄</span> Documents
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
            {user.email}
          </span>
          <span
            title={groqKey ? "Groq API key active" : "No Groq API key set"}
            className={`w-2 h-2 rounded-full transition-colors ${
              groqKey
                ? "bg-green-400 shadow-[0_0_6px_1px_rgba(74,222,128,0.7)]"
                : "bg-gray-500 dark:bg-gray-600"
            }`}
          />
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            <HammerIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        onSignOut={onSignOut}
      />
    </>
  );
}
