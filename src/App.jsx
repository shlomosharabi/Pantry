import { useState } from 'react'
import { useInventory, useShopping, expiryStatus } from './hooks/useStorage'
import InventoryTab from './components/InventoryTab'
import ShoppingTab from './components/ShoppingTab'

const TABS = [
  { id: 'inventory', label: 'מלאי', emoji: '🏠' },
  { id: 'shopping',  label: 'קניות',  emoji: '🛒' },
]

function AlertBanner({ items }) {
  const urgent = items.filter((i) => {
    const s = expiryStatus(i.expiresAt)
    return s === 'expired' || s === 'soon'
  })
  if (!urgent.length) return null
  const expired = urgent.filter((i) => expiryStatus(i.expiresAt) === 'expired')
  const soon    = urgent.filter((i) => expiryStatus(i.expiresAt) === 'soon')

  return (
    <div className="mx-4 mb-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
      <p className="text-xs font-mono text-amber-400/80">
        {expired.length > 0 && `${expired.length} פריט${expired.length > 1 ? 'ים' : ''} פג תוקף`}
        {expired.length > 0 && soon.length > 0 && ' · '}
        {soon.length > 0 && `${soon.length} פגים תוקף תוך 3 ימים`}
      </p>
      <p className="text-xs text-amber-400/50 mt-0.5">
        {urgent.map((i) => i.name).join(', ')}
      </p>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('inventory')
  const inv  = useInventory()
  const shop = useShopping()

  // Move shopping item → inventory
  function handleMoveToInventory(id) {
    const item = shop.popItem(id)
    if (item) {
      inv.addItem({
        name:      item.name,
        quantity:  item.quantity,
        unit:      item.unit,
        expiresAt: null,
      })
    }
  }

  return (
    <div className="min-h-screen bg-ink-900 text-mist-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 pt-safe-top">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">מזווה</h1>
            <p className="text-xs font-mono text-mist-400/50 -mt-0.5">
              {inv.items.length} פריטים · {shop.items.filter(i => !i.done).length} לקנות
            </p>
          </div>
          {/* Offline indicator – shown only if SW is present */}
          <div className="w-2 h-2 rounded-full bg-jade-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.4)]" title="מוכן לשימוש לא מקוון" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/4 p-1 rounded-2xl mb-3 border border-white/5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === t.id
                  ? 'bg-mist-500/20 text-mist-200 shadow-sm'
                  : 'text-mist-400/60 hover:text-mist-300'
                }`}
            >
              <span>{t.emoji}</span>
              {t.label}
              {/* Badge for shopping pending */}
              {t.id === 'shopping' && shop.items.filter(i => !i.done).length > 0 && (
                <span className="text-[10px] font-mono bg-mist-500/30 text-mist-300 px-1.5 py-0.5 rounded-full">
                  {shop.items.filter(i => !i.done).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Expiry alerts — only on inventory tab */}
      {tab === 'inventory' && <AlertBanner items={inv.items} />}

      {/* Content */}
      <main className="flex-1 px-4 pb-8">
        {tab === 'inventory' ? (
          <InventoryTab
            items={inv.items}
            onAdd={inv.addItem}
            onUpdate={inv.updateItem}
            onDelete={inv.deleteItem}
          />
        ) : (
          <ShoppingTab
            items={shop.items}
            onAdd={shop.addItem}
            onToggle={shop.toggleDone}
            onRemove={shop.removeItem}
            onMoveToInventory={handleMoveToInventory}
          />
        )}
      </main>
    </div>
  )
}
