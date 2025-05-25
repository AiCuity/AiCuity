
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('OAuth callback error:', error);
        navigate('/login?error=oauth_error');
        return;
      }
      
      if (data.session) {
        navigate('/');
      } else {
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Completing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
