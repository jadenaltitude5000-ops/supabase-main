
'use client';

import { useState, useMemo, useEffect, useRef, useCallback, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser, useSupabase } from '@/lib/supabase/provider';
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
