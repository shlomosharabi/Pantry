import { useState } from "react";
import { expiryStatus } from "../hooks/useStorage";
import { Badge, IconBtn, Icons } from "./UI";
import ItemForm from "./ItemForm";

function expiryLabel(expiresAt) {
  if (!expiresAt) return null;
  const status = expiryStatus(expiresAt);
  const date = new Date(expiresAt);
  const label = date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
  });
  if (status === "expired") return <Badge variant="danger">פג {label}</Badge>;
  if (status === "soon") return <Badge variant="warn">פג {label}</Badge>;
  return <Badge variant="ok">פג {label}</Badge>;
}

function InventoryRow({ item, onEdit, onDelete, onMoveToShopping }) {
  const status = expiryStatus(item.expiresAt);
  const isUrgent = status === "expired" || status === "soon";

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all
      ${
        isUrgent
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-white/5 bg-white/3 hover:bg-white/5"
      }`}
    >
      {/* Qty pill */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center
        ${isUrgent ? "bg-amber-500/15" : "bg-mist-500/10"}`}
      >
        <span
          className={`text-sm font-mono font-semibold leading-none
          ${isUrgent ? "text-amber-400" : "text-mist-400"}`}
        >
          {item.quantity}
        </span>
        {item.unit && (
          <span className="text-[9px] font-mono text-mist-400/50 mt-0.5">
            {item.unit}
          </span>
        )}
      </div>

      {/* Name + expiry */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-mist-100 font-medium truncate">
          {item.name}
        </p>
        <div className="mt-0.5">{expiryLabel(item.expiresAt)}</div>
      </div>

      {/* Actions */}
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
        <IconBtn
          onClick={() => onMoveToShopping(item.id)}
          title="העבר לקניות"
          className="hover:text-jade-400!"
        >
          {/* חץ למטה */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </IconBtn>
        <IconBtn onClick={() => onEdit(item)} title="ערוך">
          <Icons.Edit />
        </IconBtn>
        <IconBtn
          onClick={() => onDelete(item.id)}
          title="מחק"
          className="hover:text-rose-400!"
        >
          <Icons.Trash />
        </IconBtn>
      </div>
    </div>
  );
}

export default function InventoryTab({
  items,
  onAdd,
  onUpdate,
  onMoveToShopping,
  onDelete,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = items.filter((it) =>
    it.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Sort: expired → expiring soon → ok → no expiry
  const sorted = [...filtered].sort((a, b) => {
    const order = { expired: 0, soon: 1, ok: 2, none: 3 };
    return order[expiryStatus(a.expiresAt)] - order[expiryStatus(b.expiresAt)];
  });

  function handleAdd(data) {
    onAdd(data);
    setShowForm(false);
  }

  function handleUpdate(data) {
    onUpdate(editing.id, data);
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <input
          type="search"
          placeholder="חפש במלאי…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-4 py-3
            text-sm text-mist-100 placeholder:text-mist-400/40
            focus:outline-none focus:border-mist-400/40 transition-all"
        />
      </div>

      {/* Add form toggle */}
      {showForm ? (
        <div className="bg-white/4 border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-mono text-mist-400/60 mb-3">פריט חדש</p>
          <ItemForm
            mode="inventory"
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
            border border-dashed border-mist-500/30 text-sm text-mist-400/60
            hover:border-mist-400/50 hover:text-mist-300 hover:bg-mist-500/5
            transition-all active:scale-98"
        >
          <Icons.Plus />
          הוסף למלאי
        </button>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-ink-800 border border-white/10 rounded-3xl p-5 shadow-2xl">
            <p className="text-xs font-mono text-mist-400/60 mb-3">ערוך פריט</p>
            <ItemForm
              mode="inventory"
              initial={editing}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      {items.length > 0 && (
        <div className="flex gap-3 text-xs font-mono text-mist-400/50">
          <span>{items.length} פריטים</span>
          {items.filter((i) => expiryStatus(i.expiresAt) === "soon").length >
            0 && (
            <span className="text-amber-400/70">
              ·{" "}
              {items.filter((i) => expiryStatus(i.expiresAt) === "soon").length}{" "}
              פגים בקרוב
            </span>
          )}
          {items.filter((i) => expiryStatus(i.expiresAt) === "expired").length >
            0 && (
            <span className="text-rose-400/70">
              ·{" "}
              {
                items.filter((i) => expiryStatus(i.expiresAt) === "expired")
                  .length
              }{" "}
              פגו
            </span>
          )}
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-mist-400/40">
            <p className="text-4xl mb-3">🥫</p>
            <p className="text-sm font-mono">
              {search ? "לא נמצאו פריטים התואמים לחיפוש" : "המלאי שלך ריק"}
            </p>
          </div>
        ) : (
          sorted.map((item) => (
            <InventoryRow
              key={item.id}
              item={item}
              onEdit={setEditing}
              onDelete={onDelete}
              onMoveToShopping={onMoveToShopping}
            />
          ))
        )}
      </div>
    </div>
  );
}
