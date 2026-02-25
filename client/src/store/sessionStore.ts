import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  groqKey: string;
  setGroqKey: (key: string) => void;
  clearGroqKey: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      groqKey: "",
      setGroqKey: (key) => set({ groqKey: key }),
      clearGroqKey: () => set({ groqKey: "" }),
    }),
    { name: "ragnarok-session" }
  )
);
