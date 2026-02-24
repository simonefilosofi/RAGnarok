import { create } from "zustand";

interface SessionState {
  groqKey: string;
  setGroqKey: (key: string) => void;
  clearGroqKey: () => void;
}

/**
 * In-memory only — no persist middleware.
 * The Groq key is cleared when the page is closed.
 */
export const useSessionStore = create<SessionState>((set) => ({
  groqKey: "",
  setGroqKey: (key) => set({ groqKey: key }),
  clearGroqKey: () => set({ groqKey: "" }),
}));
