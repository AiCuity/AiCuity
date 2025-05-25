
import { useEffect } from 'react';
import { supabase } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Kick off token parsing from the URL fragment
    supabase.auth.getSession();

    // Wait until Supabase confirms we're signed in
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          listener.subscription.unsubscribe();
          navigate('/dashboard', { replace: true });
        }
      }
    );

    // Optional safety net: after 10 s, give up and send to /login
    const timer = setTimeout(() => navigate('/login?oauth=timeout'), 10_000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <p className="mt-10 text-center">Linking Microsoft account…</p>
  );
}
