
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/auth';

export default function SocialAuthButtons() {
  try {
    return (
      <div className="auth-container">
        <Auth
          supabaseClient={supabase}
          providers={['google', 'facebook', 'azure']}
          onlyThirdPartyProviders
          redirectTo={`${window.location.origin}/oauth/callback`}
          appearance={{ theme: ThemeSupa }}
        />
      </div>
    );
  } catch (error) {
    console.error('SocialAuthButtons error:', error);
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md">
        <p className="text-red-600 text-sm">
          Social login buttons temporarily unavailable. Please use email login below.
        </p>
      </div>
    );
  }
}
