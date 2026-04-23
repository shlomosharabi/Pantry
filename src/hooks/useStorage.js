/**
 * useStorage — Firebase Firestore + Auth adapter
 *
 * Data model:
 *   users/{uid}/inventory: InventoryItem[]
 *   users/{uid}/shopping:  ShoppingItem[]
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
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { db, auth } from '../firebase'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        // Sign in anonymously if no user
        signInAnonymously(auth).catch((error) => {
          console.error('Anonymous sign-in failed:', error)
        })
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { user, loading }
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export function useInventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'inventory'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setItems(data)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching inventory:', error)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user])

  const addItem = useCallback(async ({ name, quantity = 1, unit = '', expiresAt = null }) => {
    if (!user) return null

    const item = { name: name.trim(), quantity, unit, expiresAt, addedAt: new Date().toISOString() }
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'inventory'), item)
      return { id: docRef.id, ...item }
    } catch (error) {
      console.error('Error adding inventory item:', error)
      return null
    }
  }, [user])

  const updateItem = useCallback(async (id, patch) => {
    if (!user) return

    try {
      await updateDoc(doc(db, 'users', user.uid, 'inventory', id), patch)
    } catch (error) {
      console.error('Error updating inventory item:', error)
    }
  }, [user])

  const deleteItem = useCallback(async (id) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'inventory', id))
    } catch (error) {
      console.error('Error deleting inventory item:', error)
    }
  }, [user])

  return { items, addItem, updateItem, deleteItem, loading }
}

// ─── Shopping ─────────────────────────────────────────────────────────────────

export function useShopping() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'shopping'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setItems(data)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching shopping:', error)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user])

  const addItem = useCallback(async ({ name, quantity = 1, unit = '' }) => {
    if (!user) return null

    const item = { name: name.trim(), quantity, unit, done: false, addedAt: new Date().toISOString() }
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'shopping'), item)
      return { id: docRef.id, ...item }
    } catch (error) {
      console.error('Error adding shopping item:', error)
      return null
    }
  }, [user])

  const toggleDone = useCallback(async (id) => {
    if (!user) return

    const item = items.find((it) => it.id === id)
    if (!item) return

    try {
      await updateDoc(doc(db, 'users', user.uid, 'shopping', id), { done: !item.done })
    } catch (error) {
      console.error('Error toggling shopping item:', error)
    }
  }, [user, items])

  const removeItem = useCallback(async (id) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'shopping', id))
    } catch (error) {
      console.error('Error removing shopping item:', error)
    }
  }, [user])

  // Returns the raw shopping item so caller can pass it to addInventoryItem
  const popItem = useCallback(async (id) => {
    if (!user) return null

    const item = items.find((it) => it.id === id)
    if (!item) return null

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'shopping', id))
      return item
    } catch (error) {
      console.error('Error popping shopping item:', error)
      return null
    }
  }, [user, items])

  return { items, addItem, toggleDone, removeItem, popItem, loading }
}

// ─── Expiry helpers ───────────────────────────────────────────────────────────

export function expiryStatus(expiresAt) {
  if (!expiresAt) return 'none'
  const diff = (new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'expired'
  if (diff <= 3) return 'soon'
  return 'ok'
}
