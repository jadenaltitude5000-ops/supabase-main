
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Box, GraduationCap, ArrowRight, User as UserIcon, ShoppingBag, DollarSign, LineChart, PlusCircle, Share2, Maximize, ArrowLeft, X, ExternalLink, Link as LinkIcon, Video, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { useUser as useAuthUser, useUserCollection, useFirestore, useDoc, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { Course, CourseEnrollment, SaaSProduct, PortfolioItem, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MediaUploader } from '@/components/ui/media-uploader';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';


function PublisherDetailsDialog({ authorId }: { authorId: string }) {
    const firestore = useFirestore();
    const userDocRef = useMemo(() => {
        if (!firestore || !authorId) return null;
        return doc(firestore, 'users', authorId);
    }, [firestore, authorId]);
    const { data: author, isLoading } = useDoc<User>(userDocRef);

    if (isLoading) {
        return (
            <DialogContent>
                <DialogHeader>
                    <div className="flex flex-col items-center text-center gap-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-6 w-32" />
                           <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </DialogHeader>
            </DialogContent>
        )
    }

    if (!author) {
         return (
            <DialogContent>
                <DialogHeader><DialogTitle>Author not found.</DialogTitle></DialogHeader>
            </DialogContent>
        )
    }

    return (
        <DialogContent>
            <DialogHeader>
                 <div className="flex flex-col items-center text-center gap-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={author.avatar} alt={author.name} />
                        <AvatarFallback>{author.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <DialogTitle>{author.name}</DialogTitle>
                        <DialogDescription>{author.headline || "A Sentrybase Creator"}</DialogDescription>
                    </div>
                </div>
            </DialogHeader>
            <p className="py-4 text-center text-sm text-muted-foreground">{author.bio || "No bio available."}</p>
            <DialogFooter>
                <DialogClose asChild>
                    <Button asChild className="w-full">
                        <Link href={`/u/${author.handle || author.id}`}>View Profile</Link>
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

function PortfolioItemDialog({ item, onPrev, onNext, isPrevDisabled, isNextDisabled }: { item: PortfolioItem, onPrev: () => void, onNext: () => void, isPrevDisabled: boolean, isNextDisabled: boolean }) {
  const { toggleFullscreen } = useFullscreen();

  const MediaContent = () => {
        switch(item.mediaType) {
            case 'video':
                return (
                    <video controls src={item.videoUrl} className="w-full h-full object-contain rounded-lg">
                        Your browser does not support the video tag.
                    </video>
                );
            case 'app':
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 rounded-lg text-foreground p-8 text-center">
                        <LinkIcon className="h-16 w-16 mb-4" />
                        <h3 className="text-xl font-semibold">Live Application</h3>
                        <p className="text-muted-foreground mt-2">This project links to an external application.</p>
                        <Button asChild className="mt-6">
                            <a href={item.appUrl} target="_blank" rel="noopener noreferrer">Visit App</a>
                        </Button>
                    </div>
                );
            case 'image':
            default:
                return (
                    <Carousel className="w-full h-full relative group">
                        <CarouselContent className="h-full">
                        {(item.images || [item.imageUrl]).map((img, index) => (
                            <CarouselItem key={index} className="h-full flex items-center justify-center">
                                <Image src={img} alt={`${item.title} - Image ${index + 1}`} width={1200} height={800} className="max-h-full w-auto object-contain rounded-md" />
                            </CarouselItem>
                        ))}
                        </CarouselContent>
                    </Carousel>
                );
        }
    }


  return (
    <DialogContent className="max-w-5xl p-0 h-[90vh] flex flex-col">
        <DialogHeader className="p-4 border-b flex-row items-center justify-between">
            <DialogTitle className="font-mono text-base truncate">{item.title}</DialogTitle>
            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={onPrev} disabled={isPrevDisabled}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onNext} disabled={isNextDisabled}>
                    <ArrowRight className="h-4 w-4" />
                </Button>
                 <DialogClose asChild>
                    <Button variant="ghost" size="icon">
                        <X className="h-4 w-4" />
                    </Button>
                </DialogClose>
            </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] flex-1 overflow-hidden">
            <div className="md:border-r bg-black flex items-center justify-center p-4 h-full overflow-hidden">
                 <MediaContent />
            </div>
            <div className="flex flex-col p-6 overflow-y-auto">
                 <ScrollArea className="flex-grow pr-4 -mr-4">
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-mono text-sm text-muted-foreground mb-2">// DESCRIPTION</h4>
                            <p className="text-sm">{item.description}</p>
                        </div>
                        <div>
                             <h4 className="font-mono text-sm text-muted-foreground mb-2">// TECH STACK</h4>
                            <div className="flex flex-wrap gap-2">
                                {item.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="font-mono">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <div className="mt-6 pt-6 border-t">
                    <Card className="bg-muted/50">
                        <CardHeader>
                             <Dialog>
                                <DialogTrigger asChild>
                                    <div className="flex items-center gap-3 cursor-pointer">
                                        <Avatar>
                                            <AvatarImage src={item.authorAvatar} />
                                            <AvatarFallback>{item.author.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{item.author}</p>
                                            <p className="text-xs text-muted-foreground">{item.authorHeadline}</p>
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <PublisherDetailsDialog authorId={item.authorId} />
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Interested in this work? Reach out to collaborate.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </DialogContent>
  );
}

function CatalogueTab() {
  const { user: authUser } = useAuthUser();
  const firestore = useFirestore();

  // Fetch courses created by the user
  const createdCoursesQuery = useMemo(() => {
    if (!authUser) return null;
    return query(collection(firestore, 'courses'), where('instructorId', '==', authUser.uid));
  }, [authUser, firestore]);
  const { data: createdCourses, isLoading: isLoadingCreated } = useUserCollection<Course>(createdCoursesQuery);

  // Fetch courses the user is enrolled in
  const enrollmentsQuery = useMemo(() => {
    if (!authUser) return null;
    return query(collection(firestore, 'users', authUser.uid, 'enrollments'));
  }, [authUser, firestore]);
  const { data: enrollments, isLoading: isLoadingEnrollments } = useUserCollection<CourseEnrollment>(enrollmentsQuery);

  const isLoading = isLoadingCreated || isLoadingEnrollments;

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
            <Card className="md:col-span-2"><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
        </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <Card className="md:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> My Creations</CardTitle>
                    <CardDescription>Courses, products, and portfolio items you have created.</CardDescription>
                </div>
                 <Button asChild variant="outline">
                    <Link href="/admin?tab=instructor"><PlusCircle className="mr-2 h-4 w-4" /> Create New Course</Link>
                </Button>
            </CardHeader>
            <CardContent>
                 <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Courses</h4>
                    {createdCourses && createdCourses.length > 0 ? (
                        <div className="space-y-3">
                            {createdCourses.map(course => (
                                <div key={course.id} className="flex items-center justify-between p-2 border rounded-md">
                                    <span className="font-medium">{course.title}</span>
                                    <Button variant="outline" size="sm">Manage</Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">You haven't created any courses yet.</p>
                    )}
                </div>
                <div className="space-y-3 mt-6">
                    <h4 className="font-semibold text-foreground">SaaS Products & Portfolio</h4>
                     <p className="text-sm text-muted-foreground">Manage your SaaS products and portfolio items in your <Link href="/admin?tab=portfolio" className="underline hover:text-primary">profile settings</Link>.</p>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> My Enrollments</CardTitle>
                <CardDescription>Courses and products you have purchased.</CardDescription>
            </CardHeader>
            <CardContent>
                 {enrollments && enrollments.length > 0 ? (
                    <div className="space-y-3">
                       {enrollments.map(enrollment => (
                           <div key={enrollment.id} className="flex items-center justify-between p-2 border rounded-md">
                               <span className="font-medium">Course: {enrollment.courseId}</span>
                               <Button variant="outline" size="sm" asChild>
                                <Link href={`/courses/${enrollment.courseId}`}>View</Link>
                               </Button>
                           </div>
                       ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">You are not enrolled in any courses.</p>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Sales & Earnings</CardTitle>
                <CardDescription>An overview of your sales performance.</CardDescription>
            </CardHeader>
            <CardContent className="h-32 flex items-center justify-center text-muted-foreground">
                <p>Sales analytics coming soon.</p>
            </CardContent>
        </Card>

    </div>
  )
}

function AddPortfolioItemDialog() {
    const { toast } = useToast();
    const { user: authUser } = useAuthUser();
    const firestore = useFirestore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleUpload = async () => {
        if (!title || !description || !tags || !imageUrl || !authUser || !firestore) {
            toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out all fields.' });
            return;
        }

        const userDoc = await getDoc(doc(firestore, 'users', authUser.uid));
        if (!userDoc.exists()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find your user profile.' });
            return;
        }
        const userData = userDoc.data() as User;

        const newItem: Omit<PortfolioItem, 'id'> = {
            title,
            description,
            imageUrl,
            tags: tags.split(',').map(tag => tag.trim()),
            authorId: authUser.uid,
            author: userData.name,
            authorAvatar: userData.avatar,
            authorHeadline: userData.headline,
            mediaType: 'image', // For now, only image uploads are supported
        };

        await addDocumentNonBlocking(collection(firestore, 'marketbase/listings/portfolio'), newItem);
        toast({ title: 'Success!', description: 'Your project has been listed on the Marketbase.' });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>List New Project</DialogTitle>
                <DialogDescription>Showcase your work on the Sentrybase Marketbase.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <MediaUploader onUpload={setImageUrl} />
                <div className="space-y-2">
                    <Label htmlFor="item-title">Project Title</Label>
                    <Input id="item-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="item-description">Description</Label>
                    <Textarea id="item-description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="item-tags">Tags</Label>
                    <Input id="item-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., React, Next.js" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                <DialogClose asChild><Button onClick={handleUpload}>List Project</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

function PortfolioTab() {
    const firestore = useFirestore();
    const portfolioQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'marketbase/listings/portfolio'));
    }, [firestore]);
    const { data: portfolioItems, isLoading } = useUserCollection<PortfolioItem>(portfolioQuery);
    
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="overflow-hidden bg-transparent border-border/50">
                        <CardContent className="p-0"><Skeleton className="aspect-[4/3] w-full" /></CardContent>
                        <CardFooter className="p-3"><Skeleton className="h-8 w-full" /></CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <>
            <div className="flex justify-end mb-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Upload Project</Button>
                    </DialogTrigger>
                    <AddPortfolioItemDialog />
                </Dialog>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {portfolioItems?.map((item) => (
                    <Link key={item.id} href={`/marketbase/portfolio/${item.id}`} passHref>
                        <Card className="group overflow-hidden bg-transparent border-border/50 text-foreground cursor-pointer h-full flex flex-col">
                            <CardContent className="p-0 flex-1">
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button variant="secondary">View Project</Button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-3 text-xs flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={item.authorAvatar} />
                                    <AvatarFallback>{item.author ? item.author.charAt(0) : 'U'}</AvatarFallback>
                                </Avatar>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <span onClick={(e) => e.stopPropagation()} className="font-medium hover:underline cursor-pointer">{item.author}</span>
                                    </DialogTrigger>
                                    <PublisherDetailsDialog authorId={item.authorId} />
                                </Dialog>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        </>
    );
}

function AddSaasProductDialog() {
    const { toast } = useToast();
    const { user: authUser } = useAuthUser();
    const firestore = useFirestore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [tags, setTags] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');

    const handleUpload = async () => {
        if (!name || !description || !price || !websiteUrl || !authUser || !firestore) {
            toast({ variant: 'destructive', title: 'Missing Fields' });
            return;
        }

        const userDoc = await getDoc(doc(firestore, 'users', authUser.uid));
        if (!userDoc.exists()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find your user profile.' });
            return;
        }
        const userData = userDoc.data() as User;

        const newProduct: Omit<SaaSProduct, 'id'> = {
            name,
            description,
            price,
            tags: tags.split(',').map(t => t.trim()),
            websiteUrl,
            authorId: authUser.uid,
            authorName: userData.name,
        };

        await addDocumentNonBlocking(collection(firestore, 'marketbase/listings/saas'), newProduct);
        toast({ title: 'Success!', description: 'Your SaaS product has been listed.' });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>List New SaaS Product</DialogTitle>
                <DialogDescription>Add your product to the Sentrybase Marketbase.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Input placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} />
                <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                <Input placeholder="Price (e.g., $19/mo)" value={price} onChange={e => setPrice(e.target.value)} />
                <Input placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} />
                <Input placeholder="Website URL" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                <DialogClose asChild><Button onClick={handleUpload}>List Product</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

function SaasTab() {
    const firestore = useFirestore();
    const saasQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'marketbase/listings/saas'));
    }, [firestore]);
    const { data: saasProducts, isLoading } = useUserCollection<SaaSProduct>(saasQuery);

    if (isLoading) {
         return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
                ))}
            </div>
        )
    }

    return (
        <>
            <div className="flex justify-end mb-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> List Product</Button>
                    </DialogTrigger>
                    <AddSaasProductDialog />
                </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {saasProducts?.map((product) => (
                    <Card key={product.id} className="flex flex-col bg-transparent border-border/50 text-foreground">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Box className="h-5 w-5" /> {product.name}
                            </CardTitle>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="link" className="p-0 h-auto justify-start text-muted-foreground hover:text-primary">{product.authorName}</Button>
                                </DialogTrigger>
                                <PublisherDetailsDialog authorId={product.authorId} />
                            </Dialog>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                            <span className="font-semibold text-primary">{product.price}</span>
                            <Button asChild variant="outline"><a href={product.websiteUrl} target="_blank" rel="noopener noreferrer">View Product</a></Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    );
}

function AddCourseDialog() {
    const { toast } = useToast();
    const { user: authUser } = useAuthUser();
    const firestore = useFirestore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [tags, setTags] = useState('');
    const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    const handleUpload = async () => {
        if (!title || !description || !price || !tags || !thumbnailUrl || !authUser || !firestore) {
            toast({ variant: 'destructive', title: 'Missing Fields' });
            return;
        }

        const userDoc = await getDoc(doc(firestore, 'users', authUser.uid));
        if (!userDoc.exists()) return;
        const userData = userDoc.data() as User;

        const newCourse: Omit<Course, 'id' | 'rating' | 'studentCount' | 'createdAt'> = {
            title,
            description,
            price: parseFloat(price),
            tags: tags.split(',').map(t => t.trim()),
            level,
            thumbnailUrl,
            instructorId: authUser.uid,
            instructorName: userData.name,
            instructorAvatar: userData.avatar,
        };

        await addDocumentNonBlocking(collection(firestore, 'marketbase/listings/courses'), {
            ...newCourse,
            createdAt: serverTimestamp(),
            rating: 0,
            studentCount: 0,
        });
        toast({ title: 'Success!', description: 'Your course has been listed.' });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>Share your knowledge on the Sentrybase Marketbase.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <MediaUploader onUpload={setThumbnailUrl} />
                <Input placeholder="Course Title" value={title} onChange={e => setTitle(e.target.value)} />
                <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                <Input type="number" placeholder="Price ($)" value={price} onChange={e => setPrice(e.target.value)} />
                <Input placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} />
                <Select value={level} onValueChange={(v) => setLevel(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                <DialogClose asChild><Button onClick={handleUpload}>Create Course</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

function CoursesTab() {
    const firestore = useFirestore();
    const coursesQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'marketbase/listings/courses'));
    }, [firestore]);
    const { data: courses, isLoading } = useUserCollection<Course>(coursesQuery);

    if (isLoading) {
         return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="group flex flex-col overflow-hidden bg-transparent border-border/50">
                        <CardContent className="p-0"><Skeleton className="aspect-video w-full" /></CardContent>
                        <div className="p-4 space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-8 w-full mt-2" /></div>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <>
            <div className="flex justify-end mb-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Course</Button>
                    </DialogTrigger>
                    <AddCourseDialog />
                </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {courses?.map((course) => (
                    <Card key={course.id} className="group flex flex-col overflow-hidden bg-transparent border-border/50 text-foreground">
                        <CardContent className="p-0">
                        <div className="relative aspect-video w-full overflow-hidden">
                                <Image
                                    src={course.thumbnailUrl}
                                    alt={course.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                        </CardContent>
                        <div className="p-4 flex flex-col flex-1">
                            <Badge variant="outline" className="w-fit mb-2">{course.level}</Badge>
                            <h3 className="font-semibold text-base line-clamp-2 flex-1">{course.title}</h3>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="link" className="p-0 h-auto text-xs justify-start text-muted-foreground hover:text-primary mt-1">{course.instructorName}</Button>
                                </DialogTrigger>
                                <PublisherDetailsDialog authorId={course.instructorId} />
                            </Dialog>
                            <div className="flex items-center justify-between mt-4">
                                <p className="font-bold text-primary">${course.price}</p>
                                <Button asChild variant="link" className="p-0">
                                    <Link href={`/courses/${course.id}`}>
                                        View Course <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </>
    );
}

function MarketbasePage() {

  return (
    <div className="h-full p-4 sm:p-6 md:p-8 font-mono">
      <header className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-light tracking-tight sm:text-4xl text-primary">
            Marketbase
          </h1>
          <p className="mt-1 text-lg text-muted-foreground font-light">
            Showcase your creations. Discover tools and knowledge.
          </p>
        </div>
        <div className="font-mono flex items-center gap-2 text-green-400 text-xs">
            <span>MARKET_STATUS:</span>
            <span className="animate-pulse">ONLINE</span>
        </div>
      </header>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-transparent p-0 border-b border-border">
          <TabsTrigger value="portfolio" className="gap-2 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary">
            <LayoutGrid className="h-5 w-5" /> Portfolio
          </TabsTrigger>
          <TabsTrigger value="saas" className="gap-2 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary">
            <Box className="h-5 w-5" /> SaaS
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary">
            <GraduationCap className="h-5 w-5" /> Courses
          </TabsTrigger>
          <TabsTrigger value="catalogue" className="gap-2 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary">
            <LineChart className="h-5 w-5" /> Catalogue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-6">
            <PortfolioTab />
        </TabsContent>

        <TabsContent value="saas" className="mt-6">
            <SaasTab />
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
           <CoursesTab />
        </TabsContent>

        <TabsContent value="catalogue" className="mt-6">
            <CatalogueTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MarketbasePage;

    