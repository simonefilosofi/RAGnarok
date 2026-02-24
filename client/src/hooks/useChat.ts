import { useCallback, useState } from "react";
import { streamChat } from "../lib/api";
import { supabase } from "../lib/supabase";
import { useSessionStore } from "../store/sessionStore";
import type { Message } from "../types";

function makeId() {
  return crypto.randomUUID();
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const groqKey = useSessionStore((s) => s.groqKey);

  const sendMessage = useCallback(
    async (question: string) => {
      if (streaming) return;
      setError(null);

      const userMsg: Message = {
        id: makeId(),
        role: "user",
        content: question,
        created_at: new Date().toISOString(),
      };

      const assistantId = makeId();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreaming(true);

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error("Not authenticated");

        for await (const token_chunk of streamChat(question, token, groqKey)) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + token_chunk } : m
            )
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chat failed");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Error: " + (err instanceof Error ? err.message : "Unknown error") }
              : m
          )
        );
      } finally {
        setStreaming(false);
      }
    },
    [streaming, groqKey]
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, streaming, error, sendMessage, clearMessages };
}
