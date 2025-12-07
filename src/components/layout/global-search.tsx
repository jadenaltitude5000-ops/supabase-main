
"use client";

import { useState, useMemo, useEffect, useContext } from "react";
import { Search, Bookmark, Menu, User as UserIcon, LogOut, Settings, CreditCard, LifeBuoy, Gift, FileText, Users, X, Bell, Briefcase, ChevronDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSidebar } from "../ui/sidebar";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeSwitcher } from "./theme-switcher";
import { useUser, useSupabase } from "@/lib/supabase/provider";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { DonateDialog } from "../features/donations/DonateDialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { User as UserType, Notification, Project, Post, Bookmark as BookmarkType } from "@/lib/types";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { AgentContext } from "@/context/agent-context";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from 'date-fns';

function BookmarksPanel() {
    const { user: authUser } = useUser();
    const supabase = useSupabase();
    const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authUser || !supabase) {
            setIsLoading(false);
            return;
        };

        const fetchBookmarks = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', authUser.id)
                .order('saved_at', { ascending: false });

            if (error) {
                console.error("Error fetching bookmarks:", error);
            } else if (data) {
                setBookmarks(data as BookmarkType[]);
            }
            setIsLoading(false);
        };

        fetchBookmarks();
    }, [authUser, supabase]);


    return (
        <SheetContent>
            <SheetHeader>
                <SheetTitle>My Bookmarks</SheetTitle>
                <SheetDescription>
                    Quickly access your saved users, posts, and jobs.
                </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100%-4rem)] mt-4 pr-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                ) : bookmarks && bookmarks.length > 0 ? (
                    <div className="space-y-3">
                        {bookmarks.map(bookmark => (
                            <div key={bookmark.id} className="flex items-center gap-4 rounded-md border p-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={(bookmark.content as any)?.image} />
                                    <AvatarFallback>{(bookmark.content as any)?.title?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold truncate">{(bookmark.content as any)?.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{(bookmark.content as any)?.description}</p>
                                </div>
                                <Button variant="secondary" size="sm" asChild>
                                    <Link href={`/${bookmark.type}s/${bookmark.ref_id}`}>View</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Bookmark className="h-12 w-12 mb-4" />
                        <h3 className="text-lg font-semibold">No Bookmarks Yet</h3>
                        <p className="text-sm">Save posts, users, or jobs to find them here later.</p>
                    </div>
                )}
            </ScrollArea>
        </SheetContent>
    )
}

export function NotificationsPanel() {
    const { user: authUser } = useUser();
    const supabase = useSupabase();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
        if (!authUser || !supabase) {
            setIsLoading(false);
            return;
        }

        const fetchNotifications = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (error) {
                console.error("Error fetching notifications:", error);
            } else if (data) {
                setNotifications(data as Notification[]);
            }
            setIsLoading(false);
        };
        
        fetchNotifications();

        const channel = supabase.channel(`notifications:${authUser.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${authUser.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setNotifications(current => [payload.new as Notification, ...current]);
                    }
                    if (payload.eventType === 'UPDATE') {
                        setNotifications(current => current.map(n => n.id === payload.new.id ? payload.new as Notification : n));
                    }
                }
            ).subscribe();

        return () => {
            supabase.removeChannel(channel);
        }

    }, [authUser, supabase]);

    const handleMarkAsRead = async (notificationId: string) => {
        if (!authUser || !supabase) return;
        
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) {
            console.error("Error marking notification as read:", error);
        }
    };
    
    return (
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100%-3rem)] mt-4 -mx-6 px-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                           <div key={i} className="flex items-start space-x-4">
                             <Skeleton className="h-10 w-10 rounded-full" />
                             <div className="space-y-2 flex-1">
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-2/3" />
                             </div>
                           </div>
                        ))}
                    </div>
                ) : notifications && notifications.length > 0 ? (
                    <div className="space-y-1">
                        {notifications.map(notif => (
                            <div key={notif.id} className={cn("flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-accent", !notif.is_read && "bg-accent/50")}>
                                <div className="mt-1 h-2 w-2 rounded-full bg-primary" style={{ visibility: notif.is_read ? 'hidden' : 'visible' }} />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">{notif.title}</p>
                                    <p className="text-sm text-muted-foreground">{notif.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {notif.created_at ? formatDistanceToNow(new Date(notif.created_at as string), { addSuffix: true }) : ''}
                                    </p>
                                </div>
                                {!notif.is_read && (
                                     <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notif.id)}>Mark as Read</Button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mb-4" />
                        <h3 className="text-lg font-semibold">No New Notifications</h3>
                        <p className="text-sm">You're all caught up!</p>
                    </div>
                )}
            </ScrollArea>
        </SheetContent>
    )
}

function Sorter() {
    const { user: authUser } = useUser();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('collection');
    const [searchQuery, setSearchQuery] = useState('');
    const { setFeedFilter } = useContext(AgentContext);
    const supabase = useSupabase();

    // Data fetching states
    const [allUsers, setAllUsers] = useState<UserType[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [colleagueIds, setColleagueIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!supabase) return;
        const fetchInitialData = async () => {
            const { data: usersData } = await supabase.from('users').select('*').limit(50);
            if(usersData) setAllUsers(usersData as UserType[]);
            
            const { data: postsData } = await supabase.from('posts').select('*').limit(50);
            if(postsData) setAllPosts(postsData as Post[]);
            
            // This assumes a 'projects' table exists. Adjust if needed.
            const { data: projectsData } = await supabase.from('projects').select('*').limit(50);
            if(projectsData) setAllProjects(projectsData as Project[]);

            if(authUser) {
                const { data: colleaguesData } = await supabase.from('colleagues').select('colleague_id').eq('user_id', authUser.id);
                if(colleaguesData) setColleagueIds(new Set(colleaguesData.map(c => c.colleague_id)));
            }
        };
        fetchInitialData();
    }, [authUser, supabase]);
    
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => unknown) => {
        setOpen(false);
        command();
    };

    const handleSearchAgent = (query: string) => {
        if(query.toLowerCase().includes('niche:')) {
            const niche = query.split('niche:')[1].trim();
            if(niche) {
                setFeedFilter({ niche });
                runCommand(() => router.push('/professions'));
            }
        }
        setSearchQuery(query);
    }
    
    const filteredColleagues = useMemo(() => {
        if (!searchQuery) return allUsers?.filter(user => colleagueIds.has(user.id)) || [];
        return (allUsers || []).filter(user => 
            colleagueIds.has(user.id) &&
            (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.handle?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [allUsers, colleagueIds, searchQuery]);

    const filteredPeople = useMemo(() => {
        const nonColleagues = allUsers.filter(user => !colleagueIds.has(user.id));
        if (!searchQuery) return nonColleagues;
        return nonColleagues.filter(user => 
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.handle?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allUsers, colleagueIds, searchQuery]);


    const filteredPosts = useMemo(() => {
        if (!searchQuery) return allPosts || [];
        return (allPosts || []).filter(post => 
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allPosts, searchQuery]);

    const filteredProjects = useMemo(() => {
        if (!searchQuery) return allProjects || [];
        return (allProjects || []).filter(project => 
            project.project_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allProjects, searchQuery]);

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-full justify-start rounded-md border-border text-sm text-muted-foreground sm:pr-12"
                onClick={() => setOpen(true)}
            >
                <span className="hidden lg:inline-flex">Agent Sentrybase...</span>
                <span className="inline-flex lg:hidden">command</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded border bg-transparent px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  ⌘K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput 
                    placeholder="Agent search for people, articles, career opportunities..." 
                    value={searchQuery}
                    onValueChange={handleSearchAgent}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    
                    <CommandGroup heading="Suggestions">
                         {(activeTab === 'collection' || activeTab === 'network') && filteredColleagues.length > 0 && (
                            <CommandGroup heading="Colleagues">
                                {filteredColleagues.slice(0, 5).map(user => (
                                    <CommandItem key={user.id} onSelect={() => runCommand(() => router.push(`/u/${user.handle}`))}>
                                        <Avatar className="mr-2 h-6 w-6">
                                            <AvatarImage src={user.avatar || undefined} />
                                            <AvatarFallback>{user.name ? user.name.charAt(0) : 'S'}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                        <span className="text-xs text-muted-foreground ml-2">@{user.handle}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {(activeTab === 'collection' || activeTab === 'network') && filteredPeople.length > 0 && (
                            <CommandGroup heading="People">
                                {filteredPeople.slice(0, 5).map(user => (
                                    <CommandItem key={user.id} onSelect={() => runCommand(() => router.push(`/u/${user.handle}`))}>
                                        <Avatar className="mr-2 h-6 w-6">
                                            <AvatarImage src={user.avatar || undefined} />
                                            <AvatarFallback>{user.name ? user.name.charAt(0) : 'S'}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                        <span className="text-xs text-muted-foreground ml-2">@{user.handle}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {(activeTab === 'collection' || activeTab === 'articles') && filteredPosts.length > 0 && (
                             <CommandGroup heading="Articles">
                                {filteredPosts.slice(0, 5).map(post => (
                                    <CommandItem key={post.id} onSelect={() => runCommand(() => router.push(`/professions#${post.id}`))}>
                                        <span className="mr-2">-</span>
                                        <span className="whitespace-normal line-clamp-1">{post.content}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {(activeTab === 'collection' || activeTab === 'career') && filteredProjects.length > 0 && (
                             <CommandGroup heading="Career">
                               {filteredProjects.slice(0, 5).map(project => (
                                    <CommandItem key={project.id} onSelect={() => runCommand(() => router.push('/boardrooms'))}>
                                        <span className="mr-2">-</span>
                                        <span className="whitespace-normal">{project.project_name}</span>
                                    </CommandItem>
                               ))}
                             </CommandGroup>
                        )}
                    </CommandGroup>

                </CommandList>
                <div className="p-2 border-t">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4 bg-transparent">
                            <TabsTrigger value="collection">Collection</TabsTrigger>
                            <TabsTrigger value="network">Network</TabsTrigger>
                            <TabsTrigger value="articles">Articles</TabsTrigger>
                            <TabsTrigger value="career">Career</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CommandDialog>
        </>
    );
}


export function GlobalSearch() {
  const { state: sidebarState, toggleSidebar } = useSidebar();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { user: authUser } = useUser();
  const supabase = useSupabase();
  const [userProfile, setUserProfile] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
        if(authUser && supabase) {
            const { data, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();
            if (data) {
                setUserProfile(data as UserType);
            }
        }
    }
    fetchUserProfile();
  }, [authUser, supabase]);
  
  const avatarUrl = userProfile?.avatar || authUser?.user_metadata?.avatar_url;
  const displayName = userProfile?.name || authUser?.user_metadata?.full_name;

  return (
    <div className="sticky top-0 z-30 w-full bg-background/80 py-2 backdrop-blur-sm transition-all duration-300 font-mono border-t border-b border-border/50">
      <div className={cn("container flex items-center justify-between gap-4 px-4")}>
        {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
        )}
        
        <div className="flex-1" />

        <div className="flex w-full max-w-md items-center gap-2">
           <Sorter />
        </div>
        
        <div className="flex items-center gap-1">
           <Sheet>
            <SheetTrigger asChild>
                <Button variant="bleep" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>
            </SheetTrigger>
            <NotificationsPanel />
           </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="bleep" size="icon">
                <Bookmark className="h-5 w-5" />
                <span className="sr-only">Bookmarks</span>
              </Button>
            </SheetTrigger>
             <BookmarksPanel />
          </Sheet>
          <ThemeSwitcher />
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="bleep" className="rounded-full p-0 h-8 w-8">
                    <Avatar className="h-8 w-8 border-2 border-border/50">
                        <AvatarImage src={avatarUrl ?? undefined} alt={displayName || ''} />
                        <AvatarFallback>
                            <UserIcon className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[8rem]">
                {authUser && (
                  <a href="https://myaccount.google.com/" target="_blank" rel="noopener noreferrer" className="block outline-none">
                      <DropdownMenuItem className="focus:bg-transparent cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={avatarUrl || undefined} alt={displayName || ''} />
                            <AvatarFallback><UserIcon /></AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-base">{displayName}</span>
                            <span className="text-muted-foreground text-sm">{authUser.email}</span>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </a>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/admin"><Settings />Account Settings</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/billing"><CreditCard />Billing</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/faq"><LifeBuoy />Help Center</Link></DropdownMenuItem>
                <Dialog>
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Gift />Support Sentrybase
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DonateDialog />
                </Dialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Button variant="destructive" className="w-full justify-start p-2 h-auto" onClick={() => router.push('/logout')}><LogOut />Logout</Button></DropdownMenuItem>
            </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

    