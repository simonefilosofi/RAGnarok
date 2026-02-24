import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat } from "../lib/api";
import { supabase } from "../lib/supabase";
import { useSessionStore } from "../store/sessionStore";
import type { ChatSession, Message } from "../types";

function makeId() {
  return crypto.randomUUID();
}

function summarizeTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 45) return clean;
  const cut = clean.slice(0, 45);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut) + "…";
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const groqKey = useSessionStore((s) => s.groqKey);

  // Load all sessions and most recent session's messages on mount
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: allSessions } = await supabase
        .from("chat_sessions")
        .select("id, title, created_at")
        .order("created_at", { ascending: false });

      if (!allSessions || allSessions.length === 0) return;

      setSessions(allSessions as ChatSession[]);

      const sid = allSessions[0].id;
      sessionIdRef.current = sid;
      setActiveSessionId(sid);

      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("session_id", sid)
        .order("created_at", { ascending: true });

      if (msgs) {
        setMessages(
          msgs.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            created_at: m.created_at,
          }))
        );
      }
    };
    load();
  }, []);

  const getOrCreateSession = async (userId: string): Promise<string> => {
    if (sessionIdRef.current) return sessionIdRef.current;

    const { data } = await supabase
      .from("chat_sessions")
      .insert({ user_id: userId, title: "New Chat" })
      .select("id, title, created_at")
      .single();

    const newSession: ChatSession = {
      id: data!.id,
      title: data!.title,
      created_at: data!.created_at,
    };
    setSessions((prev) => [newSession, ...prev]);
    sessionIdRef.current = newSession.id;
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  const loadSession = useCallback(async (id: string) => {
    if (id === sessionIdRef.current) return;
    sessionIdRef.current = id;
    setActiveSessionId(id);
    setMessages([]);
    setError(null);

    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (msgs) {
      setMessages(
        msgs.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          created_at: m.created_at,
        }))
      );
    }
  }, []);

  const sendMessage = useCallback(
    async (question: string) => {
      if (streaming) return;
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const userId = sessionData.session?.user.id;
      if (!token || !userId) return;

      const wasNewSession = sessionIdRef.current === null;
      const sid = await getOrCreateSession(userId);

      if (wasNewSession) {
        const title = summarizeTitle(question);
        supabase.from("chat_sessions").update({ title }).eq("id", sid);
        setSessions((prev) => prev.map((s) => (s.id === sid ? { ...s, title } : s)));
      }

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

      // Persist user message
      await supabase.from("chat_messages").insert({
        id: userMsg.id,
        session_id: sid,
        user_id: userId,
        role: "user",
        content: question,
      });

      let fullResponse = "";
      try {
        for await (const chunk of streamChat(question, token, groqKey)) {
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        }
        // Persist assistant message
        await supabase.from("chat_messages").insert({
          id: assistantId,
          session_id: sid,
          user_id: userId,
          role: "assistant",
          content: fullResponse,
        });
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

  const newSession = useCallback(() => {
    sessionIdRef.current = null;
    setActiveSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  return { messages, streaming, error, sendMessage, newSession, sessions, activeSessionId, loadSession };
}
