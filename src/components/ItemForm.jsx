import { useState, useEffect } from 'react'
import { Input, Select, Btn } from './UI'

const UNITS = ['', 'יח', 'ק"ג', 'גרם', 'ליטר', 'מ"ל', 'קופסה', 'שקית', 'בקבוק', 'פחית', 'חבילה']

/**
 * Generic form for both Inventory and Shopping items.
 * Props:
 *   mode: 'inventory' | 'shopping'
 *   initial: object | null  (for edit mode)
 *   onSubmit: (data) => void
 *   onCancel: () => void
 */
export default function ItemForm({ mode = 'shopping', initial = null, onSubmit, onCancel }) {
  const [name, setName]       = useState(initial?.name ?? '')
  const [qty, setQty]         = useState(initial?.quantity ?? 1)
  const [unit, setUnit]       = useState(initial?.unit ?? '')
  const [expires, setExpires] = useState(initial?.expiresAt?.slice(0, 10) ?? '')

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setQty(initial.quantity)
      setUnit(initial.unit ?? '')
      setExpires(initial.expiresAt?.slice(0, 10) ?? '')
    }
  }, [initial])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      quantity: Number(qty) || 1,
      unit,
      ...(mode === 'inventory' ? { expiresAt: expires || null } : {}),
    })
    if (!initial) {
      setName(''); setQty(1); setUnit(''); setExpires('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Name */}
      <Input
        placeholder="שם הפריט…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        required
      />

      <div className="flex gap-2">
        {/* Quantity */}
        <Input
          type="number"
          min={0}
          step="any"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-20 flex-shrink-0"
          placeholder="כמות"
        />
        {/* Unit */}
        <Select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="flex-1"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>{u === '' ? '— יחידה —' : u}</option>
          ))}
        </Select>
      </div>

      {/* Expiry — inventory only */}
      {mode === 'inventory' && (
        <div>
          <label className="text-xs text-mist-400/60 mb-1 block font-mono">פג תוקף (אופציונלי)</label>
          <Input
            type="date"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            className="text-mist-300"
          />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <Btn type="button" variant="ghost" onClick={onCancel} className="flex-1">
            ביטול
          </Btn>
        )}
        <Btn type="submit" variant="primary" className="flex-1">
          {initial ? 'שמור שינויים' : 'הוסף פריט'}
        </Btn>
      </div>
    </form>
  )
}
