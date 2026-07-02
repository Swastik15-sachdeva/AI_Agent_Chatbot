"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email?: string, password?: string) => Promise<void>;
  signUp: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  redirectPath: string | null;
  setRedirectPath: (path: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [redirectPath, setRedirectPathState] = useState<string | null>(null);
  const router = useRouter();

  // Initialize Auth state
  useEffect(() => {
    // 1. If Supabase is configured, use its real session listener
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthenticated(!!session);
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0]
        } : null);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0]
        } : null);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 2. Otherwise, fallback to localStorage mock auth
      const authState = localStorage.getItem("auth_authenticated");
      if (authState === "true") {
        Promise.resolve().then(() => {
          setIsAuthenticated(true);
          setUser({ id: "mock-id", email: "swastik@example.com", name: "SWASTIK" });
        });
      }
    }

    const path = sessionStorage.getItem("auth_redirect_path");
    if (path) {
      Promise.resolve().then(() => {
        setRedirectPathState(path);
      });
    }
  }, []);

  const login = async (email?: string, password?: string) => {
    if (isSupabaseConfigured && supabase && email && password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } else {
      // Fallback: mock login
      setIsAuthenticated(true);
      setUser({ id: "mock-id", email: email || "swastik@example.com", name: "SWASTIK" });
      localStorage.setItem("auth_authenticated", "true");
    }
  };

  const signUp = async (email: string, password?: string) => {
    if (isSupabaseConfigured && supabase && password) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } else {
      // Fallback: mock signup
      setIsAuthenticated(true);
      setUser({ id: "mock-id", email, name: "SWASTIK" });
      localStorage.setItem("auth_authenticated", "true");
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      // Fallback: mock logout
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("auth_authenticated");
    }
    router.push("/auth");
  };

  const setRedirectPath = (path: string | null) => {
    setRedirectPathState(path);
    if (path) {
      sessionStorage.setItem("auth_redirect_path", path);
    } else {
      sessionStorage.removeItem("auth_redirect_path");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signUp,
        logout,
        redirectPath,
        setRedirectPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
