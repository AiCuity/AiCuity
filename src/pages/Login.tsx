import React, { useState } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const providerErr = params.get('provider_error');
  const { signIn, signInWithEmailLink } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLinkLoading, setIsEmailLinkLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showEmailLink, setShowEmailLink] = useState(false);

  // Display any message from registration/redirect
  const message = location.state?.message;

  const from = location.state?.from || '/';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const result = await signIn(values.email, values.password);
      
      if (result.error) {
        setAuthError(result.error);
        // Show email link option if password is wrong
        if (result.error.includes('Invalid email or password') || result.error.includes('Invalid login credentials')) {
          setShowEmailLink(true);
        }
      } else {
        navigate(from);
      }
    } catch (error) {
      // Error is handled in the auth context
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLink = async () => {
    const email = form.getValues('email');
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address first');
      return;
    }

    setIsEmailLinkLoading(true);
    try {
      await signInWithEmailLink(email);
      setAuthError(null);
      // Show success message
      setAuthError('✓ Email sent! Please check your inbox for a sign-in link.');
    } catch (error: any) {
      setAuthError(error.message || 'Failed to send email link');
    } finally {
      setIsEmailLinkLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your SpeedRead account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SocialAuthButtons />
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {message && (
            <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {providerErr && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {providerErr === 'unexpected_failure'
                  ? 'We could not retrieve your e-mail from Microsoft. Check Azure app configuration.'
                  : 'OAuth sign-in failed. Please try again or use another method.'}
              </AlertDescription>
            </Alert>
          )}

          {authError && (
            <Alert variant={authError.startsWith('✓') ? 'default' : 'destructive'} className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {authError}
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your.email@example.com"
                        type="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link 
                        to="/forgot-password" 
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              {showEmailLink && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Forgot your password or having trouble signing in?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleEmailLink}
                    disabled={isEmailLinkLoading}
                  >
                    {isEmailLinkLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending email link...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send me a sign-in email link
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center w-full">
            <p className="text-sm text-gray-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
          <div className="text-center w-full">
            <p className="text-xs text-gray-400">
              Having trouble? Try the{' '}
              <Button 
                variant="link" 
                className="h-auto p-0 text-xs" 
                onClick={handleEmailLink}
                disabled={isEmailLinkLoading}
              >
                email link option
              </Button>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
