import type { ChatSession } from "../../types";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export function Sidebar({ sessions, activeSessionId, onSelectSession, onNewChat, onDeleteSession }: SidebarProps) {
  return (
    <aside className="w-72 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col h-full shrink-0">
      <div className="flex-1 overflow-y-auto">
        {/* Chats section */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Chats
            </h2>
            <button
              type="button"
              onClick={onNewChat}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              + new chat
            </button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 py-2">No conversations yet.</p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <li key={s.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => onSelectSession(s.id)}
                      className={`w-full text-left px-2 py-2 pr-7 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="block truncate">{s.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                      aria-label="Delete chat"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
