import { useState } from "react";
import { Input, Btn } from "./UI";

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function HomeScreen({
  onCreateHome,
  onJoinHome,
  onSignIn,
  isAnonymous,
}) {
  const [view, setView] = useState("main"); // main | create | join
  const [homeName, setHomeName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!homeName.trim()) return;
    setLoading(true);
    await onCreateHome(homeName.trim());
    setLoading(false);
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true);
    setError("");
    const result = await onJoinHome(joinCode.trim());
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  if (isAnonymous) {
    return (
      <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center p-6">
        <p className="text-4xl mb-4">🏠</p>
        <h1 className="text-2xl font-semibold text-mist-100 mb-2">
          מזווה משותף
        </h1>
        <p className="text-sm text-mist-400/60 text-center mb-8 max-w-xs">
          כדי ליצור בית משותף או להצטרף לאחד, יש להתחבר עם Google
        </p>
        <button
          onClick={onSignIn}
          className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-2xl font-medium text-sm hover:bg-gray-100 transition-all active:scale-95"
        >
          <GoogleIcon />
          התחבר עם Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center p-6">
      <p className="text-4xl mb-4">🏠</p>
      <h1 className="text-2xl font-semibold text-mist-100 mb-1">הבתים שלך</h1>
      <p className="text-sm text-mist-400/60 mb-8">אין לך בתים עדיין</p>

      {view === "main" && (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Btn
            variant="primary"
            onClick={() => setView("create")}
            className="w-full justify-center"
          >
            + צור בית חדש
          </Btn>
          <Btn
            variant="ghost"
            onClick={() => setView("join")}
            className="w-full justify-center"
          >
            הצטרף עם קוד
          </Btn>
        </div>
      )}

      {view === "create" && (
        <form onSubmit={handleCreate} className="w-full max-w-xs space-y-3">
          <Input
            placeholder="שם הבית (למשל: בית המשפחה)"
            value={homeName}
            onChange={(e) => setHomeName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <Btn
              type="button"
              variant="ghost"
              onClick={() => setView("main")}
              className="flex-1"
            >
              ביטול
            </Btn>
            <Btn
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "יוצר..." : "צור בית"}
            </Btn>
          </div>
        </form>
      )}

      {view === "join" && (
        <form onSubmit={handleJoin} className="w-full max-w-xs space-y-3">
          <Input
            placeholder="קוד הצטרפות (6 תווים)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            autoFocus
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex gap-2">
            <Btn
              type="button"
              variant="ghost"
              onClick={() => setView("main")}
              className="flex-1"
            >
              ביטול
            </Btn>
            <Btn
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "מצטרף..." : "הצטרף"}
            </Btn>
          </div>
        </form>
      )}
    </div>
  );
}
