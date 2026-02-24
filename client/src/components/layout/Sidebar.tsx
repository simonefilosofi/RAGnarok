import { useState } from "react";
import { useDocuments } from "../../hooks/useDocuments";
import { useSessionStore } from "../../store/sessionStore";
import type { ChatSession } from "../../types";
import { DocumentList } from "../documents/DocumentList";
import { UploadModal } from "../documents/UploadModal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

function formatSessionDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function Sidebar({ sessions, activeSessionId, onSelectSession, onNewChat }: SidebarProps) {
  const { documents, remove } = useDocuments();
  const { groqKey, setGroqKey, clearGroqKey } = useSessionStore();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [keyInput, setKeyInput] = useState(groqKey);
  const [keyError, setKeyError] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    if (trimmed && !/^gsk_[a-zA-Z0-9]{50,}$/.test(trimmed)) {
      setKeyError("Must start with gsk_ followed by 50+ alphanumeric characters");
      return;
    }
    setKeyError("");
    if (trimmed) setGroqKey(trimmed);
    else clearGroqKey();
  };

  return (
    <aside className="w-72 border-r border-gray-200 bg-gray-50 flex flex-col h-full shrink-0">
      <div className="flex-1 overflow-y-auto">
        {/* Chats section */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Chats
            </h2>
            <Button size="sm" variant="secondary" onClick={onNewChat}>
              + New
            </Button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No conversations yet.</p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onSelectSession(s.id)}
                      className={`w-full text-left px-2 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-brand-100 text-brand-700 font-medium"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="block truncate">{s.title}</span>
                      <span className="block text-xs text-gray-400 mt-0.5">
                        {formatSessionDate(s.created_at)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mx-4 my-1" />

        {/* Documents section */}
        <div className="p-4 pt-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Documents
            </h2>
            <Button size="sm" variant="secondary" onClick={() => setUploadOpen(true)}>
              + Add
            </Button>
          </div>
          <DocumentList documents={documents} onDelete={remove} />
        </div>
      </div>

      {/* Settings section */}
      <div className="border-t border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Groq API Key
        </h3>
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setKeyError("");
              }}
              placeholder="gsk_..."
              error={keyError}
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          <Button size="sm" onClick={handleSaveKey} className="w-full">
            {groqKey ? "Update Key" : "Save Key"}
          </Button>
          {groqKey && (
            <p className="text-xs text-green-600 text-center">✓ Key set (in-memory only)</p>
          )}
        </div>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </aside>
  );
}
