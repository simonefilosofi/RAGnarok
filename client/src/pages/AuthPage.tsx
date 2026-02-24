import { useState } from "react";
import { LoginForm } from "../components/auth/LoginForm";
import { SignupForm } from "../components/auth/SignupForm";

type Tab = "login" | "signup";

export function AuthPage() {
  const [tab, setTab] = useState<Tab>("login");

  const tabClass = (t: Tab) =>
    `flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      tab === t
        ? "bg-white text-gray-900 shadow-sm"
        : "text-gray-500 hover:text-gray-700"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">⚡</span>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">RAGnarok</h1>
          <p className="mt-2 text-gray-600">Your AI-powered knowledge base</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
            <button className={tabClass("login")} onClick={() => setTab("login")}>
              Sign In
            </button>
            <button className={tabClass("signup")} onClick={() => setTab("signup")}>
              Sign Up
            </button>
          </div>

          {tab === "login" ? <LoginForm /> : <SignupForm />}
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Zero-cost · Multi-user · BYOK (Groq) · Open Source
        </p>
      </div>
    </div>
  );
}
