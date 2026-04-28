import { useState, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithPopup,
} from "firebase/auth";
import { db, auth } from "../firebase";

const googleProvider = new GoogleAuthProvider();

// ─── Auth ─────────────────────────────────────────────────────────────────────

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

  const signInWithGoogle = useCallback(async () => {
    try {
      if (auth.currentUser?.isAnonymous) {
        await linkWithPopup(auth.currentUser, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    } catch (error) {
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

// ─── Home ─────────────────────────────────────────────────────────────────────

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function useHome(user) {
  const [homes, setHomes] = useState([]);
  const [activeHomeId, setActiveHomeId] = useState(null);
  const [loading, setLoading] = useState(true);

  // טען את רשימת הבתים של המשתמש
  useEffect(() => {
    if (!user || user.isAnonymous) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "homes"),
      async (snapshot) => {
        const homeIds = snapshot.docs.map((d) => d.id);
        if (homeIds.length === 0) {
          setHomes([]);
          setActiveHomeId(null);
          setLoading(false);
          return;
        }

        // טען את פרטי כל בית
        const homeDetails = await Promise.all(
          homeIds.map(async (id) => {
            const homeDoc = await getDoc(doc(db, "homes", id));
            return homeDoc.exists() ? { id, ...homeDoc.data() } : null;
          }),
        );

        const validHomes = homeDetails.filter(Boolean);
        setHomes(validHomes);

        // בחר את הבית הראשון אוטומטית אם אין בית פעיל
        setActiveHomeId((prev) => prev ?? validHomes[0]?.id ?? null);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  // יצירת בית חדש
  const createHome = useCallback(
    async (name) => {
      if (!user || user.isAnonymous) return null;
      const inviteCode = generateCode();
      const homeRef = await addDoc(collection(db, "homes"), {
        name,
        createdBy: user.uid,
        inviteCode,
        createdAt: new Date().toISOString(),
      });

      // הוסף את היוצר כ-admin
      await setDoc(doc(db, "homes", homeRef.id, "members", user.uid), {
        displayName: user.displayName ?? user.email,
        email: user.email,
        photoURL: user.photoURL ?? null,
        role: "admin",
        joinedAt: new Date().toISOString(),
      });

      // שמור את הבית ברשימת הבתים של המשתמש
      await setDoc(doc(db, "users", user.uid, "homes", homeRef.id), {
        joinedAt: new Date().toISOString(),
      });

      setActiveHomeId(homeRef.id);
      return homeRef.id;
    },
    [user],
  );

  // הצטרפות לבית עם קוד
  const joinHome = useCallback(
    async (code) => {
      if (!user || user.isAnonymous) return { error: "חייב להתחבר עם Google" };

      // חפש בית עם הקוד
      const q = query(
        collection(db, "homes"),
        where("inviteCode", "==", code.toUpperCase()),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) return { error: "קוד לא נמצא" };

      const homeDoc = snapshot.docs[0];
      const homeId = homeDoc.id;

      // בדוק אם כבר חבר
      const memberDoc = await getDoc(
        doc(db, "homes", homeId, "members", user.uid),
      );
      if (memberDoc.exists()) return { error: "כבר חבר בבית זה" };

      // הוסף כחבר
      await setDoc(doc(db, "homes", homeId, "members", user.uid), {
        displayName: user.displayName ?? user.email,
        email: user.email,
        photoURL: user.photoURL ?? null,
        role: "member",
        joinedAt: new Date().toISOString(),
      });

      await setDoc(doc(db, "users", user.uid, "homes", homeId), {
        joinedAt: new Date().toISOString(),
      });

      setActiveHomeId(homeId);
      return { success: true, homeId };
    },
    [user],
  );

  // עזיבת בית
  const leaveHome = useCallback(
    async (homeId) => {
      if (!user) return;
      await deleteDoc(doc(db, "homes", homeId, "members", user.uid));
      await deleteDoc(doc(db, "users", user.uid, "homes", homeId));
      setActiveHomeId((prev) =>
        prev === homeId
          ? (homes.find((h) => h.id !== homeId)?.id ?? null)
          : prev,
      );
    },
    [user, homes],
  );

  // הסרת חבר (admin בלבד)
  const removeMember = useCallback(
    async (homeId, memberId) => {
      if (!user) return;
      await deleteDoc(doc(db, "homes", homeId, "members", memberId));
      await deleteDoc(doc(db, "users", memberId, "homes", homeId));
    },
    [user],
  );

  // מחיקת בית — admin בלבד, מוחק את כל תת-האוספים
  const deleteHome = useCallback(
    async (homeId) => {
      if (!user) return;

      try {
        // מחק את כל הפריטים במלאי
        const inventorySnap = await getDocs(
          collection(db, "homes", homeId, "inventory"),
        );
        await Promise.all(inventorySnap.docs.map((d) => deleteDoc(d.ref)));

        // מחק את כל פריטי הקניות
        const shoppingSnap = await getDocs(
          collection(db, "homes", homeId, "shopping"),
        );
        await Promise.all(shoppingSnap.docs.map((d) => deleteDoc(d.ref)));

        // מחק את כל החברים + הסר מרשימת הבתים שלהם
        const membersSnap = await getDocs(
          collection(db, "homes", homeId, "members"),
        );
        await Promise.all(
          membersSnap.docs.map(async (d) => {
            await deleteDoc(d.ref);
            await deleteDoc(doc(db, "users", d.id, "homes", homeId));
          }),
        );

        // מחק את הבית עצמו
        await deleteDoc(doc(db, "homes", homeId));

        setActiveHomeId((prev) =>
          prev === homeId
            ? (homes.find((h) => h.id !== homeId)?.id ?? null)
            : prev,
        );
      } catch (error) {
        console.error("Error deleting home:", error);
      }
    },
    [user, homes],
  );

  const activeHome = homes.find((h) => h.id === activeHomeId) ?? null;

  return {
    homes,
    activeHome,
    activeHomeId,
    setActiveHomeId,
    loading,
    createHome,
    joinHome,
    leaveHome,
    removeMember,
    deleteHome,
  };
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export function useInventory(user, homeId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // נתיב: אם יש בית פעיל — homes/{homeId}/inventory, אחרת users/{uid}/inventory
  const path = homeId
    ? collection(db, "homes", homeId, "inventory")
    : user
      ? collection(db, "users", user.uid, "inventory")
      : null;

  useEffect(() => {
    if (!path) return;
    setLoading(true);

    const unsubscribe = onSnapshot(
      path,
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
  }, [homeId, user?.uid]);

  const addItem = useCallback(
    async ({ name, quantity = 1, unit = "", expiresAt = null }) => {
      if (!path) return null;
      const item = {
        name: name.trim(),
        quantity,
        unit,
        expiresAt,
        addedAt: new Date().toISOString(),
        addedBy: user?.uid ?? null,
      };
      try {
        const docRef = await addDoc(path, item);
        return { id: docRef.id, ...item };
      } catch (error) {
        console.error("Error adding inventory item:", error);
        return null;
      }
    },
    [homeId, user?.uid],
  );

  const updateItem = useCallback(
    async (id, patch) => {
      if (!path) return;
      try {
        const ref = homeId
          ? doc(db, "homes", homeId, "inventory", id)
          : doc(db, "users", user.uid, "inventory", id);
        await updateDoc(ref, patch);
      } catch (error) {
        console.error("Error updating inventory item:", error);
      }
    },
    [homeId, user?.uid],
  );

  const deleteItem = useCallback(
    async (id) => {
      if (!path) return;
      try {
        const ref = homeId
          ? doc(db, "homes", homeId, "inventory", id)
          : doc(db, "users", user.uid, "inventory", id);
        await deleteDoc(ref);
      } catch (error) {
        console.error("Error deleting inventory item:", error);
      }
    },
    [homeId, user?.uid],
  );

  const popItemToShopping = useCallback(
    async (id) => {
      const item = items.find((it) => it.id === id);
      if (!item) return null;
      try {
        const ref = homeId
          ? doc(db, "homes", homeId, "inventory", id)
          : doc(db, "users", user.uid, "inventory", id);
        await deleteDoc(ref);
        return item;
      } catch (error) {
        console.error("Error popping inventory item:", error);
        return null;
      }
    },
    [homeId, user?.uid, items],
  );

  return { items, addItem, updateItem, deleteItem, popItemToShopping, loading };
}

// ─── Shopping ─────────────────────────────────────────────────────────────────

export function useShopping(user, homeId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const path = homeId
    ? collection(db, "homes", homeId, "shopping")
    : user
      ? collection(db, "users", user.uid, "shopping")
      : null;

  useEffect(() => {
    if (!path) return;
    setLoading(true);

    const unsubscribe = onSnapshot(
      path,
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
  }, [homeId, user?.uid]);

  const addItem = useCallback(
    async ({ name, quantity = 1, unit = "" }) => {
      if (!path) return null;
      const item = {
        name: name.trim(),
        quantity,
        unit,
        done: false,
        addedAt: new Date().toISOString(),
        addedBy: user?.uid ?? null,
      };
      try {
        const docRef = await addDoc(path, item);
        return { id: docRef.id, ...item };
      } catch (error) {
        console.error("Error adding shopping item:", error);
        return null;
      }
    },
    [homeId, user?.uid],
  );

  const toggleDone = useCallback(
    async (id) => {
      const item = items.find((it) => it.id === id);
      if (!item) return;
      try {
        const ref = homeId
          ? doc(db, "homes", homeId, "shopping", id)
          : doc(db, "users", user.uid, "shopping", id);
        await updateDoc(ref, { done: !item.done });
      } catch (error) {
        console.error("Error toggling shopping item:", error);
      }
    },
    [homeId, user?.uid, items],
  );

  const removeItem = useCallback(
    async (id) => {
      try {
        const ref = homeId
          ? doc(db, "homes", homeId, "shopping", id)
          : doc(db, "users", user.uid, "shopping", id);
        await deleteDoc(ref);
      } catch (error) {
        console.error("Error removing shopping item:", error);
      }
    },
    [homeId, user?.uid],
  );

  const popItem = useCallback(
    async (id) => {
      const item = items.find((it) => it.id === id);
      if (!item) return null;
      try {
        const ref = homeId
          ? doc(db, "homes", homeId, "shopping", id)
          : doc(db, "users", user.uid, "shopping", id);
        await deleteDoc(ref);
        return item;
      } catch (error) {
        console.error("Error popping shopping item:", error);
        return null;
      }
    },
    [homeId, user?.uid, items],
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
