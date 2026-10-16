"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/app/lib/supabase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginDemoUser: (name?: string) => void;
  logout: () => Promise<void>;
  saveCloudTopics: (topics: string[]) => Promise<void>;
  fetchCloudTopics: () => Promise<string[] | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(sbUser: User): UserProfile {
  const metadata = sbUser.user_metadata || {};
  return {
    uid: sbUser.id,
    email: sbUser.email || null,
    displayName: metadata.full_name || metadata.display_name || metadata.name || sbUser.email?.split("@")[0] || "Aspirant",
    photoURL: metadata.avatar_url || metadata.picture || null,
    isDemo: false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          checkDemoUserSession();
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      checkDemoUserSession();
      setLoading(false);
    }
  }, []);

  const checkDemoUserSession = () => {
    try {
      const savedDemo = localStorage.getItem("jeca_demo_user");
      if (savedDemo) {
        setUser(JSON.parse(savedDemo));
      }
    } catch {
      // Ignore
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured yet. Please provide your Supabase URL & Anon Key.");
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured yet. Please provide your Supabase URL & Anon Key.");
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured yet. Please provide your Supabase URL & Anon Key.");
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          display_name: name,
          full_name: name,
        },
      },
    });
    if (error) throw error;
    if (data.user) {
      setUser(mapSupabaseUser(data.user));
    }
  };

  const loginDemoUser = (name = "Somnath (Demo Aspirant)") => {
    const demoUser: UserProfile = {
      uid: "demo-student-001",
      email: "somnath.jeca@example.com",
      displayName: name,
      photoURL: null,
      isDemo: true,
    };
    setUser(demoUser);
    try {
      localStorage.setItem("jeca_demo_user", JSON.stringify(demoUser));
    } catch {
      // Ignore
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("jeca_demo_user");
    setUser(null);
  };

  const saveCloudTopics = async (topics: string[]) => {
    if (!user) return;

    if (isSupabaseConfigured && supabase && !user.isDemo) {
      try {
        const { error } = await supabase
          .from("user_progress")
          .upsert(
            {
              user_id: user.uid,
              completed_topics: topics,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        if (error) console.error("Supabase upsert error:", error);
      } catch (err) {
        console.error("Failed to save progress to Supabase:", err);
      }
    } else {
      try {
        localStorage.setItem(`jeca_cloud_${user.uid}`, JSON.stringify(topics));
      } catch {
        // Ignore
      }
    }
  };

  const fetchCloudTopics = async (): Promise<string[] | null> => {
    if (!user) return null;

    if (isSupabaseConfigured && supabase && !user.isDemo) {
      try {
        const { data, error } = await supabase
          .from("user_progress")
          .select("completed_topics")
          .eq("user_id", user.uid)
          .maybeSingle();

        if (error) {
          console.error("Supabase fetch error:", error);
          return null;
        }
        if (data?.completed_topics) {
          return data.completed_topics as string[];
        }
      } catch (err) {
        console.error("Failed to fetch progress from Supabase:", err);
      }
    } else {
      try {
        const saved = localStorage.getItem(`jeca_cloud_${user.uid}`);
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignore
      }
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        loginDemoUser,
        logout,
        saveCloudTopics,
        fetchCloudTopics,
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
