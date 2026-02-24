import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { Button } from "../ui/Button";
import { SettingsModal } from "../ui/SettingsModal";

interface HeaderProps {
  user: User;
  onSignOut: () => void;
  onNewChat: () => void;
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

export function Header({ user, onSignOut, onNewChat }: HeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-brand-600">⚡ RAGnarok</span>
          <Button variant="ghost" size="sm" onClick={onNewChat}>
            + New Chat
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
            {user.email}
          </span>
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
