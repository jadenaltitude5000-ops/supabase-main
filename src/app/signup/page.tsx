
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
import { Loader2, UserPlus } from "lucide-react";
import { useSupabase, useUser } from "@/lib/supabase/provider";
import { AuthError } from "@supabase/supabase-js";
import { useContext, useEffect, useState } from "react";
import { LoadingLink } from "@/components/layout/loading-link";
import { LoadingContext } from "@/context/loading-context";


const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignupFormValues = z.infer<typeof signupSchema>;

function getAuthErrorMessage(error: AuthError): string {
    if (error.message.includes("User already registered")) {
        return "This email address is already in use. Please sign in or use a different email.";
    }
    if (error.message.includes("Password should be at least 6 characters")) {
         return "The password is too weak. It must be at least 6 characters long.";
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

const adminEmails = ["davinciimageryofficial@gmail.com", "jadenaltitude5000@gmail.com", "chrispeta214@gmail.com"];

function SignupPageInternal() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useSupabase();
  const { user: authUser, isUserLoading } = useUser();
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const { showLoader, hideLoader } = useContext(LoadingContext);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  useEffect(() => {
    const fetchReferrer = async () => {
        const referrerId = searchParams.get('ref');
        if (referrerId && supabase) {
            const { data, error } = await supabase.from("users").select('name').eq('id', referrerId).single();
            if (data) {
                setReferrerName(data.name);
            }
        }
    };
    fetchReferrer();
  }, [searchParams, supabase]);


  // Effect to redirect already logged-in users
  useEffect(() => {
    if (!isUserLoading && authUser) {
      router.push('/professions');
    }
  }, [authUser, isUserLoading, router]);

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    if (!supabase) return;
    showLoader('Creating account...');
    const { data: { user }, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                full_name: data.fullName,
            }
        }
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: getAuthErrorMessage(error),
      });
    } else if (user) {
        // Supabase now handles profile creation via a trigger, so no client-side profile creation needed.
        toast({
            title: "Confirmation Email Sent!",
            description: "Please check your inbox to verify your email address and complete registration.",
            duration: 9000,
        });
        router.push('/signin');
    }
    hideLoader();
  };

  const handleGoogleSignUp = async () => {
    if (!supabase) return;
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
          title: "Google Sign-up Failed",
          description: getAuthErrorMessage(error),
          duration: 9000,
        });
      }
    hideLoader();
  };
  
  if (isUserLoading || authUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            {referrerName && (
                <div className="mb-4 rounded-md border bg-primary/10 p-4 text-center text-sm text-primary-foreground">
                    <UserPlus className="mx-auto mb-2 h-5 w-5" />
                    You've been invited by <strong>{referrerName}</strong>. Complete your profile to connect.
                </div>
            )}
            <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
                Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
                Join Sentrybase and start connecting with top professionals.
            </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <div className="px-6 py-12 shadow sm:rounded-lg sm:px-12">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                           <Button 
                                variant="outline" 
                                className="w-full" 
                                type="button" 
                                disabled={isSubmitting}
                                onClick={handleGoogleSignUp}
                            >
                                <GoogleIcon className="mr-2" />
                                Sign up with Google
                            </Button>
                        </div>

                         <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">OR</span>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g., Jane Doe" disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
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
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} placeholder="••••••••" disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Creating Account..." : "Join Sentrybase"}
                        </Button>
                    </form>
                </Form>
            </div>

             <p className="mt-10 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <LoadingLink href="/signin" className="font-semibold leading-6 text-primary hover:text-primary/90">
                    Sign In
                </LoadingLink>
            </p>
        </div>
    </div>
  );
}

export default function SignupPage() {
    return (
        <ClientOnly>
            <SignupPageInternal />
        </ClientOnly>
    )
}
