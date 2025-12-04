
'use client';

import { useEffect, useMemo, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useSupabase, useUserCollection, useUser as useAuthUser } from '@/firebase';
import { collection, query, where, limit, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import type { User, Post as PostType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Mail, MessageSquare, UserPlus, Users, ArrowLeft } from 'lucide-react';
import { ClientOnly } from '@/components/layout/client-only';
import { format } from 'date-fns';
import { followUser, unfollowUser } from '@/lib/social-actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </svg>
);


// NOTE: This PostCard is a simplified version for display purposes.
// The main feed PostCard has more features like replies, real-time updates, etc.
function PostCard({ post }: { post: PostType }) {
    const formattedDate = post.createdAt 
        ? format(new Date(post.createdAt as string), 'MMM d') 
        : '';
        
    return (
        <Card className="shadow-none border-t-0 border-x-0 rounded-none">
            <CardHeader className="flex-row items-start gap-4">
                <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                            @{post.author.handle} &middot; {formattedDate}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-wrap">{post.content}</p>
            </CardContent>
        </Card>
    );
}

function UserProfilePageInternal({ params }: { params: { handle: string } }) {
    const router = useRouter();
    const supabase = useSupabase();
    const { user: authUser } = useAuthUser();
    const { toast } = useToast();

    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFollow, setIsLoadingFollow] = useState(true);
    
    useEffect(() => {
        const fetchUserAndPosts = async () => {
            setIsLoading(true);
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('handle', params.handle)
                .single();
            
            if (userError || !userData) {
                console.error("Error fetching user:", userError);
                setIsLoading(false);
                notFound();
                return;
            }
            
            setUser(userData as User);

            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select('*, author:users(*)')
                .eq('userId', userData.id)
                .order('created_at', { ascending: false });

            if (postsData) {
                const formattedPosts = postsData.map((post: any) => ({
                    ...post,
                    author: {
                        id: post.author.id,
                        name: post.author.name,
                        handle: post.author.handle,
                        avatar: post.author.avatar,
                    }
                })) as PostType[];
                setPosts(formattedPosts);
            }

            if (authUser) {
                setIsLoadingFollow(true);
                const { data: followData } = await supabase
                    .from('followers')
                    .select('id')
                    .eq('follower_id', authUser.id)
                    .eq('following_id', userData.id)
                    .single();
                setIsFollowing(!!followData);
                setIsLoadingFollow(false);
            } else {
                setIsLoadingFollow(false);
            }

            setIsLoading(false);
        };
        fetchUserAndPosts();
    }, [params.handle, supabase, authUser]);

    const handleToggleFollow = async () => {
        if (!authUser || !user) return;
        setIsLoadingFollow(true);
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
        setIsLoadingFollow(false);
    };

    if (isLoading) {
        return (
             <div className="min-h-screen">
                <Skeleton className="h-48 w-full" />
                <div className="px-4 sm:px-6 md:px-8">
                    <div className="relative -mt-20">
                         <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
                    </div>
                </div>
                 <div className="px-4 sm:px-6 md:px-8 pt-4">
                    <div className="mt-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                           <Skeleton className="h-8 w-48" />
                           <Skeleton className="h-5 w-32" />
                           <Skeleton className="h-16 w-full" />
                        </div>
                    </div>
                </div>
             </div>
        );
    }

    if (!user) {
        return notFound();
    }

    return (
    <div className="min-h-screen">
      <div className="relative h-48 w-full bg-muted group rounded-lg">
        <div className="absolute top-4 left-4 z-10">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="bg-transparent hover:bg-black/20 text-white">
                <ArrowLeft />
                <span className="sr-only">Go back</span>
            </Button>
        </div>
        {user.coverImage && (
            <Image
                src={user.coverImage}
                alt={`${user.name}'s cover image`}
                fill
                className="object-cover rounded-lg"
                priority
            />
        )}
      </div>
      
      <div className="px-4 sm:px-6 md:px-8">
        <div className="relative -mt-20">
             <Avatar className="h-32 w-32 border-4 border-background rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 md:px-8 pt-4">
          <div className="mt-0 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
             <div className="md:col-span-2 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">@{user.handle}</p>
                    <p className="text-muted-foreground mt-2">{user.bio}</p>
                </div>
                
                 <div className="pt-4 flex items-center gap-2">
                    {authUser?.id === user.id ? (
                        <Button asChild variant="outline"><Link href="/admin"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Link></Button>
                    ) : (
                        <>
                            <Button variant="outline"><MessageSquare className="mr-2 h-4 w-4" /> Message</Button>
                            <Button onClick={handleToggleFollow} disabled={isLoadingFollow}>
                                <UserPlus className="mr-2 h-4 w-4" />{isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        </>
                    )}
                </div>
             </div>
             <div className="space-y-3 text-sm text-muted-foreground mt-8">
                  {user.createdAt && <div>Joined {format(new Date(user.createdAt as string), 'MMMM yyyy')}</div>}
                  {user.email && <a href={`mailto:${user.email}`} className="flex items-center gap-2 hover:text-primary break-all">{user.email}</a>}
            </div>
        </div>
      </div>
        <div className="container mx-auto px-4 pb-8">
            <Tabs defaultValue="posts" className="mt-6">
                <div className="flex justify-end border-b">
                    <TabsList className="bg-transparent p-0">
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        <TabsTrigger value="mutuals">Mutual Workmates</TabsTrigger>
                    </TabsList>
                </div>
            <TabsContent value="posts">
                <div className="mt-6">
                    {posts.length > 0 ? (
                        posts.map(post => <PostCard key={post.id} post={post} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-10">This user hasn't posted anything yet.</p>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="mutuals">
                <div className="mt-6">
                    <div className="text-center text-muted-foreground py-10">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No Mutual Workmates</h3>
                        <p>You and {user.name} don't have any connections in common yet.</p>
                    </div>
                </div>
            </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}


export default function UserProfilePage({ params }: { params: { handle: string } }) {
    return (
        <ClientOnly>
            <UserProfilePageInternal params={params} />
        </ClientOnly>
    );
}
