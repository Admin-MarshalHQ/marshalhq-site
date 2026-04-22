import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authUser) => {
    const userId = typeof authUser === "string" ? authUser : authUser?.id;

    if (!userId) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch profile:", error.message);
      setProfile(null);
      return null;
    }

    const isCompleteProfile = Boolean(
      data &&
      (data.role === "marshal" || data.role === "manager") &&
      data.full_name?.trim() &&
      data.email?.trim()
    );

    if (!isCompleteProfile) {
      setProfile(null);
      return null;
    }

    setProfile(data);
    return data;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

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

  const completeProfile = async ({ role, fullName }, authUser = user) => {
    const currentUser = authUser ?? user;
    const trimmedName = fullName?.trim() || "";

    if (!currentUser?.id) {
      return { error: new Error("You must be signed in before completing signup.") };
    }

    if (!role) {
      return { error: new Error("Please select your role.") };
    }

    if (!trimmedName) {
      return { error: new Error("Please enter your full name.") };
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      return {
        error: sessionError || new Error("You must be signed in before completing signup."),
      };
    }

    const response = await fetch("/api/profile/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        role,
        fullName: trimmedName,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: new Error(payload?.error || "Unable to complete profile right now."),
      };
    }

    setProfile(payload.profile);
    return { data: payload.profile };
  };

  const signUp = async (email, password, role, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName },
      },
    });

    if (error) return { error };

    if (data.session && data.user) {
      const { error: profileError } = await completeProfile({ role, fullName }, data.user);
      if (profileError) return { error: profileError };
    }

    return { data };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };
    return { data };
  };

  const signInWithGoogle = async ({ mode } = {}) => {
    const authMode = mode === "signup" ? "signup" : "login";
    const redirectTo = `${window.location.origin}/login?mode=${authMode}&oauth=google`;

    // Clear any persisted app session so the next OAuth return is a clean handoff.
    await supabase.auth.signOut({ scope: "local" });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) return { error };
    return { data };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        fetchProfile,
        completeProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
