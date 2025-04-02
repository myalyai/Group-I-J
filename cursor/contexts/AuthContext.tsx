"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, AuthError, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  getAllUsers: () => Promise<any[]>;
  userRole: string | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        // Set user role from metadata if available
        if (session?.user) {
          const role = session.user.user_metadata?.role || 'user';
          setUserRole(role);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event: string, session: Session | null) => {
            setUser(session?.user ?? null);
            
            // Update role when auth state changes
            if (session?.user) {
              const role = session.user.user_metadata?.role || 'user';
              setUserRole(role);
            } else {
              setUserRole(null);
            }
            
            setLoading(false);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Modified signIn to check for role
  const signIn = async (email: string, password: string, requiredRole?: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // If a specific role is required, check if the user has that role
    if (requiredRole) {
      const userRole = data.user?.user_metadata?.role || 'user';
      if (userRole !== requiredRole) {
        // Sign out immediately if role doesn't match
        await supabase.auth.signOut();
        throw new Error(`Access denied. You don't have ${requiredRole} privileges.`);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/user/dashboard`, // Fix the redirect URL
          data: {
            role: "user",
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        throw new Error(error.message);
      }

      if (data?.user?.identities?.length === 0) {
        throw new Error("This email is already registered");
      }

      // Remove the return statement since we declared Promise<void>
    } catch (error: any) {
      console.error("Detailed signup error:", error);
      throw error;
    }
  };

  const getAllUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('users') // Make sure you have a users table in Supabase
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return users || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signIn, 
        signOut, 
        signUp, 
        getAllUsers,
        userRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
