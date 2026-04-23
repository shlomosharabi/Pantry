/**
 * useStorage — thin LocalStorage adapter
 *
 * Data model:
 *   pantry_inventory: InventoryItem[]
 *   pantry_shopping:  ShoppingItem[]
 *
 * InventoryItem {
 *   id:         string   (uuid)
 *   name:       string
 *   quantity:   number
 *   unit:       string   (optional, e.g. "kg", "pcs")
 *   expiresAt:  string | null  (ISO date string)
 *   addedAt:    string   (ISO date string)
 * }
 *
 * ShoppingItem {
 *   id:         string
 *   name:       string
 *   quantity:   number
 *   unit:       string
 *   done:       boolean
 *   addedAt:    string
 * }
 */

import { useState, useEffect, useCallback } from 'react'

const KEYS = {
  inventory: 'pantry_inventory',
  shopping: 'pantry_shopping',
}

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.warn('Storage write failed', e)
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export function useInventory() {
  const [items, setItems] = useState(() => load(KEYS.inventory))

  const persist = useCallback((next) => {
    setItems(next)
    save(KEYS.inventory, next)
  }, [])

  const addItem = useCallback(({ name, quantity = 1, unit = '', expiresAt = null }) => {
    const item = { id: uid(), name: name.trim(), quantity, unit, expiresAt, addedAt: new Date().toISOString() }
    persist((prev) => [item, ...prev])
    return item
  }, [persist])

  const updateItem = useCallback((id, patch) => {
    persist((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }, [persist])

  const deleteItem = useCallback((id) => {
    persist((prev) => prev.filter((it) => it.id !== id))
  }, [persist])

  return { items, addItem, updateItem, deleteItem }
}

// ─── Shopping ─────────────────────────────────────────────────────────────────

export function useShopping() {
  const [items, setItems] = useState(() => load(KEYS.shopping))

  const persist = useCallback((next) => {
    setItems(next)
    save(KEYS.shopping, next)
  }, [])

  const addItem = useCallback(({ name, quantity = 1, unit = '' }) => {
    const item = { id: uid(), name: name.trim(), quantity, unit, done: false, addedAt: new Date().toISOString() }
    persist((prev) => [item, ...prev])
    return item
  }, [persist])

  const toggleDone = useCallback((id) => {
    persist((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)))
  }, [persist])

  const removeItem = useCallback((id) => {
    persist((prev) => prev.filter((it) => it.id !== id))
  }, [persist])

  // Returns the raw shopping item so caller can pass it to addInventoryItem
  const popItem = useCallback((id) => {
    let found = null
    persist((prev) => prev.filter((it) => {
      if (it.id === id) { found = it; return false }
      return true
    }))
    return found
  }, [persist])

  return { items, addItem, toggleDone, removeItem, popItem }
}

// ─── Expiry helpers ───────────────────────────────────────────────────────────

export function expiryStatus(expiresAt) {
  if (!expiresAt) return 'none'
  const diff = (new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'expired'
  if (diff <= 3) return 'soon'
  return 'ok'
}
