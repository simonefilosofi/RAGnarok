import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { ChatInput } from "../components/chat/ChatInput";
import { ChatWindow } from "../components/chat/ChatWindow";
import { DocumentsView } from "../components/documents/DocumentsView";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { GroqKeyModal } from "../components/ui/GroqKeyModal";
import { useChat } from "../hooks/useChat";
import { useSessionStore } from "../store/sessionStore";

type View = "chat" | "documents";

interface AppPageProps {
  user: User;
  onSignOut: () => void;
}

export function AppPage({ user, onSignOut }: AppPageProps) {
  const { messages, streaming, sendMessage, newSession, deleteSession, sessions, activeSessionId, loadSession } = useChat();
  const groqKey = useSessionStore((s) => s.groqKey);
  const [keyModalOpen, setKeyModalOpen] = useState(!groqKey);
  const [view, setView] = useState<View>("chat");

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <Header user={user} onSignOut={onSignOut} view={view} onViewChange={setView} />
      <div className="flex flex-1 overflow-hidden">
        {view === "chat" && (
          <Sidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={loadSession}
            onNewChat={newSession}
            onDeleteSession={deleteSession}
          />
        )}
        <main className="flex flex-col flex-1 overflow-hidden">
          {view === "chat" ? (
            <>
              <ChatWindow messages={messages} streaming={streaming} />
              <ChatInput onSend={sendMessage} disabled={streaming} />
            </>
          ) : (
            <DocumentsView />
          )}
        </main>
      </div>
      <GroqKeyModal open={keyModalOpen} onClose={() => setKeyModalOpen(false)} />
    </div>
  );
}
