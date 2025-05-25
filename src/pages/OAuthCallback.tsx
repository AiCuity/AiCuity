
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/auth';
import qs from 'qs';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = qs.parse(search, { ignoreQueryPrefix: true });

  useEffect(() => {
    if (params.error) {
      // Forward the error to /login so we can show a friendly message
      navigate(
        `/login?provider_error=${params.error_code || 'oauth_error'}`,
        { replace: true }
      );
      return;
    }

    // Otherwise wait for SIGNED_IN as before
    supabase.auth.getSession();
    const { data: sub } = supabase.auth.onAuthStateChange((evt, sess) => {
      if (evt === 'SIGNED_IN' && sess) {
        sub.subscription.unsubscribe();
        navigate('/', { replace: true });
      }
    });

    // Fallback timeout
    const t = setTimeout(() => navigate('/login?provider_error=timeout'), 10000);

    return () => {
      sub?.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  return <p className="mt-10 text-center">Checking sign-in…</p>;
}
