"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserDto, Role } from "@/types";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  details?: string;
}

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchQuickUser: (role: "ADMIN" | "USER") => Promise<void>;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage["type"], message: string, details?: string) => void;
  removeToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage["type"], message: string, details?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message, details }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Restore session
  useEffect(() => {
    const storedToken = localStorage.getItem("cinema_token");
    const storedUser = localStorage.getItem("cinema_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("cinema_token");
        localStorage.removeItem("cinema_user");
      }
    } else {
      // Auto login as default user for seamless experience
      switchQuickUser("USER");
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast("error", data.error || "Login failed");
        return false;
      }

      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem("cinema_token", data.data.token);
      localStorage.setItem("cinema_user", JSON.stringify(data.data.user));
      addToast("success", `Welcome back, ${data.data.user.name}!`);
      return true;
    } catch (err: any) {
      addToast("error", "Network connection failed");
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast("error", data.error || "Registration failed");
        return false;
      }

      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem("cinema_token", data.data.token);
      localStorage.setItem("cinema_user", JSON.stringify(data.data.user));
      addToast("success", "Account created successfully!");
      return true;
    } catch (err: any) {
      addToast("error", "Network connection error");
      return false;
    }
  };

  const logout = () => {
    fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setToken(null);
    localStorage.removeItem("cinema_token");
    localStorage.removeItem("cinema_user");
    addToast("info", "Signed out successfully");
  };

  const switchQuickUser = async (role: "ADMIN" | "USER") => {
    if (role === "ADMIN") {
      await login("admin@cinema.com", "admin123");
    } else {
      await login("alex@example.com", "customer123");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchQuickUser,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
