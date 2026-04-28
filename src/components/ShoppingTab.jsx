import { useState } from "react";
import { IconBtn, Icons, Btn } from "./UI";
import ItemForm from "./ItemForm";

function ShoppingRow({ item, onToggle, onRemove, onMoveToInventory }) {
  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all
      ${
        item.done
          ? "border-white/3 bg-white/2 opacity-50"
          : "border-white/5 bg-white/3 hover:bg-white/5"
      }`}
    >
      <button
        onClick={() => onToggle(item.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
          ${
            item.done
              ? "bg-jade-500 border-jade-500"
              : "border-white/20 hover:border-mist-400/50"
          }`}
      >
        {item.done && <Icons.Check />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate transition-all
          ${item.done ? "line-through text-mist-400/40" : "text-mist-100"}`}
        >
          {item.name}
        </p>
        {(item.quantity > 1 || item.unit) && (
          <p className="text-xs font-mono text-mist-400/50 mt-0.5">
            {item.quantity}
            {item.unit ? ` ${item.unit}` : ""}
          </p>
        )}
      </div>

      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
        {!item.done && (
          <IconBtn
            onClick={() => onMoveToInventory(item.id)}
            title="העבר למלאי"
            className="hover:text-jade-400!"
          >
            <Icons.MoveUp />
          </IconBtn>
        )}
        <IconBtn
          onClick={() => onRemove(item.id)}
          title="הסר"
          className="hover:text-rose-400!"
        >
          <Icons.Trash />
        </IconBtn>
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
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
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

export default function ShoppingTab({
  items,
  onAdd,
  onToggle,
  onRemove,
  onMoveToInventory,
}) {
  const [showForm, setShowForm] = useState(false);

  const pending = items.filter((i) => !i.done);
  const completed = items.filter((i) => i.done);

  function handleAdd(data) {
    onAdd(data);
    setShowForm(false);
  }

  function clearDone() {
    completed.forEach((i) => onRemove(i.id));
  }

  async function handleShare() {
    // בנה את טקסט הרשימה
    const lines = pending.map((item) => {
      const qty =
        item.quantity > 1 || item.unit
          ? ` x${item.quantity}${item.unit ? ` ${item.unit}` : ""}`
          : "";
      return `• ${item.name}${qty}`;
    });

    const text = `🛒 רשימת קניות:\n${lines.join("\n")}`;

    // נסה Web Share API (עובד על מובייל)
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (e) {
        // המשתמש ביטל — לא עושים כלום
        if (e.name === "AbortError") return;
      }
    }

    // fallback — העתק ללוח
    try {
      await navigator.clipboard.writeText(text);
      alert("הרשימה הועתקה ללוח!");
    } catch {
      alert(text);
    }
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      {showForm ? (
        <div className="bg-white/4 border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-mono text-mist-400/60 mb-3">הוסף לרשימה</p>
          <ItemForm
            mode="shopping"
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
          הוסף לרשימה
        </button>
      )}

      {/* Progress bar */}
      {items.length > 0 && (
        <div>
          <div className="flex justify-between text-xs font-mono text-mist-400/50 mb-1.5">
            <span>
              {completed.length}/{items.length} הושלמו
            </span>
            <div className="flex gap-3">
              {/* כפתור שיתוף — רק אם יש פריטים שלא הושלמו */}
              {pending.length > 0 && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 text-mist-400/60 hover:text-mist-300 transition-colors"
                >
                  <ShareIcon />
                  שתף
                </button>
              )}
              {completed.length > 0 && (
                <button
                  onClick={clearDone}
                  className="text-rose-400/60 hover:text-rose-400 transition-colors"
                >
                  נקה הושלמו
                </button>
              )}
            </div>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-jade-500 rounded-full transition-all duration-500"
              style={{
                width: `${items.length ? (completed.length / items.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Pending items */}
      <div className="space-y-2">
        {pending.length === 0 && completed.length === 0 && (
          <div className="text-center py-12 text-mist-400/40">
            <p className="text-4xl mb-3">🛒</p>
            <p className="text-sm font-mono">רשימת הקניות שלך ריקה</p>
          </div>
        )}
        {pending.map((item) => (
          <ShoppingRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            onRemove={onRemove}
            onMoveToInventory={onMoveToInventory}
          />
        ))}
      </div>

      {/* Completed section */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-mist-400/40 px-1">הושלמו</p>
          {completed.map((item) => (
            <ShoppingRow
              key={item.id}
              item={item}
              onToggle={onToggle}
              onRemove={onRemove}
              onMoveToInventory={onMoveToInventory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
