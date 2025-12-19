import React, { createContext, useContext, useEffect, useState } from "react";

export type Role = "admin" | "superadmin" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: Exclude<Role, null>;
}

interface AuthContextType {
  user: User | null;
  login: (arg: any) => Promise<User>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Restore login state
  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  // Save login state
  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  // -------------------------------
  // LOGIN FUNCTION (fixed)
  // -------------------------------
  const login = async (arg: any) => {
    await new Promise((res) => setTimeout(res, 200));

    if ("id" in arg) {
      setUser(arg);
      return arg;
    }

    const { username, password } = arg;

    let role: Role = null;

    if (username === "admin" && password === "admin234") role = "admin";
    else if (username === "superadmin" && password === "super234") role = "superadmin";

    if (!role) throw new Error("Invalid username or password");

    const loggedInUser: User = {
      id: username,
      name: role === "superadmin" ? "Super Admin" : "Admin",
      email: `${username}@restom.com`,
      role,
    };

    setUser(loggedInUser);
    return loggedInUser;
  };

  // -------------------------------
  // UPDATE USER (for profile changes)
  // -------------------------------
  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  // -------------------------------
  // LOGOUT FUNCTION
  // -------------------------------
  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  // -------------------------------
  // FIXED: AUTH FETCH
  // -------------------------------
  const authFetch = async (url: string, options: RequestInit = {}) => {
    if (!user) throw new Error("Not authenticated");

    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        updateUser,
        logout,
        authFetch,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};


