
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ClientOnly } from "@/components/layout/client-only";
import { Loader2 } from "lucide-react";
import { useSupabase, useUser } from "@/firebase";
import { AuthError, AuthResponse, UserCredential } from "@supabase/supabase-js";
import { useContext, useEffect, useState } from "react";
import { LoadingLink } from "@/components/layout/loading-link";
import { LoadingContext } from "@/context/loading-context";

const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const passwordResetSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
});

type SigninFormValues = z.infer<typeof signinSchema>;
type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

function getAuthErrorMessage(error: AuthError): string {
    if (error.message.includes("Invalid login credentials")) {
        return "Invalid email or password. Please check your credentials and try again.";
    }
     if (error.message.includes("Email not confirmed")) {
        return "Please confirm your email address before signing in. Check your inbox for a confirmation link.";
    }
    return error.message || "An unexpected error occurred. Please try again later.";
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.783,44,30.886,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
    );
}

function SigninPageInternal() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useSupabase();
  const { user, isUserLoading } = useUser();
  const { showLoader, hideLoader } = useContext(LoadingContext);
  
  const [view, setView] = useState('signin'); // 'signin', 'forgot'

  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  const resetForm = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: "" },
  });

  const { handleSubmit, control, formState: { isSubmitting } } = form;

  const handleAuthSuccess = async (response: AuthResponse) => {
    if (response.error) {
         toast({
            variant: "destructive",
            title: "Sign-in Failed",
            description: getAuthErrorMessage(response.error),
        });
        return;
    }
    
    toast({
      title: "Signed In Successfully!",
      description: "Redirecting you...",
    });
    
    const redirectPath = searchParams.get('redirect');
    router.replace(redirectPath || '/professions');
  }

  // Effect to redirect already logged-in users
  useEffect(() => {
    if (!isUserLoading && user) {
        const redirectPath = searchParams.get('redirect');
        router.replace(redirectPath || '/professions');
    }
  }, [user, isUserLoading, router, searchParams]);

  const onSubmit: SubmitHandler<SigninFormValues> = async (data) => {
    showLoader('Signing in...');
    const response = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    });
    await handleAuthSuccess(response);
    hideLoader();
  };
  
  const handlePasswordReset: SubmitHandler<PasswordResetFormValues> = async (data) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/password-reset`,
    });

    if(error) {
        toast({
            variant: "destructive",
            title: "Error Sending Reset Email",
            description: "Could not send password reset email. Please check the email address and try again.",
        });
    } else {
        toast({
            title: "Password Reset Email Sent",
            description: "Please check your inbox for instructions to reset your password.",
        });
        setView('signin');
    }
  };

  const handleGoogleSignIn = async () => {
    showLoader('Authenticating...');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) {
        toast({
          variant: "destructive",
          title: "Google Sign-in Failed",
          description: getAuthErrorMessage(error),
          duration: 9000,
        });
    }
    hideLoader();
  };
  
  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
      switch(view) {
        case 'forgot':
            return (
                <Card className="w-full max-w-md border-transparent">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Forgot Password</CardTitle>
                        <CardDescription>Enter your email to receive a password reset link.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...resetForm}>
                            <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
                                <FormField
                                    control={resetForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl><Input type="email" {...field} placeholder="you@company.com" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
                                    {resetForm.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
                                </Button>
                                <Button variant="link" className="w-full" onClick={() => setView('signin')}>Back to Sign In</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            );
        default: // 'signin'
            return (
                <Card className="w-full max-w-md border-transparent">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
                    <CardDescription>
                      Sign in to access your Sentrybase dashboard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                         <Button
                            variant="outline"
                            className="w-full"
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleGoogleSignIn}
                            >
                            <GoogleIcon className="mr-2" />
                            Sign in with Google
                        </Button>
                         <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">OR</span>
                            </div>
                        </div>
                        <FormField
                          control={control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} placeholder="e.g., you@company.com" disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                               <div className="flex items-center justify-between">
                                 <FormLabel>Password</FormLabel>
                                 <Button variant="link" type="button" className="text-sm h-auto p-0" onClick={() => setView('forgot')}>
                                    Forgot password?
                                 </Button>
                               </div>
                              <FormControl>
                                <Input type="password" {...field} placeholder="••••••••" disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Signing In..." : "Sign In"}
                        </Button>
                         <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <LoadingLink href="/signup" className="font-semibold text-primary">
                                Sign Up
                            </LoadingLink>
                        </p>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
            );
      }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        {renderContent()}
    </div>
  );
}

export default function SigninPage() {
    return (
        <ClientOnly>
            <SigninPageInternal />
        </ClientOnly>
    );
}

    