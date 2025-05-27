import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getRedirectURL } from '@/lib/getRedirect';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithEmailLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleDuplicateEmail: (email: string) => Promise<{ isDuplicate: boolean; provider?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setSession(session);
        setIsLoading(false);
        
        // Handle automatic user record creation on sign-in
        if (event === 'SIGNED_IN' && session?.user) {
          createUserRecord(session.user);
        }
      }
    );

    // Load any existing session on first mount
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setSession(data.session);
      setIsLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Automatic user record creation
  const createUserRecord = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error && error.code !== '23505') { // Ignore unique constraint violations
        console.error('Error creating user record:', error);
      }
    } catch (error) {
      console.error('Error in createUserRecord:', error);
    }
  };

  // Check if email already exists and with which provider
  const handleDuplicateEmail = async (email: string): Promise<{ isDuplicate: boolean; provider?: string }> => {
    try {
      // Since we can't directly check email in profiles (no email column in schema),
      // we'll try a sign-in attempt to check if the user exists
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-for-check'
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          // User exists but wrong password
          return { isDuplicate: true, provider: 'email' };
        } else if (authError.message.includes('Email not confirmed')) {
          // User exists but not confirmed
          return { isDuplicate: true, provider: 'email' };
        } else if (authError.message.includes('User not found') || authError.message.includes('Invalid email')) {
          // User doesn't exist
          return { isDuplicate: false };
        }
        
        // For other errors, assume user might exist
        return { isDuplicate: true, provider: 'unknown' };
      }

      // If no error, user exists and password was correct (shouldn't happen with dummy password)
      return { isDuplicate: true, provider: 'email' };
    } catch (error) {
      console.error('Error checking duplicate email:', error);
      return { isDuplicate: false };
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // First check for duplicate email
      const duplicateCheck = await handleDuplicateEmail(email);
      
      if (duplicateCheck.isDuplicate) {
        throw new Error(`An account with this email already exists. Please try signing in${duplicateCheck.provider === 'email' ? ' with your password' : ' with your social provider'} or use the email link option.`);
      }

      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
          emailRedirectTo: getRedirectURL() 
        }
      });
      
      if (error) {
        // Handle specific duplicate email errors from Supabase
        if (error.message.includes('already registered')) {
          throw new Error('An account with this email already exists. Please try signing in or use the email link option.');
        }
        throw error;
      }
      
      toast({
        title: 'Success!',
        description: 'Please check your email to verify your account.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign Up Error',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      let errorMessage = error.message;
      
      // Handle specific error cases
      if (error.message === 'Email not confirmed') {
        errorMessage = 'Please check your email and confirm your account before signing in.';
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. If you signed up with Google or Microsoft, please use the social login buttons.';
      }
      
      toast({
        title: 'Sign In Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      setIsLoading(false);
      return { error: errorMessage };
    }
    
    toast({
      title: 'Welcome back!',
      description: 'You have successfully signed in.',
    });
    setIsLoading(false);
    return {};
  };

  // Email link sign-up as fallback
  const signInWithEmailLink = async (email: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectURL(),
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Email Sent!',
        description: 'Please check your email for a sign-in link.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send email link',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: 'Sign Out Error',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
    
    setUser(null);
    setSession(null);
    
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signInWithEmailLink,
        signOut,
        handleDuplicateEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
