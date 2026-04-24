import { useState, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithPopup,
} from "firebase/auth";
import { db, auth } from "../firebase";

// ─── Auth ─────────────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAnonymous(firebaseUser.isAnonymous);
        setLoading(false);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed:", error);
          setLoading(false);
        });
      }
    });

    return unsubscribe;
  }, []);

  // התחברות עם Google — מקשר את החשבון האנונימי אם קיים
  const signInWithGoogle = useCallback(async () => {
    try {
      if (auth.currentUser?.isAnonymous) {
        // קישור החשבון האנונימי לחשבון Google — הנתונים נשמרים
        await linkWithPopup(auth.currentUser, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      // אם החשבון כבר קיים ב-Google — פשוט מתחבר אליו
      if (error.code === "auth/credential-already-in-use") {
        await signInWithPopup(auth, googleProvider);
      } else {
        console.error("Google sign-in failed:", error);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, []);

  return { user, loading, isAnonymous, signInWithGoogle, signOut };
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export function useInventory(user) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "inventory"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching inventory:", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const addItem = useCallback(
    async ({ name, quantity = 1, unit = "", expiresAt = null }) => {
      if (!user) return null;
      const item = {
        name: name.trim(),
        quantity,
        unit,
        expiresAt,
        addedAt: new Date().toISOString(),
      };
      try {
        const docRef = await addDoc(
          collection(db, "users", user.uid, "inventory"),
          item,
        );
        return { id: docRef.id, ...item };
      } catch (error) {
        console.error("Error adding inventory item:", error);
        return null;
      }
    },
    [user],
  );

  const updateItem = useCallback(
    async (id, patch) => {
      if (!user) return;
      try {
        await updateDoc(doc(db, "users", user.uid, "inventory", id), patch);
      } catch (error) {
        console.error("Error updating inventory item:", error);
      }
    },
    [user],
  );

  const popItemToShopping = useCallback(
    async (id) => {
      if (!user) return null;
      const item = items.find((it) => it.id === id);
      if (!item) return null;
      try {
        await deleteDoc(doc(db, "users", user.uid, "inventory", id));
        return item;
      } catch (error) {
        console.error("Error popping inventory item:", error);
        return null;
      }
    },
    [user, items],
  );

  const deleteItem = useCallback(
    async (id) => {
      if (!user) return;
      try {
        await deleteDoc(doc(db, "users", user.uid, "inventory", id));
      } catch (error) {
        console.error("Error deleting inventory item:", error);
      }
    },
    [user],
  );

  return { items, addItem, updateItem, popItemToShopping, deleteItem, loading };
}

// ─── Shopping ─────────────────────────────────────────────────────────────────

export function useShopping(user) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "shopping"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching shopping:", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const addItem = useCallback(
    async ({ name, quantity = 1, unit = "" }) => {
      if (!user) return null;
      const item = {
        name: name.trim(),
        quantity,
        unit,
        done: false,
        addedAt: new Date().toISOString(),
      };
      try {
        const docRef = await addDoc(
          collection(db, "users", user.uid, "shopping"),
          item,
        );
        return { id: docRef.id, ...item };
      } catch (error) {
        console.error("Error adding shopping item:", error);
        return null;
      }
    },
    [user],
  );

  const toggleDone = useCallback(
    async (id) => {
      if (!user) return;
      const item = items.find((it) => it.id === id);
      if (!item) return;
      try {
        await updateDoc(doc(db, "users", user.uid, "shopping", id), {
          done: !item.done,
        });
      } catch (error) {
        console.error("Error toggling shopping item:", error);
      }
    },
    [user, items],
  );

  const removeItem = useCallback(
    async (id) => {
      if (!user) return;
      try {
        await deleteDoc(doc(db, "users", user.uid, "shopping", id));
      } catch (error) {
        console.error("Error removing shopping item:", error);
      }
    },
    [user],
  );

  const popItem = useCallback(
    async (id) => {
      if (!user) return null;
      const item = items.find((it) => it.id === id);
      if (!item) return null;
      try {
        await deleteDoc(doc(db, "users", user.uid, "shopping", id));
        return item;
      } catch (error) {
        console.error("Error popping shopping item:", error);
        return null;
      }
    },
    [user, items],
  );

  return { items, addItem, toggleDone, removeItem, popItem, loading };
}

// ─── Expiry helpers ───────────────────────────────────────────────────────────

export function expiryStatus(expiresAt) {
  if (!expiresAt) return "none";
  const diff = (new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "expired";
  if (diff <= 3) return "soon";
  return "ok";
}
