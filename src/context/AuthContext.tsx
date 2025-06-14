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
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
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
      // First, check if user already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('Error checking existing profile:', fetchError);
        return;
      }

      if (existingProfile) {
        // User exists - only update non-role fields to preserve existing role
        const { error } = await supabase
          .from('profiles')
          .update({
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating existing user record:', error);
        }
      } else {
        // New user - create with role from metadata or default to 'user'
        const role = user.user_metadata?.role || 'user';
          
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            role: role,
            updated_at: new Date().toISOString(),
          });

        if (error && error.code !== '23505') { // Ignore unique constraint violations
          console.error('Error creating user record:', error);
        }
      }
    } catch (error) {
      console.error('Error in createUserRecord:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
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

      if (data?.user) {
        // Check if this is a duplicate email using the identities array
        const isNewUser = data.user.identities && data.user.identities.length > 0;
        const isExistingUser = !isNewUser;

        if (isExistingUser) {
          // User already exists - sign out the temporary session and show error
          await supabase.auth.signOut();
          throw new Error('An account with this email already exists. Please try signing in with your password or use the email link option.');
        }
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

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getRedirectURL().replace('/oauth/callback', '')}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Password Reset Email Sent!',
        description: 'Please check your email for a password reset link.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Password Updated!',
        description: 'Your password has been successfully updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password',
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
        resetPassword,
        updatePassword,
        signOut,
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
