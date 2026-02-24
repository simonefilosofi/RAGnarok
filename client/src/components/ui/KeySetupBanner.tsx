import { useState } from "react";
import { useSessionStore } from "../../store/sessionStore";
import { Button } from "./Button";
import { Input } from "./Input";

export function KeySetupBanner() {
  const { groqKey, setGroqKey } = useSessionStore();
  const [inputVal, setInputVal] = useState("");
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);

  if (groqKey || dismissed) return null;

  const handleSave = () => {
    const trimmed = inputVal.trim();
    if (!/^gsk_[a-zA-Z0-9]{50,}$/.test(trimmed)) {
      setError("Key must start with gsk_ followed by 50+ alphanumeric characters");
      return;
    }
    setGroqKey(trimmed);
  };

  return (
    <div className="sticky top-0 z-30 bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800">
            Set your Groq API key to enable chat. It stays in memory only.
          </p>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="gsk_..."
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setError("");
              }}
              error={error}
              className="max-w-xs"
              type="password"
            />
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-800 text-xs underline shrink-0"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
