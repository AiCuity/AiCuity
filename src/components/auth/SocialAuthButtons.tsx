
import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from 'next-themes';

interface SocialAuthButtonsProps {
  view?: 'sign_in' | 'sign_up';
  providers?: ('google' | 'github' | 'discord' | 'twitter' | 'facebook')[];
  redirectTo?: string;
  onlyThirdPartyProviders?: boolean;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  view = 'sign_in',
  providers = ['google', 'github'],
  redirectTo,
  onlyThirdPartyProviders = true
}) => {
  const { theme } = useTheme();

  return (
    <div className="w-full">
      <Auth
        supabaseClient={supabase}
        view={view}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: 'hsl(var(--primary))',
                brandAccent: 'hsl(var(--primary))',
              },
            },
          },
          className: {
            container: 'auth-container',
            button: 'auth-button',
          },
        }}
        theme={theme === 'dark' ? 'dark' : 'light'}
        providers={providers}
        redirectTo={redirectTo}
        onlyThirdPartyProviders={onlyThirdPartyProviders}
        localization={{
          variables: {
            sign_in: {
              social_provider_text: 'Continue with {{provider}}',
            },
            sign_up: {
              social_provider_text: 'Sign up with {{provider}}',
            },
          },
        }}
      />
    </div>
  );
};

export default SocialAuthButtons;
