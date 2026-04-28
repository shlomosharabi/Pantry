import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Btn } from "./UI";

function useMembersOf(homeId) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!homeId) return;
    const unsubscribe = onSnapshot(
      collection(db, "homes", homeId, "members"),
      (snap) => setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    return unsubscribe;
  }, [homeId]);

  return members;
}

export default function HomeMenu({
  homes,
  activeHome,
  onSwitch,
  onCreateHome,
  onJoinHome,
  onLeave,
  onDeleteHome,
  onRemoveMember,
  user,
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("list");
  const [homeName, setHomeName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const members = useMembersOf(activeHome?.id);
  const isAdmin = activeHome?.createdBy === user?.uid;

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

  async function handleRemoveMember(memberId) {
    setLoading(true);
    await onRemoveMember(activeHome.id, memberId);
    setLoading(false);
  }

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
          <div className="absolute left-[-5] top-11 z-50 w-64 bg-ink-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            {/* ── רשימת בתים ── */}
            {view === "list" && (
              <>
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="text-[10px] font-mono text-mist-400/50">
                    הבתים שלי
                  </p>
                </div>
                <div className="max-h-40 overflow-y-auto">
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
                    <>
                      <button
                        onClick={() => setView("invite")}
                        className="w-full text-right px-3 py-2 text-xs text-mist-400 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        📋 הצג קוד הזמנה
                      </button>
                      <button
                        onClick={() => setView("members")}
                        className="w-full text-right px-3 py-2 text-xs text-mist-400 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        👥 חברי הבית ({members.length})
                      </button>
                    </>
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

            {/* ── חברי הבית ── */}
            {view === "members" && (
              <div>
                <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                  <p className="text-[10px] font-mono text-mist-400/50">
                    חברי הבית
                  </p>
                  <button
                    onClick={() => setView("list")}
                    className="text-[10px] text-mist-400/50 hover:text-mist-300"
                  >
                    חזור
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/3"
                    >
                      {/* אווטאר */}
                      <div className="w-7 h-7 rounded-full bg-mist-500/20 flex items-center justify-center text-xs text-mist-300 flex-shrink-0 overflow-hidden">
                        {member.photoURL ? (
                          <img
                            src={member.photoURL}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (
                            member.displayName?.[0] ??
                            member.email?.[0] ??
                            "?"
                          ).toUpperCase()
                        )}
                      </div>
                      {/* שם */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-mist-200 truncate">
                          {member.displayName ?? member.email}
                        </p>
                        <p className="text-[10px] font-mono text-mist-400/50">
                          {member.role === "admin" ? "👑 מנהל" : "חבר"}
                        </p>
                      </div>
                      {/* הסרה — admin בלבד, לא על עצמו */}
                      {isAdmin && member.id !== user.uid && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={loading}
                          className="text-rose-400/50 hover:text-rose-400 transition-colors text-xs px-1"
                          title="הסר חבר"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── מחיקת בית ── */}
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

            {/* ── קוד הזמנה ── */}
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

            {/* ── צור בית ── */}
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

            {/* ── הצטרף ── */}
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
