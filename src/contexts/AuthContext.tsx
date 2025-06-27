
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', { event, session: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log('Sign in successful');
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google sign in');
      
      // Determine if we're in a mobile/Capacitor environment
      const isCapacitor = window.location.protocol === 'capacitor:' || 
                         window.navigator.userAgent.includes('CapacitorWebView');
      
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      let redirectUrl;
      if (isCapacitor) {
        redirectUrl = 'capacitor://localhost/dashboard';
      } else if (isMobile) {
        redirectUrl = `${window.location.origin}/dashboard`;
      } else {
        redirectUrl = `${window.location.origin}/dashboard`;
      }

      console.log('Google sign in redirect URL:', redirectUrl);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('provider is not enabled') || 
            error.message.includes('provider not enabled') ||
            error.message.includes('validation_failed')) {
          errorMessage = "Google sign-in is not configured. Please use email/password login or contact support.";
        }
        
        toast({
          title: "Google sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
      }

      return { error };
    } catch (err) {
      console.error('Google sign in exception:', err);
      const error = err as AuthError;
      toast({
        title: "Google sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    console.log('Signing out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    } else {
      console.log('Sign out successful');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
