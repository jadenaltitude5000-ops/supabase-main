
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
import { useAuth, useFirestore, useUser } from "@/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, UserCredential, AuthErrorCodes } from "firebase/auth";
import { doc, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { LoadingLink } from "@/components/layout/loading-link";
import { LoadingContext } from "@/context/loading-context";


const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignupFormValues = z.infer<typeof signupSchema>;

function getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case AuthErrorCodes.EMAIL_EXISTS:
            return "This email address is already in use by another account.";
        case AuthErrorCodes.INVALID_EMAIL:
            return "The email address is not valid.";
        case AuthErrorCodes.WEAK_PASSWORD:
            return "The password is too weak. It must be at least 6 characters long.";
        case AuthErrorCodes.NETWORK_REQUEST_FAILED:
            return "Network error. Please check your internet connection.";
        case "auth/popup-blocked":
            return "The sign-in popup was blocked by your browser. Please allow popups for this site and try again.";
        case "auth/popup-closed-by-user":
            return "The sign-in process was canceled. Please try again if this was unintentional.";
        case "auth/cancelled-popup-request":
            return "The sign-in process was canceled. Please try again if this was unintentional.";
        case "auth/unauthorized-domain":
            return "This domain is not authorized for OAuth operations. Please go to the Firebase Console -> Authentication -> Settings -> Authorized Domains and add this domain.";
        default:
            return "An unexpected error occurred. Please try again later.";
    }
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
  const auth = useAuth();
  const firestore = useFirestore();
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
        if (referrerId && firestore) {
            const referrerDocRef = doc(firestore, "users", referrerId);
            const referrerDoc = await getDoc(referrerDocRef);
            if (referrerDoc.exists()) {
                setReferrerName(referrerDoc.data().name);
            }
        }
    };
    fetchReferrer();
  }, [searchParams, firestore]);

  const handleAuthSuccess = async (userCredential: UserCredential, profileData?: Partial<SignupFormValues>) => {
    if (!firestore) return;

    const user = userCredential.user;
    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
        // User already exists, just sign them in.
        toast({
            title: "Welcome Back!",
            description: "You've been signed in successfully.",
        });
        router.push('/professions');
        return;
    }
    
    const referrerId = searchParams.get('ref');
    const isVerifiedUser = adminEmails.includes(user.email || "");

    // Note: To import more data like company or age from Google, you would need to:
    // 1. Request additional scopes (e.g., 'https://www.googleapis.com/auth/user.organization.read') during the Google sign-in flow.
    // 2. Use the access token from the credential to call the Google People API.
    // This is not implemented here due to the complexity of handling OAuth tokens and API calls.
    const googleCredential = GoogleAuthProvider.credentialFromResult(userCredential);
    // const accessToken = googleCredential?.accessToken;
    // Then use accessToken to fetch from Google People API.

    const finalProfileData = {
        id: user.uid,
        name: profileData?.fullName || user.displayName || 'Sentrybase User',
        handle: user.email?.split('@')[0] || `user${user.uid.substring(0,5)}`,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        headline: "New Sentrybase Member",
        bio: "Just joined Sentrybase! Looking forward to connecting and building my profile.",
        avatar: user.photoURL || "", 
        coverImage: "",
        skills: [],
        portfolio: [],
        category: 'other',
        reliabilityScore: 75,
        communityStanding: "New Member",
        disputes: 0,
        createdAt: serverTimestamp(),
        vectors: {},
        following: [],
        followers: [],
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
        experience_years: 0,
        isAdmin: isVerifiedUser,
        isSentrybaseVerified: isVerifiedUser,
        referredBy: referrerId || null,
        fcmTokens: [],
    };
    
    try {
        await setDoc(userDocRef, finalProfileData, { merge: true });
    } catch (error: any) {
        console.error("Firestore write failed:", error);
        toast({
            variant: "destructive",
            title: "Signup Incomplete",
            description: "Could not save your profile. Please contact support.",
        });
        return;
    }
    
    toast({
        title: "Welcome to Sentrybase!",
        description: "Redirecting you...",
    });
    router.push('/professions');
  }

  // Effect to redirect already logged-in users
  useEffect(() => {
    if (!isUserLoading && authUser) {
      router.push('/professions');
    }
  }, [authUser, isUserLoading, router]);

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    if (!auth) {
        toast({ variant: "destructive", title: "Signup Failed", description: "Authentication service not available." });
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await handleAuthSuccess(userCredential, data);
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: getAuthErrorMessage(error.code),
      });
    }
  };

  const handleGoogleSignUp = () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    showLoader('Authenticating...');
    signInWithPopup(auth, provider)
      .then(handleAuthSuccess)
      .catch((error: any) => {
        console.error("Google Sign-up failed:", error);
        toast({
          variant: "destructive",
          title: "Google Sign-up Failed",
          description: getAuthErrorMessage(error.code),
          duration: 9000,
        });
      })
      .finally(() => {
        hideLoader();
      });
  };
  
  if (isUserLoading || authUser) {
    // A global loader should handle this, but we keep a minimal one as a fallback.
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
