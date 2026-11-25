import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

function readCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("eventXUser") || "null");
  } catch (error) {
    console.error("Could not read the saved Event-X user.", error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(readCurrentUser);

  const setUser = useCallback((nextUser) => {
    if (nextUser) {
      localStorage.setItem("eventXUser", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("eventXUser");
    }
    setUserState(nextUser);
  }, []);

  useEffect(() => {
    const syncUser = (event) => {
      if (event.key === "eventXUser") {
        setUserState(readCurrentUser());
      }
    };
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}
