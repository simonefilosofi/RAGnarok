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
  onDeleteSession: (id: string) => void;
}


export function Sidebar({ sessions, activeSessionId, onSelectSession, onNewChat, onDeleteSession }: SidebarProps) {
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
    <aside className="w-72 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col h-full shrink-0">
      <div className="flex-1 overflow-y-auto">
        {/* Chats section */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Chats
            </h2>
            <Button size="sm" variant="secondary" onClick={onNewChat}>
              + New
            </Button>
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

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 mx-4 my-1" />

        {/* Documents section */}
        <div className="p-4 pt-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
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
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
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
