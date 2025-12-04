
'use client';

import { useState, useEffect } from 'react';
import { WorkmateRadarForm } from './form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { ClientOnly } from '@/components/layout/client-only';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, ShieldCheck, UserPlus, Copy, Send } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/firebase';

function MindsetDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const handleUnderstood = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sentrybase-radar-mindset-seen', 'true');
        }
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="text-primary" />
                        The Workmate Radar Mindset
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                       Use Workmate Radar to build your alliance. The strongest businesses are not built alone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                     <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <span className="font-bold text-primary">1.</span>
                            <div>
                                <h4 className="font-semibold">Be Strategic</h4>
                                <p className="text-sm text-muted-foreground">Know why you're looking for a partner before you start.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="font-bold text-primary">2.</span>
                            <div>
                                <h4 className="font-semibold">Be Specific</h4>
                                <p className="text-sm text-muted-foreground">Use filters and clear language to find the right fit, not just any fit.</p>
                            </div>
                        </li>
                         <li className="flex items-start gap-3">
                            <span className="font-bold text-primary">3.</span>
                            <div>
                                <h4 className="font-semibold">Be Respectful</h4>
                                <p className="text-sm text-muted-foreground">Your first message should be about building a relationship, not closing a deal.</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                         <Link href="/workmate-radar/manifesto">
                            <Button variant="outline"><BookOpen className="mr-2 h-4 w-4" />Learn More</Button>
                        </Link>
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleUnderstood}>I Understand</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function ContactsTab() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    setIsSupported('contacts' in navigator && 'ContactsManager' in window);
  }, []);

  const handleFindContacts = async () => {
    if (!isSupported) {
        toast({
            variant: "destructive",
            title: "Unsupported Browser",
            description: "Your browser does not support the Contact Picker API.",
        });
        return;
    }

    try {
        const props = ['name', 'email', 'tel', 'icon'];
        const opts = { multiple: true };
        const selectedContacts = await (navigator as any).contacts.select(props, opts);
        
        if (selectedContacts.length > 0) {
            setContacts(selectedContacts);
        }
    } catch (err) {
        console.error("Error picking contacts:", err);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not access your contacts. Please ensure you've granted permission.",
        });
    }
  };
  
  const handleCopyInvite = (contactName: string) => {
    const referralLink = `${window.location.origin}/signup?ref=${user?.uid}`;
    const message = `Hey ${contactName}, I'm inviting you to join me on Sentrybase. Check it out: ${referralLink}`;
    navigator.clipboard.writeText(message);
    toast({
        title: "Invite Copied!",
        description: "Your referral link has been copied to the clipboard.",
    });
  };

  return (
    <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
            <CardTitle>Find from Contacts</CardTitle>
            <CardDescription>
                Securely find and invite your existing contacts to join you on Sentrybase.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {contacts.length === 0 ? (
                <div className="flex flex-col items-start justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 p-8 text-left">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-transparent">
                        <UserPlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">Connect with your network</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        Use our secure contact importer to find colleagues and friends who might already be on Sentrybase, or invite them to join.
                    </p>
                    <Button className="mt-6" onClick={handleFindContacts} disabled={!isSupported}>
                        <UserPlus className="mr-2 h-4 w-4" /> Find Contacts
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Your Selected Contacts</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {contacts.map((contact, index) => (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        {/* Icons are not supported yet, so using fallback */}
                                        <AvatarFallback>{contact.name?.[0]?.[0] || '?'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{contact.name?.[0]}</p>
                                        <p className="text-sm text-muted-foreground">{contact.email?.[0] || contact.tel?.[0]}</p>
                                    </div>
                                </CardHeader>
                                 <CardFooter>
                                    <Button className="w-full" onClick={() => handleCopyInvite(contact.name?.[0] || 'a friend')}>
                                        <Copy className="mr-2 h-4 w-4" /> Copy Invite Link
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  )
}

function WorkmateRadarPageInternal() {
  const [showMindset, setShowMindset] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const mindsetSeen = localStorage.getItem('sentrybase-radar-mindset-seen');
        if (!mindsetSeen) {
          setShowMindset(true);
        }
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 sm:p-6 md:p-8 md:pb-4 flex-shrink-0">
        <div>
            <h1 className="text-4xl font-headline font-light tracking-tight">Workmate Radar</h1>
            <p className="mt-2 text-lg text-muted-foreground font-light">
                Define your ideal collaborator, build your dream team.
            </p>
        </div>
         <div className="font-mono flex items-center gap-2 text-green-400 text-xs">
            <span>SYS_STATUS:</span>
            <span className="animate-pulse">ONLINE</span>
        </div>
      </header>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8 pt-4">
            <MindsetDialog open={showMindset} onOpenChange={setShowMindset} />
            <Tabs defaultValue="radar" className="mx-auto w-full max-w-4xl">
                 <TabsList className="grid w-full grid-cols-2 bg-transparent">
                    <TabsTrigger value="radar">Team Builder</TabsTrigger>
                    <TabsTrigger value="contacts">Find Contacts</TabsTrigger>
                </TabsList>
                <TabsContent value="radar" className="mt-6">
                    <Card className="border-0 bg-transparent shadow-none">
                        <CardContent className="p-0">
                            <WorkmateRadarForm />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="contacts" className="mt-6">
                    <ContactsTab />
                </TabsContent>
            </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}


export default function WorkmateRadarPage() {
  return (
    <ClientOnly>
      <WorkmateRadarPageInternal />
    </ClientOnly>
  )
}
