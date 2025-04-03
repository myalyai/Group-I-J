"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, AuthError, Session } from "@supabase/supabase-js";
import { createClient } from '@supabase/supabase-js'

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

// Create a supabase admin client with service role key for admin operations
const adminSupabase = typeof window !== 'undefined' 
  ? null // Don't create admin client in browser
  : createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

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
      // Get the current user's session to get the access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      // Check if the user has admin role in their metadata
      const userRole = session.user.user_metadata?.role;
      console.log('Current user:', session.user.email);
      console.log('Current user role:', userRole);
      console.log('Full user metadata:', JSON.stringify(session.user.user_metadata, null, 2));
      
      if (userRole !== 'admin') {
        throw new Error('Unauthorized: Only admins can view all users');
      }
      
      // Use the API route instead of direct Supabase query
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      
      const users = await response.json();
      return users;
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
