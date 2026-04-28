import { useState } from "react";
import { Btn } from "./UI";

export default function HomeMenu({
  homes,
  activeHome,
  onSwitch,
  onCreateHome,
  onJoinHome,
  onLeave,
  onDeleteHome,
  user,
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("list");
  const [homeName, setHomeName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function close() {
    setOpen(false);
    setView("list");
    setHomeName("");
    setJoinCode("");
    setError("");
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!homeName.trim()) return;
    setLoading(true);
    await onCreateHome(homeName.trim());
    setLoading(false);
    close();
  }

  async function handleJoin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await onJoinHome(joinCode.trim());
    if (result?.error) setError(result.error);
    else close();
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    await onDeleteHome(activeHome.id);
    setLoading(false);
    close();
  }

  const isAdmin = activeHome?.createdBy === user?.uid;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all max-w-[160px]"
      >
        <span className="text-sm">🏠</span>
        <span className="text-xs font-medium text-mist-200 truncate">
          {activeHome?.name ?? "בחר בית"}
        </span>
        <span className="text-mist-400/50 text-xs">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="absolute left-[-5] top-11 z-50 w-56 bg-ink-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            {view === "list" && (
              <>
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="text-[10px] font-mono text-mist-400/50">
                    הבתים שלי
                  </p>
                </div>

                <div className="max-h-48 overflow-y-auto">
                  {homes.map((home) => (
                    <button
                      key={home.id}
                      onClick={() => {
                        onSwitch(home.id);
                        close();
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-white/5
                        ${home.id === activeHome?.id ? "text-mist-200 bg-white/5" : "text-mist-400"}`}
                    >
                      <span className="truncate">{home.name}</span>
                      {home.id === activeHome?.id && (
                        <span className="text-jade-400 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/5 p-2 flex flex-col gap-1">
                  {activeHome && (
                    <button
                      onClick={() => setView("invite")}
                      className="w-full text-right px-3 py-2 text-xs text-mist-400 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      📋 הצג קוד הזמנה
                    </button>
                  )}
                  <button
                    onClick={() => setView("create")}
                    className="w-full text-right px-3 py-2 text-xs text-mist-400 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    + צור בית חדש
                  </button>
                  <button
                    onClick={() => setView("join")}
                    className="w-full text-right px-3 py-2 text-xs text-mist-400 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    🔑 הצטרף לבית נוסף
                  </button>
                  {activeHome && !isAdmin && (
                    <button
                      onClick={() => {
                        onLeave(activeHome.id);
                        close();
                      }}
                      className="w-full text-right px-3 py-2 text-xs text-rose-400/70 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      עזוב בית
                    </button>
                  )}
                  {activeHome && isAdmin && (
                    <button
                      onClick={() => setView("delete")}
                      className="w-full text-right px-3 py-2 text-xs text-rose-400/70 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      🗑 מחק בית
                    </button>
                  )}
                </div>
              </>
            )}

            {view === "delete" && (
              <div className="p-4 space-y-3">
                <p className="text-xs font-mono text-rose-400/80">מחיקת בית</p>
                <p className="text-xs text-mist-300">
                  האם למחוק את{" "}
                  <span className="font-semibold">{activeHome?.name}</span>?
                  <br />
                  <span className="text-mist-400/60">
                    כל המלאי, הקניות והחברים יימחקו לצמיתות.
                  </span>
                </p>
                <div className="flex gap-2">
                  <Btn
                    type="button"
                    variant="ghost"
                    onClick={() => setView("list")}
                    className="flex-1 text-xs justify-center"
                  >
                    ביטול
                  </Btn>
                  <Btn
                    type="button"
                    variant="danger"
                    onClick={handleDelete}
                    className="flex-1 text-xs justify-center"
                    disabled={loading}
                  >
                    {loading ? "מוחק..." : "מחק"}
                  </Btn>
                </div>
              </div>
            )}

            {view === "invite" && (
              <div className="p-4">
                <p className="text-xs font-mono text-mist-400/60 mb-3">
                  קוד הזמנה לבית
                </p>
                <div className="bg-white/5 rounded-xl px-4 py-3 text-center mb-3">
                  <p className="text-2xl font-mono font-bold text-mist-100 tracking-widest">
                    {activeHome?.inviteCode}
                  </p>
                </div>
                <p className="text-xs text-mist-400/50 text-center mb-3">
                  שתף את הקוד עם מי שרוצה להצטרף
                </p>
                <Btn
                  variant="ghost"
                  onClick={() => setView("list")}
                  className="w-full justify-center text-xs"
                >
                  חזור
                </Btn>
              </div>
            )}

            {view === "create" && (
              <form onSubmit={handleCreate} className="p-4 space-y-3">
                <p className="text-xs font-mono text-mist-400/60">בית חדש</p>
                <input
                  placeholder="שם הבית"
                  value={homeName}
                  onChange={(e) => setHomeName(e.target.value)}
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-mist-100 placeholder:text-mist-400/40 focus:outline-none focus:border-mist-400/50"
                />
                <div className="flex gap-2">
                  <Btn
                    type="button"
                    variant="ghost"
                    onClick={() => setView("list")}
                    className="flex-1 text-xs justify-center"
                  >
                    ביטול
                  </Btn>
                  <Btn
                    type="submit"
                    variant="primary"
                    className="flex-1 text-xs justify-center"
                    disabled={loading}
                  >
                    {loading ? "..." : "צור"}
                  </Btn>
                </div>
              </form>
            )}

            {view === "join" && (
              <form onSubmit={handleJoin} className="p-4 space-y-3">
                <p className="text-xs font-mono text-mist-400/60">הצטרף לבית</p>
                <input
                  placeholder="קוד 6 תווים"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-mist-100 placeholder:text-mist-400/40 focus:outline-none focus:border-mist-400/50 tracking-widest font-mono"
                />
                {error && <p className="text-xs text-rose-400">{error}</p>}
                <div className="flex gap-2">
                  <Btn
                    type="button"
                    variant="ghost"
                    onClick={() => setView("list")}
                    className="flex-1 text-xs justify-center"
                  >
                    ביטול
                  </Btn>
                  <Btn
                    type="submit"
                    variant="primary"
                    className="flex-1 text-xs justify-center"
                    disabled={loading}
                  >
                    {loading ? "..." : "הצטרף"}
                  </Btn>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
