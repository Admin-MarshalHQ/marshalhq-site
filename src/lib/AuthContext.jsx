import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authUser) => {
    // authUser can be a userId string or a full user object
    const userId = typeof authUser === "string" ? authUser : authUser?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
      return;
    }

    // Profile doesn't exist — auto-create from user metadata
    console.warn("Profile not found, creating one...", error?.message);
    const fullUser = typeof authUser === "object" ? authUser : null;
    const meta = fullUser?.user_metadata || {};

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        role: meta.role || "marshal",
        full_name: meta.full_name || fullUser?.email || "",
      })
      .select()
      .single();

    if (newProfile) {
      setProfile(newProfile);
    } else {
      console.error("Failed to create profile:", insertError?.message);
      // Set a minimal fallback so the app doesn't get stuck
      setProfile({
        id: userId,
        role: meta.role || "marshal",
        full_name: meta.full_name || "",
      });
    }
  };

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, role, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName },
      },
    });
    if (error) return { error };

    if (data.user) {
      await fetchProfile(data.user);
    }

    return { data };
  };

  const signIn = async (email, password) => {
    // Call auth API directly to avoid navigator.locks hanging in Codespace
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const res = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const json = await res.json();

    if (!res.ok) {
      return {
        error: { message: json.error_description || json.msg || "Login failed" },
      };
    }

    // Set the session in the Supabase client
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: json.access_token,
      refresh_token: json.refresh_token,
    });

    if (sessionError) return { error: sessionError };
    return { data: json };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut, fetchProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
