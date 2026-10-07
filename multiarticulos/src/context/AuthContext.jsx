import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  auth,
  signInWithGoogle,
  signOutUser,
  isAdminEmail,
} from "@/lib/auth";

const AuthContext = createContext({
  user: null,
  profile: null,
  role: "user",
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

// Colección Firestore "users/{uid}":
// { email, displayName, photoURL, role: "admin"|"user",
//   provider, createdAt, lastLoginAt, loginCount,
//   cart: [{id, qty}], cartUpdatedAt }
async function ensureProfile(fbUser) {
  const ref = doc(db, "users", fbUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: fbUser.email || "",
      displayName: fbUser.displayName || "",
      photoURL: fbUser.photoURL || "",
      role: isAdminEmail(fbUser.email) ? "admin" : "user",
      provider: "google",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      loginCount: 1,
      cart: [],
      cartUpdatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, {
      displayName: fbUser.displayName || "",
      photoURL: fbUser.photoURL || "",
      lastLoginAt: serverTimestamp(),
      loginCount: increment(1),
    });
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    let inner = null;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (inner) {
        inner();
        inner = null;
      }
      setUser(u);
      setProfile(null);
      if (u && db) {
        setProfileLoading(true);
        try {
          await ensureProfile(u);
        } catch (e) {
          console.error("No se pudo registrar el perfil:", e);
        }
        inner = onSnapshot(
          doc(db, "users", u.uid),
          (snap) => {
            setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
            setProfileLoading(false);
          },
          () => setProfileLoading(false)
        );
      } else {
        setProfileLoading(false);
      }
      setAuthLoading(false);
    });
    return () => {
      if (inner) inner();
      unsub();
    };
  }, []);

  const signIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || "user",
        loading: authLoading || profileLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
