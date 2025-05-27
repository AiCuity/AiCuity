import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register = () => {
  const navigate = useNavigate();
  const { signUp, signInWithEmailLink } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailLinkOption, setShowEmailLinkOption] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState<string>('');
  const [registrationError, setRegistrationError] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setRegistrationError('');
    setShowEmailLinkOption(false);
    
    try {
      await signUp(values.email, values.password);
      navigate('/login', { state: { message: 'Please check your email to verify your account' } });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Check if it's a duplicate email error
      if (error.message?.includes('already exists') || error.message?.includes('already registered')) {
        setDuplicateEmail(values.email);
        setShowEmailLinkOption(true);
        setRegistrationError(error.message);
      } else {
        setRegistrationError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLink = async () => {
    if (!duplicateEmail) return;
    
    setIsLoading(true);
    try {
      await signInWithEmailLink(duplicateEmail);
      navigate('/login', { 
        state: { 
          message: 'Please check your email for a sign-in link. If you already have an account, this will sign you in directly.' 
        } 
      });
    } catch (error: any) {
      setRegistrationError(error.message || 'Failed to send email link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Sign up for SpeedRead to track your reading progress
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

          {registrationError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {registrationError}
              </AlertDescription>
            </Alert>
          )}

          {showEmailLinkOption && (
            <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <div className="space-y-3">
                  <p>An account with this email already exists. You can:</p>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEmailLink}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
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
                    <Link to="/login" className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        Go to Sign In page
                      </Button>
                    </Link>
                  </div>
                </div>
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
                    <FormLabel>Password</FormLabel>
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
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
              <Button type="submit" className="w-full" disabled={isLoading || showEmailLinkOption}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
