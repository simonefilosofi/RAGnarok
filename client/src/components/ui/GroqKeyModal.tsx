import { useState } from "react";
import { useSessionStore } from "../../store/sessionStore";

interface GroqKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export function GroqKeyModal({ open, onClose }: GroqKeyModalProps) {
  const { setGroqKey } = useSessionStore();
  const [input, setInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSave = () => {
    const trimmed = input.trim();
    if (!/^gsk_[a-zA-Z0-9]{50,}$/.test(trimmed)) {
      setError("Key must start with gsk_ followed by 50+ alphanumeric characters.");
      return;
    }
    setGroqKey(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-[#1c1d2b] p-7 shadow-2xl">

        {/* Header */}
        <h2 className="text-2xl font-bold text-white mb-1">Enter your Groq API Key</h2>
        <p className="text-sm text-gray-400 mb-6">
          Your key is stored in memory only and cleared when you close this tab.
          It is never saved to a database or local storage.
        </p>

        {/* Instruction card */}
        <div className="rounded-xl bg-[#252637] p-5 mb-6">
          <p className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-3">
            How to get a free Groq API key
          </p>
          <ol className="flex flex-col gap-2 text-sm text-gray-200">
            <li>
              1. Go to{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-gray-200 hover:text-white"
              >
                console.groq.com
              </a>{" "}
              and create a free account.
            </li>
            <li>
              2. Navigate to <span className="font-bold">API Keys</span> in the sidebar.
            </li>
            <li>
              3. Click <span className="font-bold">&ldquo;Create API Key&rdquo;</span> and give it a name.
            </li>
            <li>
              4. Copy the key — it starts with{" "}
              <code className="px-1.5 py-0.5 rounded bg-[#1c1d2b] text-amber-400 text-xs font-mono border border-amber-400/30">
                gsk_
              </code>
              .
            </li>
            <li>5. Paste it below.</li>
          </ol>
          <p className="mt-4 text-xs text-gray-500">
            Groq's free tier provides fast Llama 3.1 8B inference at no cost.
          </p>
        </div>

        {/* Input */}
        <div className="relative mb-3">
          <input
            type={showKey ? "text" : "password"}
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            placeholder="gsk_..."
            className="w-full rounded-xl bg-[#252637] border border-[#353650] text-gray-100 placeholder-gray-500 px-4 py-3 text-sm pr-16 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-200"
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 text-sm transition-colors"
        >
          Save key &amp; continue
        </button>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-gray-500">
          You can update your key at any time via the sidebar.{" "}
          <button
            type="button"
            onClick={onClose}
            className="underline hover:text-gray-300 transition-colors"
          >
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
}
