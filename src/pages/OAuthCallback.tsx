import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import qs from 'qs';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = qs.parse(search, { ignoreQueryPrefix: true });

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (params.error) {
        console.error('OAuth error:', params.error, params.error_description);
        // Forward the error to /login so we can show a friendly message
        navigate(
          `/login?provider_error=${params.error_code || params.error || 'oauth_error'}`,
          { replace: true }
        );
        return;
      }

      try {
        // Check for existing session first
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          console.log('OAuth callback: User already authenticated, redirecting to dashboard');
          navigate('/', { replace: true });
          return;
        }

        // Set up auth state listener for new authentication
        const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('OAuth callback auth state change:', event, session?.user?.email);
          
          if (event === 'SIGNED_IN' && session) {
            subscription.subscription.unsubscribe();
            
            // Create user profile if needed
            try {
              await supabase
                .from('profiles')
                .upsert({
                  id: session.user.id,
                  email: session.user.email,
                  full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
                  avatar_url: session.user.user_metadata?.avatar_url || null,
                  updated_at: new Date().toISOString(),
                }, {
                  onConflict: 'id'
                });
            } catch (profileError) {
              console.error('Error creating user profile:', profileError);
              // Don't block the redirect for profile creation errors
            }
            
            navigate('/', { replace: true });
          } else if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
            subscription.subscription.unsubscribe();
            navigate('/login?provider_error=auth_failed', { replace: true });
          }
        });

        // Fallback timeout to prevent indefinite waiting
        const timeoutId = setTimeout(() => {
          subscription.subscription.unsubscribe();
          navigate('/login?provider_error=timeout', { replace: true });
        }, 15000); // Increased timeout to 15 seconds

        // Cleanup function
        return () => {
          subscription.subscription.unsubscribe();
          clearTimeout(timeoutId);
        };
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login?provider_error=unexpected_failure', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, params]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign-in...</p>
      </div>
    </div>
  );
}
