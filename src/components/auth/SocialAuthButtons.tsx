
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { getRedirectURL } from '../../lib/getRedirect';

export default function SocialAuthButtons() {
  return (
    <Auth
      supabaseClient={supabase}
      providers={['google', 'azure']}
      onlyThirdPartyProviders
      redirectTo={getRedirectURL()}
      appearance={{ theme: ThemeSupa }}
    />
  );
}
