
'use client';

import { useState, useMemo, useEffect, useRef, useCallback, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser, useSupabase } from '@/firebase';
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
    if (!authUser) {
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
    
    if (!content.trim() && !imageUrl && !audioUrl && !fileUrl && !extraPostData?.content && !quotedPost) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must provide content or a file to create a post.' });
        return;
    }

    setIsPosting(true);
    handleActivity();

    // Optimistic UI update
    const clientSideId = crypto.randomUUID();
    const newPostForUI: PostType = {
        id: clientSideId,
        userId: authUser.id,
        author: {
            id: authUser.id,
            name: currentUser.name || "Sentry User",
            handle: currentUser.handle || "sentryuser",
            avatar: currentUser.avatar || "",
            isAdmin: currentUser.isAdmin || false,
            isSentrybaseVerified: currentUser.isSentrybaseVerified || false,
            hasActiveSubscription: !!currentUser.subscription?.planId,
        },
        content: content.trim(),
        type: quotedPost ? 'repost' : 'default',
        createdAt: new Date().toISOString(),
        voteCount: 0,
        replyCount: 0,
        repostCount: 0,
        ...extraPostData,
    };
    
    if (quotedPost) {
        newPostForUI.originalPost = {
            id: quotedPost.id,
            authorName: quotedPost.author.name,
            authorHandle: quotedPost.author.handle,
            authorAvatar: quotedPost.author.avatar,
            content: quotedPost.content,
        };
    }
    
    if (imageUrl) newPostForUI.image = imageUrl;
    if (audioUrl) newPostForUI.audioUrl = audioUrl;
    if (fileUrl) newPostForUI.fileUrl = fileUrl;
    if (fileName) newPostForUI.fileName = fileName;

    if (extraPostData?.type === 'job_opportunity') {
        newPostForUI.content = extraPostData.content || '';
    }
    
    onPostCreated(newPostForUI);
    
    setContent('');
    setImageUrl(null);
    setAudioUrl(null);
    setFileUrl(null);
    setFileName(null);
    setQuotedPost(null);
    
    const { id, ...postForSupabase } = newPostForUI;
    const { error } = await supabase.from('posts').insert([postForSupabase]);

    if (error) {
      console.error('Error creating post:', error);
      toast({ variant: 'destructive', title: 'Post Failed', description: 'Could not create your post. Please try again.' });
    } else {
      toast({ title: 'Post Created', description: 'Your post is now live.' });
    }

    setIsPosting(false);
    setIsActive(false);
  };
  
    useEffect(() => {
        const handleQuote = (event: Event) => {
            const quoteEvent = event as CustomEvent<PostType>;
            setQuotedPost(quoteEvent.detail);
        };
        window.addEventListener('quotePost', handleQuote);
        return () => {
            window.removeEventListener('quotePost', handleQuote);
        };
    }, []);

  const isLoading = isPosting || isAuthUserLoading || isUserDocLoading;

  return (
    <>
      <ImageEditor
        image={imageToEdit}
        onClose={() => setImageToEdit(null)}
        onSave={(croppedImage) => {
          setImageUrl(croppedImage);
          setImageToEdit(null);
        }}
      />
      <div className="pointer-events-auto w-full pb-[calc(env(safe-area-inset-bottom))]">
          <div className={cn(
                "relative py-1 flex items-center gap-1 w-full mx-auto transition-all duration-300 backdrop-blur-sm",
                isActive ? "bg-background/80" : "bg-background/80"
            )}>
              {isActive && content && (
                <div className="absolute bottom-full left-0 right-0 mb-2 p-2 pointer-events-none">
                    <div className="bg-background border rounded-md shadow-lg h-36">
                        <div className="h-full p-3 overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap font-sans">{content}</p>
                        </div>
                    </div>
                </div>
              )}
              <div className="absolute -bottom-4 left-2 transform -translate-y-full w-full max-w-xs space-y-2">
                  {imageUrl && (
                      <div className="relative aspect-video w-48 overflow-hidden rounded-md border">
                          <Image src={imageUrl} alt="Image preview" fill className="object-cover" />
                          <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5" onClick={() => setImageUrl(null)}><X className="h-3 w-3"/></Button>
                      </div>
                  )}
                  {audioUrl && (
                    <CustomAudioPlayer src={audioUrl} onRemove={() => setAudioUrl(null)} />
                  )}
                  {fileName && (
                    <div className="flex items-center gap-2 rounded-md border bg-muted p-1 text-sm">
                        <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="flex-1 truncate">{fileName}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => { setFileUrl(null); setFileName(null); }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                 {quotedPost && (
                    <Card className="bg-muted/80 shadow-md">
                         <CardHeader className="flex flex-row items-center justify-between p-2">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={quotedPost.author.avatar} alt={quotedPost.author.name} />
                                    <AvatarFallback>{quotedPost.author.name ? quotedPost.author.name.charAt(0) : 'S'}</AvatarFallback>
                                </Avatar>
                                <p className="text-xs font-semibold">{quotedPost.author.name}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setQuotedPost(null)}>
                                <X className="h-3 w-3" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 text-xs text-muted-foreground">
                            <p className="line-clamp-2">{quotedPost.content}</p>
                        </CardContent>
                    </Card>
                )}
              </div>
              
              <div className="flex w-full items-center">
                  <Textarea
                      ref={textareaRef}
                      placeholder="author..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      disabled={isLoading}
                      className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-2 shadow-none text-base bg-transparent min-h-0 resize-none font-sans"
                      rows={1}
                  />

                  <div className="flex items-center">
                      <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <PlusCircle className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1" side="top" align="end">
                            <div className="flex items-center gap-1">
                                <MediaUploader onUpload={handleImageUpload}>
                                    <Button variant="ghost" size="icon"><ImageIcon className="h-5 w-5 text-muted-foreground" /></Button>
                                </MediaUploader>
                                <Button variant="ghost" size="icon" onClick={isRecording ? handleStopRecording : handleStartRecording}>
                                    <Mic className={cn("h-5 w-5 text-muted-foreground", isRecording && "text-red-500 animate-pulse")} />
                                </Button>
                                <FileUploader onUpload={handleFileUpload}>
                                    <Button variant="ghost" size="icon"><FileUp className="h-5 w-5 text-muted-foreground" /></Button>
                                </FileUploader>
                                <Dialog>
                                    <DialogTrigger asChild><Button variant="ghost" size="icon"><BriefcaseBusiness className="h-5 w-5 text-muted-foreground" /></Button></DialogTrigger>
                                    <CreateGigDialog onGigCreate={postGig} />
                                </Dialog>
                                <Popover>
                                    <PopoverTrigger asChild><Button variant="ghost" size="icon"><Smile className="h-5 w-5 text-muted-foreground" /></Button></PopoverTrigger>
                                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                                </Popover>
                            </div>
                        </PopoverContent>
                      </Popover>
                      <Button onClick={() => handlePost()} disabled={(!content.trim() && !imageUrl && !audioUrl && !quotedPost) || isLoading} size="sm" className="rounded-none px-4 h-9">
                          {isPosting ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                      </Button>
                  </div>
              </div>
          </div>
        </div>
    </>
  );
}

const useVote = (postId: string) => {
    const { user: authUser } = useUser();
    const supabase = useSupabase();
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authUser) {
            setIsLoading(false);
            return;
        };

        const fetchVote = async () => {
            setIsLoading(true);
            const { data } = await supabase.from('votes').select('direction').eq('post_id', postId).eq('user_id', authUser.id).single();
            setUserVote(data?.direction || null);
            setIsLoading(false);
        };
        fetchVote();
    }, [supabase, postId, authUser]);

    const handleVote = async (direction: 'up' | 'down') => {
        if (!authUser || isLoading) return;
        
        if (userVote === direction) {
            // Retract vote
            await supabase.from('votes').delete().match({ post_id: postId, user_id: authUser.id });
            setUserVote(null);
        } else {
            // Cast or change vote
            await supabase.from('votes').upsert({ post_id: postId, user_id: authUser.id, direction });
            setUserVote(direction);
        }
    };
    
    return { userVote, isLoading, handleVote };
};

const useBookmark = (post: PostType) => {
    const { user: authUser } = useUser();
    const supabase = useSupabase();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authUser) {
            setIsLoading(false);
            return;
        }
        const checkBookmark = async () => {
            setIsLoading(true);
            const { data } = await supabase.from('bookmarks').select('id').eq('ref_id', post.id).eq('user_id', authUser.id).single();
            setIsBookmarked(!!data);
            setIsLoading(false);
        };
        checkBookmark();
    }, [supabase, authUser, post.id]);

    const handleBookmark = async () => {
        if (!authUser) return;

        if (isBookmarked) {
            await supabase.from('bookmarks').delete().match({ ref_id: post.id, user_id: authUser.id });
            setIsBookmarked(false);
        } else {
             const bookmarkData: Omit<Bookmark, 'id' | 'savedAt'> = {
                type: post.type === 'job_opportunity' ? 'job' : 'post',
                refId: post.id,
                content: {
                    title: post.jobDetails?.title || `Post by ${post.author.name}`,
                    description: post.content.substring(0, 100),
                    image: post.author.avatar,
                }
            };
            await supabase.from('bookmarks').insert({ ...bookmarkData, user_id: authUser.id });
            setIsBookmarked(true);
        }
    };

    return { isBookmarked, isLoading, handleBookmark };
}


function ReplyComposer({ postId, onReplySent }: { postId: string; onReplySent: (reply: PostType) => void }) {
    const [content, setContent] = useState('');
    const { user: authUser } = useUser();
    const supabase = useSupabase();
    const { toast } = useToast();
    const [isReplying, setIsReplying] = useState(false);

    const handleReply = async () => {
        if (!content.trim() || !authUser || !supabase) return;
        setIsReplying(true);

        try {
            const { data: userProfile, error: userError } = await supabase.from('users').select('*').eq('id', authUser.id).single();
            if (userError || !userProfile) throw new Error("Current user not found.");

            const currentUser = userProfile as User;

            const newReplyData = {
                userId: authUser.id,
                author: {
                    id: authUser.id,
                    name: currentUser.name,
                    handle: currentUser.handle,
                    avatar: currentUser.avatar,
                    isAdmin: currentUser.isAdmin || false,
                    isSentrybaseVerified: currentUser.isSentrybaseVerified || false,
                    hasActiveSubscription: !!currentUser.subscription?.planId,
                },
                content: content.trim(),
                type: 'default',
                parent_post_id: postId,
            };
            
            const { data: insertedReply, error: insertError } = await supabase.from('replies').insert(newReplyData).select().single();
            
            if(insertError) throw insertError;
            
            onReplySent({ ...insertedReply, author: newReplyData.author } as PostType);
            setContent('');
            toast({ title: 'Reply sent!' });
        } catch (error) {
            console.error("Error sending reply:", error);
            toast({ variant: 'destructive', title: "Reply Failed", description: "Could not send reply." });
        } finally {
            setIsReplying(false);
        }
    };

    return (
        <div className="flex items-start gap-2 pt-2">
            <Avatar className="h-8 w-8">
                <AvatarImage src={authUser?.user_metadata.avatar_url || undefined} />
                <AvatarFallback>{authUser?.user_metadata.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-0 text-sm font-sans"
                    rows={1}
                />
                <Button size="sm" onClick={handleReply} disabled={!content.trim() || isReplying}>
                    {isReplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Reply
                </Button>
            </div>
        </div>
    );
}

function RepliesThread({ postId, depth }: { postId: string, depth: number }) {
    const supabase = useSupabase();
    const [replies, setReplies] = useState<PostType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReplies = async () => {
            if (!supabase || !postId) return;
            setIsLoading(true);
            const { data, error } = await supabase.from('replies').select('*, author:users(*)').eq('parent_post_id', postId).order('created_at', { ascending: true });
            
            if(data) {
                const formattedReplies = data.map((reply: any) => ({
                    ...reply,
                    author: {
                        id: reply.author.id,
                        name: reply.author.name,
                        handle: reply.author.handle,
                        avatar: reply.author.avatar,
                    }
                })) as PostType[];
                setReplies(formattedReplies);
            }
            setIsLoading(false);
        }
        fetchReplies();

        const channel = supabase.channel(`replies:${postId}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'replies', filter: `parent_post_id=eq.${postId}`}, 
            async (payload) => {
              const { data: authorData } = await supabase.from('users').select('*').eq('id', (payload.new as any).userId).single();
              const newReply = { ...payload.new, author: authorData } as PostType;
              setReplies(current => [...current, newReply]);
            }
          ).subscribe();
          
        return () => { supabase.removeChannel(channel) };

    }, [supabase, postId]);


    const handleNewReply = (newReply: PostType) => {
        setReplies(currentReplies => [...currentReplies, newReply]);
    };
    
    const handleRemoveReply = (replyId: string) => {
        setReplies(currentReplies => currentReplies.filter(reply => reply.id !== replyId));
    }
    
    const handleUpdateReply = (updatedReply: PostType) => {
        setReplies(currentReplies => currentReplies.map(reply => reply.id === updatedReply.id ? updatedReply : reply));
    }

    if (isLoading) {
        return <div className="pl-4 pt-2"><Loader2 className="h-4 w-4 animate-spin" /></div>;
    }
    
    const threadStyle = depth > 0 
        ? "space-y-3 pt-3" 
        : "space-y-3 pt-3 pl-4 border-l-2";

    return (
        <div className={threadStyle}>
            {replies.map(reply => (
                <PostCard key={reply.id} post={reply} isReply onReplyDeleted={handleRemoveReply} onReplyUpdated={handleUpdateReply} depth={depth + 1} />
            ))}
            <ReplyComposer postId={postId} onReplySent={handleNewReply} />
        </div>
    );
}

function QuoteDialog({ postToQuote, onQuote }: { postToQuote: PostType, onQuote: (content: string) => void }) {
    const [content, setContent] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongContent = postToQuote.content.length > 200;

    return (
      <Dialog>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Quote Post</DialogTitle>
                <DialogDescription>Add your comments to this post before sharing.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add your thoughts..."
                    className="min-h-[100px]"
                />
                <Card className="bg-muted/50">
                    <CardHeader className="flex flex-row items-center gap-3 p-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={postToQuote.author.avatar} alt={postToQuote.author.name} />
                            <AvatarFallback>{postToQuote.author.name ? postToQuote.author.name.charAt(0) : 'S'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-semibold">{postToQuote.author.name}</p>
                            <p className="text-xs text-muted-foreground">@{postToQuote.author.handle}</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 text-sm text-muted-foreground">
                        <p className={cn(!isExpanded && "line-clamp-4")}>{postToQuote.content}</p>
                        {isLongContent && (
                            <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setIsExpanded(!isExpanded)}>
                                {isExpanded ? 'Show less' : 'Show more'}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={() => onQuote(content)} disabled={!content.trim()}>Quote</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
}

function useRealtimePost(initialPost: PostType) {
    const supabase = useSupabase();
    const [post, setPost] = useState(initialPost);
    const [authorProfile, setAuthorProfile] = useState<User | null>(null);

    useEffect(() => {
        const channel = supabase
            .channel(`post:${initialPost.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: initialPost.isReply ? 'replies' : 'posts',
                filter: `id=eq.${initialPost.id}`
            }, (payload) => {
                setPost(current => ({ ...current, ...payload.new }));
            })
            .subscribe();

        return () => { supabase.removeChannel(channel) };

    }, [supabase, initialPost.id, initialPost.isReply]);
    
    useEffect(() => {
        setAuthorProfile(initialPost.author as User);
    }, [initialPost.author]);

    const displayPost = {
        ...post,
        author: {
            ...post.author,
            name: authorProfile?.name || post.author?.name,
            handle: authorProfile?.handle || post.author?.handle,
            avatar: authorProfile?.avatar || post.author?.avatar,
            isAdmin: authorProfile?.isAdmin || post.author?.isAdmin,
            isSentrybaseVerified: authorProfile?.isSentrybaseVerified || post.author?.isSentrybaseVerified,
            hasActiveSubscription: !!authorProfile?.subscription?.planId,
        }
    };

    return { post: displayPost, authorProfile };
}

function EditPostDialog({ post, onSave, onCancel }: { post: PostType; onSave: (newContent: string) => void; onCancel: () => void }) {
    const [content, setContent] = useState(post.content);
    
    return (
        <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[120px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button onClick={() => onSave(content)} disabled={content.trim() === post.content}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function PostCard({ post: initialPost, isReply = false, onReplyDeleted, onReplyUpdated, onPostDeleted, depth = 0 }: { post: PostType; isReply?: boolean; onReplyDeleted?: (replyId: string) => void; onReplyUpdated?: (updatedReply: PostType) => void; onPostDeleted?: (postId: string) => void; depth?: number; }) {
    if (!initialPost) return null;
    
    const { post, authorProfile } = useRealtimePost({ ...initialPost, isReply });
    const { userVote, handleVote } = useVote(post.id);
    const { isBookmarked, handleBookmark } = useBookmark(post);
    const { toast } = useToast();
    const { user: authUser } = useUser();
    const supabase = useSupabase();
    const [isBriefingExpanded, setIsBriefingExpanded] = useState(false);
    const [isRepliesOpen, setIsRepliesOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleApplyForGig = async (applicationDetails: any) => {
        if (!authUser) {
            toast({ variant: 'destructive', title: "Error", description: "You must be logged in to apply." });
            return;
        }
        
        const { error } = await supabase.functions.invoke('gig-application', {
            body: {
                gigOwnerId: post.author.id,
                gigId: post.id,
                gigTitle: post.jobDetails?.title || 'Untitled Gig',
                applicantId: authUser.id,
                applicantName: authUser.user_metadata.full_name,
                ...applicationDetails,
            }
        });
        
        if (error) {
            console.error("Error sending application:", error);
            toast({ variant: 'destructive', title: 'Application Failed', description: 'Could not send your application. Please try again later.' });
        } else {
            toast({ title: "Application Sent!", description: `Your application for "${post.jobDetails?.title}" has been sent.` });
        }
    };

    const handleRepost = async (isQuote: boolean, quoteContent?: string) => {
        if (!authUser || !supabase) return;

        if (isQuote) {
            window.dispatchEvent(new CustomEvent('quotePost', { detail: post }));
            return;
        }
        
        const { data: userProfile, error: userError } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        if(userError || !userProfile) return;

        const currentUser = userProfile as User;
        
        const newPost: Omit<PostType, 'id' | 'createdAt'> = {
            userId: authUser.id,
            author: {
                id: authUser.id,
                name: currentUser.name,
                handle: currentUser.handle,
                avatar: currentUser.avatar,
                isAdmin: currentUser.isAdmin || false,
                isSentrybaseVerified: currentUser.isSentrybaseVerified || false,
                hasActiveSubscription: !!currentUser.subscription?.planId,
            },
            content: '',
            type: 'repost',
            voteCount: 0,
            replyCount: 0,
            repostCount: 0,
            originalPost: {
                id: post.id,
                authorName: post.author.name,
                authorHandle: post.author.handle,
                authorAvatar: post.author.avatar,
                content: post.content,
            },
        };

        const { error } = await supabase.from('posts').insert([newPost]);
        if(error) {
            toast({ variant: "destructive", title: "Repost failed" });
        } else {
            toast({ title: "Post Reposted" });
        }
    };

    const handleDeletePost = async () => {
        if (!authUser || !supabase || authUser.id !== post.userId) return;

        const table = isReply ? 'replies' : 'posts';
        const { error } = await supabase.from(table).delete().eq('id', post.id);

        if (error) {
            console.error("Error deleting post:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the post.' });
        } else {
            toast({ title: 'Post Deleted', description: 'Your post has been successfully deleted.' });
            if (isReply && onReplyDeleted) {
                onReplyDeleted(post.id);
            }
            if (!isReply && onPostDeleted) {
                onPostDeleted(post.id);
            }
        }
    };
    
     const handleEditSave = async (newContent: string) => {
        if (!authUser || !supabase || authUser.id !== post.userId) return;
        
        const table = isReply ? 'replies' : 'posts';
        const { error } = await supabase.from(table).update({ content: newContent }).eq('id', post.id);

        if (error) {
            console.error("Error updating post:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the post.' });
        } else {
            toast({ title: 'Post Updated' });
            if (isReply && onReplyUpdated) {
                onReplyUpdated({ ...post, content: newContent });
            }
        }
        setIsEditing(false);
    };

    const isGig = post.type === 'job_opportunity';
    const isBriefingLong = post.content && post.content.length > 200;
    
    const authorDescription = [authorProfile?.jobTitle, authorProfile?.company].filter(Boolean).join(' at ');
    const isOnline = authorProfile?.onlineStatus?.status === 'online';

    return (
        <Card className={cn("bg-transparent border-x-0 border-t-0 rounded-none", isGig && "bg-muted")}>
             {isEditing && <EditPostDialog post={post} onSave={handleEditSave} onCancel={() => setIsEditing(false)} />}
             <Collapsible open={isRepliesOpen} onOpenChange={setIsRepliesOpen}>
                <div className="flex flex-row items-start gap-4 p-4">
                    <Dialog>
                        <DialogTrigger asChild>
                             <Avatar className="cursor-pointer">
                                {post.author.avatar ? (
                                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                ): (
                                    <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full" />
                                )}
                                <AvatarFallback>{post.author.name ? post.author.name.charAt(0) : 'S'}</AvatarFallback>
                            </Avatar>
                        </DialogTrigger>
                        {authorProfile && (
                            <UserProfileDialog user={authorProfile} />
                        )}
                    </Dialog>
                    <div className="flex-1">
                        <CardHeader className="p-0 flex flex-row justify-between items-start">
                            <Dialog>
                                <DialogTrigger asChild>
                                     <div className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold hover:underline">{post.author.name}</p>
                                            {isOnline && <div className="h-2 w-2 rounded-full bg-green-500" title="Online"></div>}
                                            {post.author.isSentrybaseVerified && <ShieldCheck className="h-4 w-4 text-primary" />}
                                            {post.author.hasActiveSubscription && <Feather className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {authorDescription || `@${post.author.handle}`} &middot; {formatRelativeTime(post.createdAt as string)}
                                        </p>
                                    </div>
                                </DialogTrigger>
                                 {authorProfile && <UserProfileDialog user={authorProfile} />}
                            </Dialog>
                            {authUser?.id === post.userId && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                                            <Edit className="h-4 w-4 text-muted-foreground" />
                                            <span>Edit Post</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleDeletePost} className="flex items-center gap-2 text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                            <span>Delete Post</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </CardHeader>
                         <CardContent className="p-0 pt-2 space-y-2">
                            {isGig && post.jobDetails && (
                                <div className="border-l-2 border-primary/20 pl-4 py-2 space-y-3 my-2">
                                    <h3 className="font-bold text-lg">{post.jobDetails.title}</h3>
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold">${post.jobDetails.budget}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {post.jobDetails.keywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                                    </div>

                                    {post.content && (
                                         <Collapsible onOpenChange={setIsBriefingExpanded} open={isBriefingExpanded}>
                                            <div className={cn("text-sm pt-2", !isBriefingExpanded && "line-clamp-3")}>
                                                {post.content}
                                            </div>
                                            {isBriefingLong && (
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="link" className="p-0 h-auto text-xs">
                                                        {isBriefingExpanded ? 'Show less' : 'Show more'}
                                                    </Button>
                                                </CollapsibleTrigger>
                                            )}
                                        </Collapsible>
                                    )}

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="secondary">Apply for Gig</Button>
                                        </DialogTrigger>
                                        <ApplyForGigDialog gig={post} onApply={handleApplyForGig} />
                                    </Dialog>
                                </div>
                            )}
                            
                            {!isGig && post.content && <p className="whitespace-pre-wrap font-nata">{post.content}</p>}
                            
                            {post.image && (
                                <div className="mt-2 relative w-full overflow-hidden rounded-lg">
                                    <Image 
                                        src={post.image} 
                                        alt="Post image" 
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        style={{ width: '100%', height: 'auto' }} 
                                        className={cn("object-contain", post.objectFit === 'cover' && "object-cover aspect-video")}
                                    />
                                </div>
                            )}
                            
                            {post.audioUrl && (
                                <div className="mt-4">
                                    <audio controls src={post.audioUrl} className="w-full"></audio>
                                </div>
                            )}
                            {post.fileUrl && (
                              <a href={post.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="justify-start">
                                      <Paperclip className="mr-2 h-4 w-4" />
                                      {post.fileName || "View Attachment"}
                                  </Button>
                              </a>
                            )}
                            {post.originalPost && (
                                <Card className="mt-4 border-dashed border-muted-foreground/30 shadow-none">
                                    <CardHeader className="flex flex-row items-center gap-2 p-3">
                                         <Avatar className="h-6 w-6">
                                            <AvatarImage src={post.originalPost.authorAvatar} alt={post.originalPost.authorName} />
                                            <AvatarFallback>{post.originalPost.authorName ? post.originalPost.authorName.charAt(0) : 'S'}</AvatarFallback>
                                        </Avatar>
                                        <p className="text-sm font-semibold">{post.originalPost.authorName}</p>
                                        <p className="text-xs text-muted-foreground">@{post.originalPost.authorHandle}</p>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                       {post.originalPost.content && <p className="text-sm text-muted-foreground line-clamp-4">{post.originalPost.content}</p>}
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2 pb-0 px-0 mt-2">
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="icon" onClick={() => handleVote('up')} className="h-8 w-8 group hover:bg-transparent">
                                            <ArrowUp className={cn("h-4 w-4 text-muted-foreground group-hover:text-green-500", userVote === 'up' && "text-green-500")} />
                                        </Button>
                                        <span className="font-semibold text-sm min-w-[1rem] text-center">{post.voteCount || 0}</span>
                                        <Button variant="ghost" size="icon" onClick={() => handleVote('down')} className="h-8 w-8 group hover:bg-transparent">
                                            <ArrowDown className={cn("h-4 w-4 text-muted-foreground group-hover:text-red-500", userVote === 'down' && "text-red-500")} />
                                        </Button>
                                    </div>
                                    <CollapsibleTrigger asChild>
                                        <div className="flex items-center ml-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 group hover:bg-transparent">
                                                <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-gray-500" />
                                            </Button>
                                            {(post.replyCount ?? 0) > 0 && <span className="-ml-2">{post.replyCount}</span>}
                                        </div>
                                    </CollapsibleTrigger>
                                    
                                    <div className="flex items-center ml-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleRepost(false)} className="h-8 w-8 group hover:bg-transparent">
                                            <Repeat className="h-4 w-4 text-muted-foreground group-hover:text-green-500" />
                                        </Button>
                                         {(post.repostCount ?? 0) > 0 && <span className="-ml-2">{post.repostCount}</span>}
                                    </div>
                                    
                                    <Button variant="ghost" size="icon" onClick={() => handleRepost(true)} className="h-8 w-8 group ml-2 hover:bg-transparent">
                                        <Quote className="h-4 w-4 text-muted-foreground group-hover:text-purple-500" />
                                    </Button>
                                </div>
                                <div className="flex">
                                    <Button variant="ghost" size="icon" onClick={handleBookmark} className="h-8 w-8 group hover:bg-transparent">
                                        <BookmarkIcon className={cn("h-4 w-4 text-muted-foreground group-hover:text-yellow-500", isBookmarked && "fill-yellow-400 text-yellow-500")} />
                                    </Button>
                                </div>
                        </CardFooter>
                    </div>
                </div>
                 <CollapsibleContent className="px-4 pb-2">
                    {depth < 2 && <RepliesThread postId={post.id} depth={depth} />}
                </CollapsibleContent>
             </Collapsible>
        </Card>
    )
}

function UserProfileDialog({ user }: { user: User }) {
    const { user: authUser } = useUser();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = useSupabase();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (!supabase || !authUser) {
            setIsLoading(false);
            return;
        }
        const checkFollowing = async () => {
            setIsLoading(true);
            const { data } = await supabase.from('followers').select('id').eq('follower_id', authUser.id).eq('following_id', user.id).single();
            setIsFollowing(!!data);
            setIsLoading(false);
        }
        checkFollowing();
    }, [supabase, authUser, user.id]);

    const handleToggleFollow = async () => {
        if (!authUser || !supabase) return;
        setIsLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(supabase, authUser.id, user.id);
                toast({ title: 'Unfollowed!' });
                setIsFollowing(false);
            } else {
                await followUser(supabase, authUser.id, user.id);
                toast({ title: 'Followed!' });
                setIsFollowing(true);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update follow status.' });
        }
        setIsLoading(false);
    };

    let backgroundStyle: React.CSSProperties = {};
    let backgroundClass = 'bg-gradient-to-br from-gray-800 via-gray-900 to-black'; // Default
    if (user.businessCardBackground) {
        if (user.businessCardBackground.startsWith('http') || user.businessCardBackground.startsWith('data:')) {
            backgroundStyle = { backgroundImage: `url(${user.businessCardBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' };
            backgroundClass = '';
        } else {
            backgroundClass = user.businessCardBackground;
        }
    }

    return (
        <DialogContent className="max-w-md p-0 border-0">
            <div className={cn("relative w-full overflow-hidden rounded-t-lg pt-12 pb-6 px-6", backgroundClass)} style={backgroundStyle}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative z-10 flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-4 border-background/50 shadow-lg flex-shrink-0">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="text-white">
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        {user.motto && <p className="text-sm font-light italic opacity-90">"{user.motto}"</p>}
                    </div>
                </div>
            </div>

            <div className="p-6 pt-4 space-y-4">
                {authUser?.id && authUser.id !== user.id && (
                    <div className="flex justify-end -mt-16 mb-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="ml-2">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleToggleFollow} disabled={isLoading}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">Block</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
                <div className="space-y-3">
                    {user.jobTitle && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <span>{user.jobTitle} {user.company && ` at ${user.company}`}</span>
                        </div>
                    )}
                    {user.externalUrl && (
                        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary h-auto p-0 text-sm w-full justify-start">
                            <a href={user.externalUrl} target="_blank" rel="noopener noreferrer">
                                <LinkIcon className="mr-2 h-4 w-4"/>
                                {user.externalUrlName || user.externalUrl.replace(/^(https?:\/\/)?(www\.)?/, '')}
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        </DialogContent>
    );
}

function FollowButton({ currentUserId, targetUserId, onFollow }: { currentUserId: string, targetUserId: string, onFollow: (targetUserId: string) => void }) {
    const supabase = useSupabase();
    const { toast } = useToast();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!supabase) return;
        setIsLoading(true);
        const checkFollowing = async () => {
            const { data } = await supabase.from('followers').select('id').eq('follower_id', currentUserId).eq('following_id', targetUserId).single();
            setIsFollowing(!!data);
            setIsLoading(false);
        }
        checkFollowing();
    }, [supabase, currentUserId, targetUserId]);

    const handleToggleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!supabase) return;
        setIsLoading(true);
        try {
            if (isFollowing) {
                // In a real app, you'd toggle.
                await followUser(supabase, currentUserId, targetUserId);
            } else {
                await followUser(supabase, currentUserId, targetUserId);
            }
            toast({ title: 'Followed!' });
            onFollow(targetUserId); // Notify parent to remove from suggestions
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update follow status.' });
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return <Button size="sm" variant="outline" disabled className="w-20"><Loader2 className="h-4 w-4 animate-spin" /></Button>;
    }
    
    return (
        <Button size="sm" variant="outline" onClick={handleToggleFollow} className="w-20">
            Follow
        </Button>
    );
}

function SuggestedUsers() {
    const { user: authUser } = useUser();
    const { suggestedUsers: allSuggestions, isLoading: isLoadingSuggestions } = useSuggestedUsers(authUser?.id);
    const [displaySuggestions, setDisplaySuggestions] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const storedState = localStorage.getItem('whoToFollowCollapsed');
        if (storedState) {
            setIsOpen(JSON.parse(storedState));
        }
    }, []);

    useEffect(() => {
        if (allSuggestions) {
            const dismissed = JSON.parse(localStorage.getItem('dismissedUsers') || '[]');
            setDisplaySuggestions(allSuggestions.filter(u => !dismissed.includes(u.id)).slice(0, 3));
        }
    }, [allSuggestions]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        localStorage.setItem('whoToFollowCollapsed', JSON.stringify(open));
    };


    const handleFollowOrDismiss = (userId: string) => {
        setDisplaySuggestions(prev => prev.filter(u => u.id !== userId));
        try {
            const dismissed = JSON.parse(localStorage.getItem('dismissedUsers') || '[]');
            if (!dismissed.includes(userId)) {
                localStorage.setItem('dismissedUsers', JSON.stringify([...dismissed, userId]));
            }
        } catch (e) {
            console.error("Failed to update dismissed users in localStorage", e);
        }
    };
    
    if (isLoadingSuggestions) {
        return (
            <Collapsible open={isOpen} onOpenChange={handleOpenChange} className="-mt-4">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <div className="space-y-2 mt-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </Collapsible>
        );
    }

    if (!displaySuggestions || displaySuggestions.length === 0) {
        return null; 
    }

    return (
        <Collapsible open={isOpen} onOpenChange={handleOpenChange} className="-mt-4">
            <div className="relative flex items-center justify-between pb-2 mb-2">
                <h2 className="font-display tracking-tight text-xl">Who to Follow</h2>
                 <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                       <ChevronDown className="h-4 w-4 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
                       <span className="sr-only">Toggle</span>
                    </Button>
                </CollapsibleTrigger>
                <div className="absolute bottom-0 left-0 w-full h-px bg-border" />
            </div>
            <CollapsibleContent>
                <div className="relative pt-2">
                    <div className="space-y-1">
                        {displaySuggestions.map(user => (
                            <Dialog key={user.id}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 group">
                                        <Avatar className="h-10 w-10">
                                            {user.avatar ? (
                                                <AvatarImage src={user.avatar} alt={user.name} />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full" />
                                            )}
                                            <AvatarFallback>{user.name ? user.name.charAt(0) : 'S'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <DialogTrigger asChild>
                                                <p className="font-semibold text-sm cursor-pointer hover:underline">{user.name}</p>
                                            </DialogTrigger>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{user.headline}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFollowOrDismiss(user.id)}><X className="h-4 w-4" /></Button>
                                        {authUser?.id && <FollowButton currentUserId={authUser.id} targetUserId={user.id} onFollow={handleFollowOrDismiss} />}
                                    </div>
                                </div>
                                <UserProfileDialog user={user} />
                            </Dialog>
                        ))}
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

const POSTS_PER_PAGE = 10;

function PostFeed({ filter, refreshKey, nicheFilter, onPostCreated }: { filter: 'global' | 'following'; refreshKey: number; nicheFilter: string | null; onPostCreated: (post: PostType) => void; }) {
    const supabase = useSupabase();
    const { user: authUser } = useUser();
    const scrollRef = useContext(MainScrollContext);
    
    const [posts, setPosts] = useState<PostType[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [followingIds, setFollowingIds] = useState<string[]>([]);
    const [isLoadingFollowing, setIsLoadingFollowing] = useState(true);

    useEffect(() => {
        if (!authUser) {
            setIsLoadingFollowing(false);
            return;
        }
        const fetchFollowing = async () => {
            const { data, error } = await supabase.from('followers').select('following_id').eq('follower_id', authUser.id);
            if (data) {
                const ids = data.map(f => f.following_id);
                if(authUser.id) ids.push(authUser.id);
                setFollowingIds(ids);
            }
            setIsLoadingFollowing(false);
        }
        fetchFollowing();
    }, [supabase, authUser]);

    const fetchPosts = useCallback(async (isInitialLoad: boolean) => {
        if (!supabase) return;
        if (filter === 'following' && followingIds.length === 0 && !isLoadingFollowing) {
            setPosts([]);
            setHasMore(false);
            setIsLoading(false);
            return;
        }

        if (isInitialLoad) setIsLoading(true); else setIsLoadingMore(true);
        setError(null);
        
        try {
            const from = isInitialLoad ? 0 : page * POSTS_PER_PAGE;
            const to = from + POSTS_PER_PAGE - 1;

            let query = supabase
                .from('posts')
                .select('*, author:users(*)');

            if (filter === 'following' && followingIds.length > 0) {
                 query = query.in('userId', followingIds);
            }
            
            // Niche filtering would need a more complex query, likely a JOIN or a function call.
            // This is a simplification.
            if (nicheFilter) {
                 // query = query.rpc('posts_in_niche', { niche_name: nicheFilter });
            }

            query = query.order('created_at', { ascending: false }).range(from, to);

            const { data, error: queryError } = await query;
            
            if (queryError) throw queryError;
            
            let newPosts = (data as any[]).map((post: any) => ({
                ...post,
                author: post.author ? {
                    id: post.author.id,
                    name: post.author.name,
                    handle: post.author.handle,
                    avatar: post.author.avatar,
                } : { id: 'unknown', name: 'Unknown', handle: 'unknown', avatar: '' }
            })) as PostType[];
            
            setPosts(prev => isInitialLoad ? newPosts : [...prev, ...newPosts]);
            setPage(prev => isInitialLoad ? 1 : prev + 1);
            setHasMore(newPosts.length === POSTS_PER_PAGE);

        } catch (err: any) {
            setError(err);
            console.error("Error fetching posts:", err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [supabase, filter, followingIds, page, isLoadingFollowing, nicheFilter]);
    
    // This effect handles the optimistic update from PostComposer
    useEffect(() => {
        const handleNewPost = (event: Event) => {
            const customEvent = event as CustomEvent<PostType>;
            setPosts(prevPosts => [customEvent.detail, ...prevPosts]);
        };
        window.addEventListener('newPost', handleNewPost);
        return () => window.removeEventListener('newPost', handleNewPost);
    }, []);

    useEffect(() => {
        setPosts([]);
        setPage(0);
        setHasMore(true);
        fetchPosts(true);
    }, [filter, refreshKey, nicheFilter, followingIds]);

    const loadMoreRef = useCallback((node: HTMLDivElement) => {
        if (isLoading || isLoadingMore) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchPosts(false);
            }
        }, {
            root: scrollRef?.current, 
            rootMargin: '0px 0px 400px 0px',
        });

        if (node) observerRef.current.observe(node);
    }, [isLoading, isLoadingMore, hasMore, fetchPosts, scrollRef]);
    
    const removeOptimisticPost = (postId: string) => {
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    };
    
    if (isLoading) {
        return (
            <div className="space-y-4 pt-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-3 w-[100px]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }
    
    if (error) {
        return <p className="text-destructive">Error loading feed. Check console for details.</p>;
    }
    
    if (posts.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                <p>
                    {nicheFilter 
                        ? `No posts found for the "${nicheFilter}" niche.`
                        : "Your following feed is empty."
                    }
                </p>
                <p className="text-sm">
                     {nicheFilter
                        ? "Try clearing the filter or checking back later."
                        : "Follow some users to see their posts here."
                     }
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3 pt-4">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} onPostDeleted={removeOptimisticPost} />
                ))}
                <div ref={loadMoreRef} className="h-10 w-full flex items-center justify-center">
                    {isLoadingMore && <Loader2 className="h-5 w-5 animate-spin" />}
                    {!hasMore && posts.length > 0 && <p className="text-sm text-muted-foreground">You've reached the end.</p>}
                </div>
            </div>
        </>
    );
}

export default function ProfessionsPage() {
    const [filter, setFilter] = useState<'global' | 'following'>('global');
    const [refreshKey, setRefreshKey] = useState(0);
    const { feedFilter, clearFeedFilter } = useContext(AgentContext);
    
    const handleOptimisticPost = (newPost: PostType) => {
        window.dispatchEvent(new CustomEvent('newPost', { detail: newPost }));
    };

    const handleRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
        if (feedFilter) {
            clearFeedFilter();
        }
    };
    
    return (
        <ClientOnly>
            <div className="flex flex-col h-full relative">
                <header className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm px-4 md:px-8 transition-colors duration-300">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                         <h1 className="text-3xl font-logo lowercase tracking-tight">professions</h1>
                         <div className="flex items-center">
                            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                                <TabsList className="bg-transparent p-0">
                                    <TabsTrigger value="global" className="text-xs h-7 px-3">Global</TabsTrigger>
                                    <TabsTrigger value="following" className="text-xs h-7 px-3">Following</TabsTrigger>
                                </TabsList>
                            </Tabs>
                             <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-8 w-8 ml-1">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                         </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto pt-[65px] relative">
                    <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 pt-0 pb-32">
                        {feedFilter && (
                             <Alert className="mb-4">
                                <Search className="h-4 w-4" />
                                <AlertTitle>Feed Filter Active</AlertTitle>
                                <AlertDescription className="flex items-center justify-between">
                                    Showing posts from the "{feedFilter.niche}" niche.
                                    <Button variant="ghost" size="sm" onClick={clearFeedFilter}>Clear Filter</Button>
                                </AlertDescription>
                            </Alert>
                        )}
                        {filter === 'global' && !feedFilter && (
                            <SuggestedUsers />
                        )}
                        <PostFeed filter={filter} refreshKey={refreshKey} nicheFilter={feedFilter?.niche || null} onPostCreated={handleOptimisticPost} />
                    </div>
                    
                    <div className="sticky bottom-14 w-full flex justify-center z-20 md:hidden pb-[calc(env(safe-area-inset-bottom))]">
                        <PostComposer onPostCreated={handleOptimisticPost} />
                    </div>
                    <div className="hidden md:flex md:sticky md:bottom-0 md:w-full md:justify-center md:z-20">
                         <PostComposer onPostCreated={handleOptimisticPost} />
                    </div>
                </main>
            </div>
        </ClientOnly>
    );
}
