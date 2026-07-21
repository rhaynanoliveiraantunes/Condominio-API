import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

export type User = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  apartment?: string;
  role?: "user" | "admin" | string;
  active?: boolean;
};

type AuthState = {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshMe: () => Promise<User | null>;
  setSession: (token: string, user: User) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const t = window.localStorage.getItem("cb_token");
      const u = window.localStorage.getItem("cb_user");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
    } catch {
      /* noop */
    }
    setReady(true);
  }, []);

  const setSession = (t: string, u: User) => {
    window.localStorage.setItem("cb_token", t);
    window.localStorage.setItem("cb_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const refreshMe = async () => {
    try {
      const { data } = await api.get<User>("/users/me");
      window.localStorage.setItem("cb_user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch {
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ message: string; data: { token: string; user: User } }>(
      "/auth/login",
      {
        email,
        password,
      },
    );
    const session = data?.data;
    if (!session?.token) throw new Error("Resposta inválida do servidor.");
    let u: User = session.user ?? {};
    // Persist token first so /users/me can use it
    window.localStorage.setItem("cb_token", session.token);
    setToken(session.token);
    // Enrich user data
    try {
      const { data: me } = await api.get<User>("/users/me");
      u = { ...u, ...me };
    } catch {
      /* keep basic user */
    }
    window.localStorage.setItem("cb_user", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    window.localStorage.removeItem("cb_token");
    window.localStorage.removeItem("cb_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, ready, login, logout, refreshMe, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function currentUserId(u: User | null): string | undefined {
  return u?._id ?? u?.id;
}