
'use client';

import { useParams, useRouter } from 'next/navigation';
import { portfolioItems } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ExternalLink, Mail, Share2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PortfolioItemPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
  
    const item = portfolioItems.find((p) => p.id === id);

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <h1 className="text-2xl font-bold">Project Not Found</h1>
                <p className="text-muted-foreground">The portfolio item you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/marketbase')} className="mt-4">Back to Marketbase</Button>
            </div>
        );
    }
    
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
                        <ExternalLink className="h-16 w-16 mb-4" />
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
                         <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                    </Carousel>
                );
        }
    }


    return (
        <div className="min-h-screen bg-background font-mono text-foreground">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4 border-b border-border/50 flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketbase
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                </div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.2fr] min-h-[calc(100vh-65px)]">
                <div className="p-4 md:p-8 h-full flex items-center justify-center bg-black">
                    <MediaContent />
                </div>
                <div className="p-4 md:p-8 flex flex-col space-y-8 border-l border-border/50">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-headline font-normal tracking-tight">{item.title}</h1>
                         <div className="flex items-center gap-3 pt-2">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={item.authorAvatar} />
                                <AvatarFallback>{item.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-base">{item.author}</p>
                                <p className="text-xs text-muted-foreground">{item.authorHeadline}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">// DESCRIPTION</h4>
                        <p className="text-sm">{item.description}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">// TECH_STACK</h4>
                        <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="font-mono">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                     <div className="mt-auto pt-8">
                         <Card className="bg-muted/50">
                             <CardHeader>
                                 <CardTitle>Contact Creator</CardTitle>
                             </CardHeader>
                             <CardContent>
                                 <p className="text-sm text-muted-foreground">Interested in this work? Reach out to collaborate.</p>
                             </CardContent>
                             <CardFooter className="flex gap-2">
                                <Button asChild className="flex-1">
                                    <Link href={`/u/${item.authorId}`}>View Profile</Link>
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <Mail className="mr-2 h-4 w-4" /> Message
                                </Button>
                            </CardFooter>
                         </Card>
                     </div>
                </div>
            </div>
        </div>
    );
}
