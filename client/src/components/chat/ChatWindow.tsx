import { useEffect, useRef } from "react";
import type { Message } from "../../types";
import { ChatMessage } from "./ChatMessage";

interface ChatWindowProps {
  messages: Message[];
  streaming: boolean;
}

export function ChatWindow({ messages, streaming }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center px-8">
        <div>
          <p className="text-5xl mb-4">⚡</p>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">RAGnarok</h2>
          <p className="text-gray-500 text-sm max-w-sm">
            Upload documents in the sidebar, then ask questions to get AI-powered answers grounded
            in your knowledge base.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {streaming && (
        <div className="flex justify-start mb-4">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold mr-3 shrink-0">
            AI
          </div>
          <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
            <span className="inline-block w-1.5 h-4 bg-gray-500 rounded animate-pulse" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
