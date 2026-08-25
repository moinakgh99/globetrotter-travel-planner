import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AppRoutes from "./routes/AppRoutes";
import { authClient } from "./auth";

function App() {
  const [isSyncing, setIsSyncing] = useState(() => sessionStorage.getItem('oauth_pending') === 'true');

  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        // Only attempt sync if we are in oauth_pending state
        if (!sessionStorage.getItem('oauth_pending')) return;

        // Wait for Neon Auth to finish processing the OAuth redirect
        await new Promise(res => setTimeout(res, 800));

        // Use getSession() — the only supported method for this Neon Auth setup
        let sessionResult = null;
        try {
          sessionResult = await authClient.getSession();
        } catch (e) {
          // getSession throws if no session exists — that's fine, just skip
          console.log("No active Neon Auth session found.");
          return;
        }

        // Better Auth returns: { data: { user: {...}, session: {...} } }
        const user = sessionResult?.data?.user;

        if (!user || !user.email) {
          console.log("No Google user in session to sync.");
          return;
        }

        console.log("Syncing Google user with backend...", user.email);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/sync`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              picture: user.image || user.picture || user.avatarUrl
            })
          }
        );

        const data = await response.json();
        if (response.ok && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log("Successfully synced Google user to database! ID:", data.user?.id);
        } else {
          console.error("Sync endpoint returned error:", data);
        }
      } catch (err) {
        console.error("Auth sync unexpected error:", err);
      } finally {
        sessionStorage.removeItem('oauth_pending');
        setIsSyncing(false);
      }
    };

    syncWithBackend();
  }, []);

  if (isSyncing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Completing your login...</p>
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;
