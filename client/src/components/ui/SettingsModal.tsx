import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { useSessionStore } from "../../store/sessionStore";
import { useThemeStore } from "../../store/themeStore";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onSignOut: () => void;
}

type Tab = "account" | "appearance";

export function SettingsModal({ open, onClose, user, onSignOut }: SettingsModalProps) {
  const [tab, setTab] = useState<Tab>("account");
  const { groqKey, setGroqKey, clearGroqKey } = useSessionStore();
  const { theme, toggle } = useThemeStore();

  const [keyInput, setKeyInput] = useState(groqKey);
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  if (!open) return null;

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    if (trimmed && !/^gsk_[a-zA-Z0-9]{50,}$/.test(trimmed)) {
      setKeyError("Must start with gsk_ followed by 50+ alphanumeric characters.");
      return;
    }
    setKeyError("");
    if (trimmed) setGroqKey(trimmed);
    else clearGroqKey();
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
      tab === t
        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-b-2 border-brand-600"
        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 bg-gray-50 dark:bg-gray-900/40">
          <button className={tabClass("account")} onClick={() => setTab("account")}>
            Account
          </button>
          <button className={tabClass("appearance")} onClick={() => setTab("appearance")}>
            Appearance
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">

          {tab === "account" && (
            <div className="flex flex-col gap-5">
              {/* Email */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                  Signed in as
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{user.email}</p>
              </div>

              {/* Groq key */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                  Groq API Key
                </p>
                <div className="relative mb-2">
                  <input
                    type={showKey ? "text" : "password"}
                    value={keyInput}
                    onChange={(e) => { setKeyInput(e.target.value); setKeyError(""); setKeySaved(false); }}
                    placeholder="gsk_..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-3 py-2 text-sm pr-14 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>
                {keyError && <p className="text-xs text-red-500 mb-2">{keyError}</p>}
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2 transition-colors"
                >
                  {keySaved ? "✓ Saved" : groqKey ? "Update Key" : "Save Key"}
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
                  Stored in memory only — cleared on tab close.
                </p>
              </div>

              {/* Sign out */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <button
                  type="button"
                  onClick={() => { onClose(); onSignOut(); }}
                  className="w-full rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium py-2 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {tab === "appearance" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Theme
              </p>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-600 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {theme === "dark" ? "Dark mode" : "Light mode"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                  </p>
                </div>
                {/* Toggle switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={theme === "dark"}
                  onClick={toggle}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                    theme === "dark" ? "bg-brand-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                      theme === "dark" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 mt-1">
                {/* Light option */}
                <button
                  type="button"
                  onClick={() => theme === "dark" && toggle()}
                  className={`flex-1 rounded-xl border-2 py-4 flex flex-col items-center gap-2 transition-colors ${
                    theme === "light"
                      ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <svg className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm8-8a1 1 0 110 2h-1a1 1 0 110-2h1zM5 12a1 1 0 110 2H4a1 1 0 110-2h1zm11.657-5.657a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zm-9.9 9.9a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM5.05 6.757a1 1 0 011.414 0l.707.707A1 1 0 015.757 8.878l-.707-.707a1 1 0 010-1.414zM12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Light</span>
                </button>
                {/* Dark option */}
                <button
                  type="button"
                  onClick={() => theme === "light" && toggle()}
                  className={`flex-1 rounded-xl border-2 py-4 flex flex-col items-center gap-2 transition-colors ${
                    theme === "dark"
                      ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Dark</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
