import type { User } from "@supabase/supabase-js";
import { Button } from "../ui/Button";

interface HeaderProps {
  user: User;
  onSignOut: () => void;
  onNewChat: () => void;
}

export function Header({ user, onSignOut, onNewChat }: HeaderProps) {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-brand-600">⚡ RAGnarok</span>
        <Button variant="ghost" size="sm" onClick={onNewChat}>
          + New Chat
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
        <Button variant="secondary" size="sm" onClick={onSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
