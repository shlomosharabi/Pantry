import { useState } from "react";
import {
  useInventory,
  useShopping,
  useAuth,
  useHome,
  expiryStatus,
} from "./hooks/useStorage";
import InventoryTab from "./components/InventoryTab";
import ShoppingTab from "./components/ShoppingTab";
import HomeScreen from "./components/HomeScreen";
import HomeMenu from "./components/HomeMenu";

const TABS = [
  { id: "inventory", label: "מלאי", emoji: "🏠" },
  { id: "shopping", label: "קניות", emoji: "🛒" },
];

function AlertBanner({ items }) {
  const urgent = items.filter((i) => {
    const s = expiryStatus(i.expiresAt);
    return s === "expired" || s === "soon";
  });
  if (!urgent.length) return null;
  const expired = urgent.filter((i) => expiryStatus(i.expiresAt) === "expired");
  const soon = urgent.filter((i) => expiryStatus(i.expiresAt) === "soon");

  return (
    <div className="mx-4 mb-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
      <p className="text-xs font-mono text-amber-400/80">
        {expired.length > 0 &&
          `${expired.length} פריט${expired.length > 1 ? "ים" : ""} פג תוקף`}
        {expired.length > 0 && soon.length > 0 && " · "}
        {soon.length > 0 && `${soon.length} פגים תוקף תוך 3 ימים`}
      </p>
      <p className="text-xs text-amber-400/50 mt-0.5">
        {urgent.map((i) => i.name).join(", ")}
      </p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-ink-900 text-mist-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mist-400"></div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
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

function UserMenu({ user, isAnonymous, onSignIn, onSignOut }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
      >
        {isAnonymous ? (
          <span className="text-xs font-mono text-mist-400/70">אורח</span>
        ) : (
          <>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                className="w-5 h-5 rounded-full"
                alt=""
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-mist-500/30 flex items-center justify-center text-[10px] text-mist-300">
                {user.displayName?.[0] ?? user.email?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <span className="text-xs font-mono text-mist-300 max-w-[60px] truncate">
              {user.displayName?.split(" ")[0]}
            </span>
          </>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-10 z-50 w-56 max-w-[calc(100vw-2rem)] bg-ink-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            {isAnonymous ? (
              <button
                onClick={() => {
                  onSignIn();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-mist-200 hover:bg-white/5 transition-colors"
              >
                <GoogleIcon />
                התחבר עם Google
              </button>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs text-mist-400/60 font-mono">
                    מחובר בתור
                  </p>
                  <p className="text-sm text-mist-200 font-medium truncate mt-0.5">
                    {user.displayName ?? user.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onSignOut();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400/80 hover:bg-white/5 transition-colors"
                >
                  התנתק
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const authState = useAuth();
  const homeState = useHome(authState.user);
  const [tab, setTab] = useState("inventory");

  const activeHomeId = homeState.activeHomeId;
  const inv = useInventory(authState.user, activeHomeId);
  const shop = useShopping(authState.user, activeHomeId);

  if (authState.loading || homeState.loading) {
    return <LoadingSpinner />;
  }

  // משתמש מחובר עם Google אבל אין לו בית — הצג מסך יצירה/הצטרפות
  if (!authState.isAnonymous && homeState.homes.length === 0) {
    return (
      <HomeScreen
        onCreateHome={homeState.createHome}
        onJoinHome={homeState.joinHome}
        onSignIn={authState.signInWithGoogle}
        isAnonymous={authState.isAnonymous}
      />
    );
  }

  async function handleMoveToInventory(id) {
    const item = await shop.popItem(id);
    if (item) {
      inv.addItem({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expiresAt: null,
      });
    }
  }

  async function handleMoveToShopping(id) {
    const item = await inv.popItemToShopping(id);
    if (item) {
      shop.addItem({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      });
    }
  }

  return (
    <div className="min-h-screen bg-ink-900 text-mist-100 flex flex-col">
      <header className="sticky top-0 z-40 px-4 pt-safe-top">
        <div className="flex items-center justify-between py-4">
          {/* בחירת בית — רק למשתמשים מחוברים עם Google */}
          {!authState.isAnonymous ? (
            <HomeMenu
              homes={homeState.homes}
              activeHome={homeState.activeHome}
              onSwitch={homeState.setActiveHomeId}
              onCreateHome={homeState.createHome}
              onJoinHome={homeState.joinHome}
              onLeave={homeState.leaveHome}
              onDeleteHome={homeState.deleteHome}
              user={authState.user}
            />
          ) : (
            <div>
              <h1 className="text-xl font-semibold tracking-tight">מזווה</h1>
              <p className="text-xs font-mono text-mist-400/50 -mt-0.5">
                {inv.items.length} פריטים ·{" "}
                {shop.items.filter((i) => !i.done).length} לקנות
              </p>
            </div>
          )}

          <UserMenu
            user={authState.user}
            isAnonymous={authState.isAnonymous}
            onSignIn={authState.signInWithGoogle}
            onSignOut={authState.signOut}
          />
        </div>

        <div className="flex gap-1 bg-white/4 p-1 rounded-2xl mb-3 border border-white/5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === t.id ? "bg-mist-500/20 text-mist-200 shadow-sm" : "text-mist-400/60 hover:text-mist-300"}`}
            >
              <span>{t.emoji}</span>
              {t.label}
              {t.id === "shopping" &&
                shop.items.filter((i) => !i.done).length > 0 && (
                  <span className="text-[10px] font-mono bg-mist-500/30 text-mist-300 px-1.5 py-0.5 rounded-full">
                    {shop.items.filter((i) => !i.done).length}
                  </span>
                )}
            </button>
          ))}
        </div>
      </header>

      {tab === "inventory" && <AlertBanner items={inv.items} />}

      <main className="flex-1 px-4 pb-8">
        {tab === "inventory" ? (
          <InventoryTab
            items={inv.items}
            onAdd={inv.addItem}
            onUpdate={inv.updateItem}
            onMoveToShopping={handleMoveToShopping}
            onDelete={inv.deleteItem}
            loading={inv.loading}
          />
        ) : (
          <ShoppingTab
            items={shop.items}
            onAdd={shop.addItem}
            onToggle={shop.toggleDone}
            onRemove={shop.removeItem}
            onMoveToInventory={handleMoveToInventory}
            loading={shop.loading}
          />
        )}
      </main>
    </div>
  );
}
