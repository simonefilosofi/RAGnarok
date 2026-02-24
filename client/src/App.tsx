import { useAuth } from "./hooks/useAuth";
import { AppPage } from "./pages/AppPage";
import { AuthPage } from "./pages/AuthPage";

export default function App() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return <AppPage user={user} onSignOut={signOut} />;
}
