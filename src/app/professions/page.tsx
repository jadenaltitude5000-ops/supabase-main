
'use client';

import { useState, useMemo, useEffect, useRef, useCallback, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser, useSupabase } from '@/lib/supabase-client';
import type { Post as PostType, User, Bookmark, Vote } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientOnly } from '@/components/layout/client-only';
import { Rss, MessageSquare, Loader2, UserPlus, Repeat, Quote, Bookmark as BookmarkIcon, PenSquare, Mic, FileUp, Paperclip, X, PlusCircle, Maximize, Minimize, ZoomIn, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Search, Eye, Users, MapPin, Briefcase, Play, Pause, MoreVertical, Trash2, Edit, CircleDollarSign, BriefcaseBusiness, ShieldCheck, RefreshCw, Image as ImageIcon, ChevronDown, Smile, Link as LinkIcon, MoreHorizontal, Send, Feather } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { followUser, unfollowUser } from '@/lib/social-actions';
import Link from 'next/link';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { MediaUploader } from '@/components/ui/media-uploader';
import { FileUploader } from '@/components/ui/file-uploader';
import { ImageEditor } from '@/components/ui/image-editor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AgentContext } from '@/context/agent-context';
import { MainScrollContext } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { useSuggestedUsers } from '@/hooks/use-suggested-users';

function formatRelativeTime(timestamp: string): string {
    if (!timestamp) return 'just now';

    const postDate = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    const day = String(postDate.getDate()).padStart(2, '0');
    const month = String(postDate.getMonth() + 1).padStart(2, '0');
    const year = postDate.getFullYear();
    return `${day}/${month}/${year}`;
}


function ApplyForGigDialog({ gig, onApply }: { gig: PostType; onApply: (applicationDetails: any) => void }) {
    const [motivation, setMotivation] = useState('');
    const [age, setAge] = useState('');

    const handleApply = () => {
        if (!motivation || !age) return;
        onApply({
            motivation,
            age: parseInt(age, 10),
        });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Apply for: {gig.jobDetails?.title}</DialogTitle>
                <DialogDescription>Submit your application to {gig.author.name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="gig-motivation">Why are you a good fit?</Label>
                    <Textarea id="gig-motivation" value={motivation} onChange={(e) => setMotivation(e.target.value)} placeholder="Briefly describe your relevant experience and why you're interested in this gig." className="min-h-24" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gig-age">Your Age</Label>
                    <Input id="gig-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 28" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                <DialogClose asChild>
                    <Button onClick={handleApply} disabled={!motivation || !age}>Submit Application</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

function CreateGigDialog({ onGigCreate }: { onGigCreate: (gigDetails: any) => void }) {
    const [title, setTitle] = useState('');
    const [budget, setBudget] = useState('');
    const [keywords, setKeywords] = useState('');
    const [briefing, setBriefing] = useState('');

    const handleCreateGig = () => {
        if (!title || !budget || !keywords || !briefing) return;
        onGigCreate({
            title,
            budget,
            keywords: keywords.split(',').map(k => k.trim()),
            content: briefing,
        });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create a New Gig</DialogTitle>
                <DialogDescription>Post a small project directly to the feed for freelancers to apply.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="gig-title">Project Title</Label>
                    <Input id="gig-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Logo design for a new startup" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="gig-budget">Budget ($)</Label>
                        <Input id="gig-budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g., 500" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="gig-keywords">Keywords</Label>
                        <Input id="gig-keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g., branding, design" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gig-briefing">Briefing</Label>
                    <Textarea id="gig-briefing" value={briefing} onChange={(e) => setBriefing(e.target.value)} placeholder="Describe the project requirements, deliverables, and timeline." className="min-h-24" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                <DialogClose asChild>
                    <Button onClick={handleCreateGig} disabled={!title || !budget || !keywords || !briefing}>Post Gig</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

function CustomAudioPlayer({ src, onRemove }: { src: string; onRemove: () => void }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        };
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handlePause);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handlePause);
        };
    }, []);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (audio) {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        }
    };

    return (
        <div className="flex items-center gap-2 rounded-md border bg-muted p-2 w-full max-w-xs">
            <audio ref={audioRef} src={src} preload="metadata" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <div className="flex-1 relative h-1 rounded-full bg-background/50">
                <div className="absolute h-1 rounded-full bg-primary" style={{ width: `${progress}%` }}></div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}

function EmojiPicker({ onEmojiSelect }: { onEmojiSelect: (emoji: string) => void }) {
    const emojis = [
        '😀', '😂', '😍', '🤔', '👍', '🙏', '🔥', '🚀', '🎉', '❤️',
        '😊', '😭', '🤯', '💯', '🙌', '✨', '👀', '👋', '😎', '🤷'
    ];

    return (
        <PopoverContent className="w-auto p-2 border">
            <div className="grid grid-cols-5 gap-2">
                {emojis.map(emoji => (
                    <Button
                        key={emoji}
                        variant="ghost"
                        size="icon"
                        className="text-xl"
                        onClick={() => onEmojiSelect(emoji)}
                    >
                        {emoji}
                    </Button>
                ))}
            </div>
        </PopoverContent>
    );
}

function PostComposer({ onPostCreated }: { onPostCreated: (newPost: PostType) => void }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [quotedPost, setQuotedPost] = useState<PostType | null>(null);
  const [isActive, setIsActive] = useState(false);
  const activityTimer = useRef<NodeJS.Timeout | null>(null);

  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const { toast } = useToast();
  const supabase = useSupabase();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserDocLoading, setIsUserDocLoading] = useState(true);

  useEffect(() => {
    if (!authUser || !supabase) {
      setIsUserDocLoading(false);
      return;
    }
    const fetchUser = async () => {
      setIsUserDocLoading(true);
      const { data, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      if (data) setCurrentUser(data as User);
      setIsUserDocLoading(false);
    };
    fetchUser();
  }, [authUser, supabase]);


  const handleActivity = () => {
    setIsActive(true);
    if (activityTimer.current) {
      clearTimeout(activityTimer.current);
    }
    activityTimer.current = setTimeout(() => {
      setIsActive(false);
    }, 3000);
  };

  useEffect(() => {
    const currentTextarea = textareaRef.current;
    if (currentTextarea) {
        currentTextarea.addEventListener('focus', handleActivity);
        currentTextarea.addEventListener('input', handleActivity);
    }
    
    return () => {
        if (currentTextarea) {
            currentTextarea.removeEventListener('focus', handleActivity);
            currentTextarea.removeEventListener('input', handleActivity);
        }
        if (activityTimer.current) {
            clearTimeout(activityTimer.current);
        }
    };
  }, []);

  const handleStartRecording = async () => {
    handleActivity();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      toast({
        variant: "destructive",
        title: "Microphone Required",
        description: "You need to allow microphone access to record a voice note.",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    handleActivity();
  };

  const handleEmojiSelect = (emoji: string) => {
      handleActivity();
      const textarea = textareaRef.current;
      if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newContent = content.substring(0, start) + emoji + content.substring(end);
          setContent(newContent);
          // Move cursor after the inserted emoji
          setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
              textarea.focus();
          }, 0);
      }
  };
  
  const postGig = (gigDetails: any) => {
      handleActivity();
      const postContent = `${gigDetails.content}`;
      
      const newPost: Partial<PostType> = {
          type: 'job_opportunity',
          content: postContent,
          jobDetails: {
              title: gigDetails.title,
              budget: gigDetails.budget,
              keywords: gigDetails.keywords,
          }
      };
      handlePost(newPost);
  }

  const handleFileUpload = (url: string, name: string) => {
    handleActivity();
    setFileUrl(url);
    setFileName(name);
  };
  
  const handleImageUpload = (dataUri: string) => {
    handleActivity();
    setImageToEdit(dataUri);
  };

  const handlePost = async (extraPostData?: Partial<PostType>) => {
    if (!authUser || !supabase) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to post.' });
      return;
    }

    if (isUserDocLoading || !currentUser) {
        toast({ title: 'Please wait', description: "Your profile is still loading. Please try again in a moment." });
        return;
    }
    
    if (!content.trim() && !imageUrl && 
```
- src/app/signin/page.tsx</file>
    <content><![CDATA[
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
import { useSupabase, useUser } from "@/lib/supabase-client";
import { AuthError, AuthResponse } from "@supabase/supabase-js";
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

    