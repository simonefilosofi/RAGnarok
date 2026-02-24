import type { User } from "@supabase/supabase-js";
import { ChatInput } from "../components/chat/ChatInput";
import { ChatWindow } from "../components/chat/ChatWindow";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { KeySetupBanner } from "../components/ui/KeySetupBanner";
import { useChat } from "../hooks/useChat";

interface AppPageProps {
  user: User;
  onSignOut: () => void;
}

export function AppPage({ user, onSignOut }: AppPageProps) {
  const { messages, streaming, sendMessage, newSession, sessions, activeSessionId, loadSession } = useChat();

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header user={user} onSignOut={onSignOut} onNewChat={newSession} />
      <KeySetupBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={loadSession}
          onNewChat={newSession}
        />
        <main className="flex flex-col flex-1 overflow-hidden">
          <ChatWindow messages={messages} streaming={streaming} />
          <ChatInput onSend={sendMessage} disabled={streaming} />
        </main>
      </div>
    </div>
  );
}
