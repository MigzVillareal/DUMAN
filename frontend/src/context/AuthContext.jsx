import { createContext, useContext, useState } from "react";

const AUTH_STORAGE_KEY = "duman_user";
const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(readStoredUser);

  function setUser(nextUser) {
    setUserState(nextUser);
    if (nextUser) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  function clearUser() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
