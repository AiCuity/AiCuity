
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';

export default function SocialAuthButtons() {
  return (
    <Auth
      supabaseClient={supabase}
      providers={['google', 'azure']}
      onlyThirdPartyProviders
      redirectTo={`${window.location.origin}/oauth/callback`}
      appearance={{ theme: ThemeSupa }}
    />
  );
}
