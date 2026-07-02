import { createContext, useContext, useState } from "react";
import {
  persistAuthSession,
  readStoredToken,
} from "../utils/authStorage.js";

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
  const [token, setTokenState] = useState(readStoredToken);

  function setUser(nextUser, nextToken) {
    setUserState(nextUser);

    const resolvedToken =
      nextToken !== undefined ? nextToken : nextUser ? token : null;

    setTokenState(resolvedToken);
    persistAuthSession(nextUser, resolvedToken);
  }

  function clearUser() {
    setUserState(null);
    setTokenState(null);
    persistAuthSession(null, null);
  }

  return (
    <AuthContext.Provider value={{ user, token, setUser, clearUser }}>
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
