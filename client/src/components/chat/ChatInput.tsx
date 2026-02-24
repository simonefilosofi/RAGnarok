import { useRef, useState } from "react";
import { useSessionStore } from "../../store/sessionStore";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const groqKey = useSessionStore((s) => s.groqKey);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !disabled && !!groqKey;

  const handleSend = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      {!groqKey && (
        <p className="text-xs text-amber-600 mb-2">Set your Groq API key above to enable chat.</p>
      )}
      <div className="flex items-end gap-2 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={groqKey ? "Ask a question… (Enter to send, Shift+Enter for newline)" : "Set Groq key to chat"}
          disabled={disabled || !groqKey}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none max-h-40 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send"
          className="shrink-0 rounded-lg bg-brand-600 p-1.5 text-white transition-colors hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1.5 text-center">
        AI answers are grounded in your uploaded documents only.
      </p>
    </div>
  );
}
