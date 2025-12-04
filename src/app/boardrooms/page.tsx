
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  useUser as useAuthUser,
  useFirestore,
  useUserCollection,
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase';
import {
  collection,
  query,
  where,
  doc,
  serverTimestamp,
  orderBy,
  writeBatch,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { ClientOnly } from '@/components/layout/client-only';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { User, Project, ProjectMember, Invitation, ProjectMessage } from '@/lib/types';
import { Plus, Users, MessageSquare, Trash2, Send, Check, X, UserPlus, Mail, Loader2, ArrowLeftFromLine, ArrowRightFromLine, FileUp, Image as ImageIcon, Paperclip, ChevronLeft, StickyNote, FileEdit, Edit, Kanban } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/ui/file-uploader';
import { MediaUploader } from '@/components/ui/media-uploader';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


function Notepad({ projectId, onToggleNotepad, isOpen }: { projectId: string | null; onToggleNotepad: () => void; isOpen: boolean; }) {
    const [note, setNote] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (projectId && isOpen) {
            const savedNote = localStorage.getItem(`notepad_${projectId}`);
            if (savedNote) {
                setNote(savedNote);
            } else {
                 setNote('');
            }
        } else if (!isOpen) {
            setNote('');
        }
    }, [projectId, isOpen]);

    const handleSaveNote = () => {
        if (projectId) {
            localStorage.setItem(`notepad_${projectId}`, note);
            toast({
                title: "Note Saved",
                description: "Your notepad has been saved locally.",
            });
        }
    };
    
    const handleClearNote = () => {
        if (projectId) {
            setNote('');
            localStorage.removeItem(`notepad_${projectId}`);
            toast({
                title: "Note Cleared",
                variant: "destructive",
                description: "Your notepad for this project has been cleared.",
            });
        }
    }
    
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center p-2">
                <Button variant="ghost" size="icon" onClick={onToggleNotepad} className="hover:bg-accent">
                    <FileEdit className="h-5 w-5" />
                </Button>
                <div className="flex-1" />
                <CardTitle className="text-base font-normal">
                    Notepad
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-2">
                <Textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="flex-1 resize-none border-transparent focus:border-transparent focus:ring-0 bg-transparent placeholder:text-muted-foreground"
                    placeholder="Start typing your notes..."
                    disabled={!projectId}
                />
            </CardContent>
            <CardFooter className="p-2 flex justify-between">
                <Button onClick={handleSaveNote} disabled={!projectId} variant="secondary">Save Note</Button>
                <Button variant="destructive" onClick={handleClearNote} disabled={!projectId || !note}>Clear</Button>
            </CardFooter>
        </Card>
    )
}

function ChatPanel({ project, onToggleNotepad }: { project: Project | null; onToggleNotepad: () => void }) {
    const { user: authUser } = useAuthUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    // --- Active Project Data ---
    const projectMembersQuery = useMemo(() => {
        if (!project) return null;
        return query(collection(firestore, 'projects', project.id, 'members'));
    }, [project, firestore]);
    const { data: projectMembers } = useUserCollection<ProjectMember>(projectMembersQuery);
    
    const projectMessagesQuery = useMemo(() => {
        if (!project) return null;
        return query(collection(firestore, 'projects', project.id, 'messages'), orderBy('createdAt', 'asc'));
    }, [project, firestore]);
    const { data: messages } = useUserCollection<ProjectMessage>(projectMessagesQuery);

    const projectInvitationsQuery = useMemo(() => {
        if (!project) return null;
        return query(collection(firestore, 'projects', project.id, 'invitations'));
    }, [project, firestore]);
    const { data: invitations } = useUserCollection<Invitation>(projectInvitationsQuery);

    const [newMessage, setNewMessage] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    const colleaguesQuery = useMemo(() => {
      if (!authUser) return null;
      return query(collection(firestore, 'users', authUser.uid, 'colleagues'));
    }, [authUser, firestore]);
    const { data: colleagueRefs } = useUserCollection(colleaguesQuery);
    const colleagueIds = useMemo(() => colleagueRefs?.map(c => c.id) || [], [colleagueRefs]);
    const colleaguesDataQuery = useMemo(() => {
        if (!firestore || colleagueIds.length === 0) return null;
        return query(collection(firestore, 'users'), where('__name__', 'in', colleagueIds));
    }, [firestore, colleagueIds]);
    const { data: colleagues } = useUserCollection<User>(colleaguesDataQuery);


    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !imageUrl && !fileUrl) || !project || !authUser || !firestore) return;
        setIsSending(true);

        const messageData: Omit<ProjectMessage, 'id'> = {
            senderId: authUser.uid,
            senderName: authUser.displayName || 'User',
            senderAvatar: authUser.photoURL || '',
            content: newMessage,
            createdAt: serverTimestamp(),
            imageUrl,
            fileUrl,
            fileName,
        };
        
        const messagesCol = collection(firestore, 'projects', project.id, 'messages');
        try {
          await addDocumentNonBlocking(messagesCol, messageData);
          setNewMessage('');
          setImageUrl(null);
          setFileUrl(null);
          setFileName(null);
        } catch (error) {
          console.error("Error sending message:", error);
          toast({ variant: 'destructive', title: "Message Failed", description: "Could not send message." });
        } finally {
            setIsSending(false);
        }
    }

    const handleFileUpload = (url: string, name: string) => {
        setFileUrl(url);
        setFileName(name);
    };

    return (
        <Card className="flex-1 flex flex-col shadow-none rounded-lg h-full overflow-hidden">
            <CardHeader className="flex flex-col p-2 space-y-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="font-headline font-normal tracking-tight text-xl">{project?.projectName || "Boardroom"}</CardTitle>
                    <div className="flex items-center gap-2">
                         {project && (
                            <InviteColleaguesDialog 
                            colleagues={colleagues || []}
                            project={project}
                            existingMembers={projectMembers || []}
                            existingInvites={invitations || []}
                            />
                        )}
                        <Button variant="bleep" size="icon" onClick={onToggleNotepad}>
                            <FileEdit className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                 {project && (
                    <div className="flex items-center space-x-1 p-1 rounded-md">
                        {(projectMembers || []).map(member => (
                            <Avatar key={member.userId} className="h-8 w-8">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                )}
            </CardHeader>
            <div className="flex-1 flex flex-col overflow-hidden m-0">
                {project ? (
                    <ScrollArea className="flex-1 p-4">
                        {messages?.map(msg => (
                            <div key={msg.id} className="flex items-start gap-3 mb-4">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={msg.senderAvatar} />
                                    <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="font-bold">{msg.senderName}</span>
                                        <span className="text-muted-foreground">
                                            {msg.createdAt ? new Date((msg.createdAt as any).seconds * 1000).toLocaleTimeString() : 'sending...'}
                                        </span>
                                    </div>
                                    <div className="text-sm mt-1 space-y-2 border-l-2 border-primary pl-4 py-1">
                                        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                                        {msg.imageUrl && (
                                            <div className="relative aspect-video w-48 overflow-hidden rounded-md">
                                                <Image src={msg.imageUrl} alt="Uploaded image" fill className="object-cover" />
                                            </div>
                                        )}
                                        {msg.fileUrl && (
                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="justify-start">
                                                    <Paperclip className="mr-2 h-4 w-4" />
                                                    {msg.fileName || "View Attachment"}
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                ) : (
                    <div className="flex-1 flex flex-col items-start justify-center p-8">
                        <div className="w-full max-w-sm">
                            <h2 className="text-xl font-headline tracking-tight font-normal">No Boardroom Selected</h2>
                            <p className="text-muted-foreground mt-2">
                                Select a boardroom from the list to view messages, or create a new one to start collaborating with your team.
                            </p>
                        </div>
                    </div>
                )}
            </div>
             <div className="flex-shrink-0 p-4 bg-transparent">
                 <div className="relative border border-muted-foreground/30 bg-background/60 backdrop-blur-md px-2 py-1 flex items-center gap-1 w-full">
                    <div className="flex items-center">
                        <MediaUploader onUpload={setImageUrl}>
                            <Button variant="bleep" size="icon" className="h-8 w-8">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </MediaUploader>
                        <FileUploader onUpload={handleFileUpload}>
                            <Button variant="bleep" size="icon" className="h-8 w-8">
                                <FileUp className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </FileUploader>
                    </div>
                    <div className="flex-1 relative">
                        {imageUrl && (
                            <div className="absolute -bottom-24 left-0 w-48">
                                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                                    <Image src={imageUrl} alt="Message preview" fill className="object-cover" />
                                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5" onClick={() => setImageUrl(null)}><X className="h-3 w-3"/></Button>
                                </div>
                            </div>
                        )}
                        {fileName && (
                            <div className="absolute -top-12 left-0 w-full max-w-xs">
                                <div className="flex items-center gap-2 rounded-md border bg-muted p-1 text-sm">
                                    <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="flex-1 truncate">{fileName}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => { setFileUrl(null); setFileName(null); }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        <Textarea
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={!project || isSending}
                            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-2 shadow-none text-sm bg-transparent min-h-0 resize-none"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                    </div>
                    <Button onClick={handleSendMessage} disabled={(!newMessage.trim() && !imageUrl && !fileUrl) || !project || isSending} size="sm" className="rounded-full">
                        {isSending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </Card>
    )
}

function BoardroomsPageInternal() {
  const { user: authUser, isUserLoading: isAuthUserLoading } = useAuthUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  useEffect(() => {
    if (activeProject) {
        setMobileView('chat');
    } else {
        setMobileView('list');
    }
  }, [activeProject]);

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  
  const [isColleaguesCollapsed, setIsColleaguesCollapsed] = useState(false);
  const [isProjectsCollapsed, setIsProjectsCollapsed] = useState(false);

  // --- Data Fetching ---
  const projectsQuery = useMemo(() => {
    if (!authUser) return null;
    return query(collection(firestore, 'users', authUser.uid, 'projects'), orderBy('createdAt', 'desc'));
  }, [authUser, firestore]);
  const { data: projects, isLoading: isLoadingProjects } = useUserCollection<Project>(projectsQuery);


  // --- State & Handlers ---
  const isLoading = isAuthUserLoading || isLoadingProjects;

  const handleCreateProject = async (projectName: string) => {
    if (!projectName.trim() || !authUser || !firestore) {
        toast({ variant: 'destructive', title: "Cannot create project", description: "You must be logged in and provide a project name." });
        return;
    }
    
    const batch = writeBatch(firestore);
    
    const newProjectRef = doc(collection(firestore, 'projects'));
    const projectData: Omit<Project, 'id' | 'role'> = {
      projectName,
      creatorId: authUser.uid,
      createdAt: serverTimestamp(),
      isActive: true,
    };
    batch.set(newProjectRef, projectData);

    const userProjectRef = doc(firestore, 'users', authUser.uid, 'projects', newProjectRef.id);
    batch.set(userProjectRef, { ...projectData, id: newProjectRef.id, role: 'creator' });
    
    const projectMemberRef = doc(collection(firestore, 'projects', newProjectRef.id, 'members'), authUser.uid);
    const memberData: ProjectMember = {
        userId: authUser.uid,
        role: 'creator',
        joinedAt: serverTimestamp(),
        name: authUser.displayName || 'Creator',
        avatar: authUser.photoURL || '',
    }
    batch.set(projectMemberRef, memberData);

    try {
        await batch.commit();
        toast({ title: 'Project Created', description: `"${projectName}" has been successfully created.` });
        setIsCreateProjectOpen(false);
    } catch (error) {
        console.error("Error creating project:", error);
        toast({ variant: 'destructive', title: "Creation Failed", description: "Could not create the project. Please try again." });
    }
  };
  
  const handleDeleteProject = async (projectId: string) => {
    if (!authUser || !firestore) return;
    
    // In a real app, you'd check for permissions here or rely on security rules.
    
    // Delete from the main projects collection
    const projectRef = doc(firestore, 'projects', projectId);
    await deleteDoc(projectRef);

    // Delete from the user's subcollection
    const userProjectRef = doc(firestore, 'users', authUser.uid, 'projects', projectId);
    await deleteDoc(userProjectRef);
    
    toast({ title: "Project Deleted" });
    if (activeProject?.id === projectId) {
        setActiveProject(null);
    }
  }

  const handleRenameProject = async (projectId: string, newName: string) => {
    if (!newName.trim() || !firestore || !authUser) return;
    
    const batch = writeBatch(firestore);
    
    const projectRef = doc(firestore, 'projects', projectId);
    batch.update(projectRef, { projectName: newName });
    
    const userProjectRef = doc(firestore, 'users', authUser.uid, 'projects', projectId);
    batch.update(userProjectRef, { projectName: newName });

    try {
        await batch.commit();
        toast({ title: "Boardroom Renamed", description: `Successfully renamed to "${newName}".` });
        if (activeProject?.id === projectId) {
            setActiveProject(prev => prev ? { ...prev, projectName: newName } : null);
        }
    } catch (error) {
        console.error("Error renaming project:", error);
        toast({ variant: 'destructive', title: "Rename Failed", description: "Could not rename the boardroom." });
    }
  };

  useEffect(() => {
    if (!isMobile && !activeProject && projects && projects.length > 0) {
      setActiveProject(projects[0]);
    } else if (!isMobile && !isLoadingProjects && projects?.length === 0) {
      setActiveProject(null);
    }
  }, [projects, activeProject, isLoadingProjects, isMobile]);
  
  const gridStyle = {
    gridTemplateColumns: `
      ${isColleaguesCollapsed ? '56px' : '300px'}
      ${isProjectsCollapsed ? '56px' : '400px'}
      1fr
    `
  };

  const colleaguesQuery = useMemo(() => {
    if (!authUser) return null;
    return query(collection(firestore, 'users', authUser.uid, 'colleagues'));
  }, [authUser, firestore]);
  const { data: colleagueRefs, isLoading: isLoadingColleagueRefs } = useUserCollection(colleaguesQuery);

  const colleagueIds = useMemo(() => colleagueRefs?.map(c => c.id) || [], [colleagueRefs]);

  const colleaguesDataQuery = useMemo(() => {
    if (!firestore || colleagueIds.length === 0) return null;
    return query(collection(firestore, 'users'), where('__name__', 'in', colleagueIds));
  }, [firestore, colleagueIds]);
  const { data: colleagues, isLoading: isLoadingColleagues } = useUserCollection<User>(colleaguesDataQuery);
  
  if (isMobile) {
      return (
          <div className="h-[90vh] overflow-hidden relative">
              <div className={cn("absolute inset-0 transition-transform duration-300", mobileView === 'chat' && '-translate-x-full')}>
                  {/* Project List View */}
                  <Card className="flex flex-col rounded-none border-0 h-full overflow-hidden shadow-none">
                      <CardHeader className="flex flex-row items-center p-4">
                          <CardTitle className="text-xl font-headline font-normal">Boardrooms</CardTitle>
                          <div className="flex-1" />
                          <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                              <DialogTrigger asChild>
                                  <Button size="icon" variant="ghost"><Plus className="h-4 w-4" /></Button>
                              </DialogTrigger>
                              <CreateProjectDialog onCreate={handleCreateProject} />
                          </Dialog>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-hidden p-2">
                           <ScrollArea className="h-full pr-4">
                              {isLoading ? (
                                  <div className="space-y-3">
                                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                                  </div>
                              ) : projects && projects.length > 0 ? (
                                  projects.map(project => (
                                      <Card 
                                          key={project.id} 
                                          className="cursor-pointer mb-2"
                                          onClick={() => setActiveProject(project)}
                                      >
                                          <CardHeader className="p-3 flex-row items-center justify-between">
                                              <p className="font-semibold">{project.projectName}</p>
                                              {project.creatorId === authUser?.uid && (
                                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id)}}>
                                                      <Trash2 className="h-4 w-4 text-destructive" />
                                                  </Button>
                                              )}
                                          </CardHeader>
                                      </Card>
                                  ))
                              ) : (
                                  <div className="flex flex-col items-start justify-center p-8 text-left">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-transparent mb-4">
                                        <Kanban className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                    <h3 className="text-lg font-headline font-normal">No Boardrooms Yet</h3>
                                    <p className="text-muted-foreground mt-1">Create a boardroom to start collaborating with your colleagues.</p>
                                </div>
                              )}
                          </ScrollArea>
                      </CardContent>
                  </Card>
              </div>
              <div className={cn("absolute inset-0 transition-transform duration-300", mobileView === 'list' && 'translate-x-full')}>
                  {/* Chat View */}
                  <div className="h-full flex flex-col">
                      <header className="p-4 flex items-center border-b">
                         <Button variant="ghost" size="icon" onClick={() => setActiveProject(null)}>
                            <ChevronLeft />
                         </Button>
                         <h2 className="font-semibold ml-2 truncate">{activeProject?.projectName}</h2>
                      </header>
                      <ChatPanel project={activeProject} onToggleNotepad={() => setIsNotepadOpen(!isNotepadOpen)} />
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="h-[90vh] overflow-hidden p-2 grid gap-2 transition-all duration-300" style={gridStyle}>
      {/* Left Panel: Colleagues */}
      <Card className="flex flex-col rounded-lg h-full overflow-hidden shadow-none">
        <CardHeader className="flex flex-row items-center p-2">
           {!isColleaguesCollapsed && (
            <CardTitle className="text-xl font-headline font-normal">My Colleagues</CardTitle>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={() => setIsColleaguesCollapsed(!isColleaguesCollapsed)}>
            {isColleaguesCollapsed ? <ArrowRightFromLine /> : <ArrowLeftFromLine />}
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-2">
            {!isColleaguesCollapsed && (
                <ScrollArea className="h-full pr-4">
                {(isLoading || isLoadingColleagueRefs || isLoadingColleagues) ? (
                    <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                ) : colleagues && colleagues.length > 0 ? (
                    colleagues.map(colleague => (
                    <div key={colleague.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                        <Avatar className="h-10 w-10">
                        <AvatarImage src={colleague.avatar} />
                        <AvatarFallback>{colleague.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                        <p className="font-semibold">{colleague.name}</p>
                        <p className="text-xs text-muted-foreground">{colleague.headline}</p>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="flex flex-col items-start justify-center p-8 text-left">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-transparent mb-4">
                            <Users className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-headline font-normal">No Colleagues Yet</h3>
                        <p className="text-muted-foreground mt-1">Add matches from Workmate Radar or Skill Sync Net.</p>
                    </div>
                )}
                </ScrollArea>
            )}
        </CardContent>
      </Card>

      {/* Center Panel: Projects */}
      <Card className="flex flex-col rounded-lg h-full overflow-hidden shadow-none">
        <CardHeader className="flex flex-row items-center p-2">
            {!isProjectsCollapsed && (
                <CardTitle className="text-xl font-headline font-normal">Boardrooms</CardTitle>
            )}
            <div className="flex-1" />
            <div className="flex items-center">
            {!isProjectsCollapsed && (
                <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="ghost"><Plus className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <CreateProjectDialog onCreate={handleCreateProject} />
                </Dialog>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsProjectsCollapsed(!isProjectsCollapsed)}>
              {isProjectsCollapsed ? <ArrowRightFromLine /> : <ArrowLeftFromLine />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-2">
            {!isProjectsCollapsed && (
                <ScrollArea className="h-full pr-4">
                {isLoading ? (
                    <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                ) : projects && projects.length > 0 ? (
                    projects.map(project => (
                        <Card 
                            key={project.id} 
                            className={cn("cursor-pointer mb-2 transition-colors border-transparent shadow-none", activeProject?.id === project.id ? "bg-muted" : "hover:bg-muted/50")}
                            onClick={() => setActiveProject(project)}
                        >
                            <CardHeader className="p-3 flex-row items-center justify-between">
                                <p className="font-semibold">{project.projectName}</p>
                                {project.creatorId === authUser?.uid && (
                                    <div className="flex items-center">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 mr-1" onClick={(e) => e.stopPropagation()}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <RenameProjectDialog 
                                                currentName={project.projectName} 
                                                onRename={(newName) => handleRenameProject(project.id, newName)} 
                                            />
                                        </Dialog>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id)}}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                        </Card>
                    ))
                ) : (
                    <div className="flex flex-col items-start justify-center p-8 text-left">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-transparent mb-4">
                            <Kanban className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-headline font-normal">No Boardrooms Yet</h3>
                        <p className="text-muted-foreground mt-1">Create a boardroom to start collaborating with your colleagues.</p>
                    </div>
                )}
                </ScrollArea>
            )}
        </CardContent>
      </Card>

      {/* Right Panel: Chat and Notepad */}
      <div className="relative overflow-hidden">
          <ChatPanel project={activeProject} onToggleNotepad={() => setIsNotepadOpen(!isNotepadOpen)} />
          <div className={cn(
              "absolute top-0 right-0 h-full w-96 transition-transform duration-300 ease-in-out",
              isNotepadOpen ? 'translate-x-0' : 'translate-x-full'
          )}>
            <Notepad projectId={activeProject?.id || null} onToggleNotepad={() => setIsNotepadOpen(false)} isOpen={isNotepadOpen} />
          </div>
      </div>
    </div>
  );
}

function CreateProjectDialog({ onCreate }: { onCreate: (name: string) => void }) {
    const [name, setName] = useState('');
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Boardroom</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input id="project-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Q4 Marketing Initiative" />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                <Button onClick={() => onCreate(name)} disabled={!name.trim()}>Create</Button>
            </DialogFooter>
        </DialogContent>
    );
}

function RenameProjectDialog({ currentName, onRename }: { currentName: string, onRename: (newName: string) => void }) {
    const [newName, setNewName] = useState(currentName);
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Rename Boardroom</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="new-project-name">New Name</Label>
                <Input id="new-project-name" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                <DialogClose asChild><Button onClick={() => onRename(newName)} disabled={!newName.trim() || newName === currentName}>Rename</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

function InviteColleaguesDialog({ colleagues, project, existingMembers, existingInvites }: { colleagues: User[], project: Project | null, existingMembers: ProjectMember[], existingInvites: Invitation[] }) {
    const [selectedColleagues, setSelectedColleagues] = useState<string[]>([]);
    const [isInviting, setIsInviting] = useState(false);
    const { user: authUser } = useAuthUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleInvite = async () => {
        if (selectedColleagues.length === 0 || !authUser || !project || !firestore) return;
        setIsInviting(true);

        const batch = writeBatch(firestore);

        selectedColleagues.forEach(colleagueId => {
            const colleague = colleagues.find(c => c.id === colleagueId);
            if (colleague) {
                const invitationRef = doc(collection(firestore, 'projects', project.id, 'invitations'));
                const invitation: Omit<Invitation, 'id'> = {
                    projectId: project.id,
                    projectName: project.projectName,
                    inviterId: authUser.uid,
                    inviterName: authUser.displayName || 'A user',
                    inviteeId: colleagueId,
                    status: 'PENDING',
                    sentAt: serverTimestamp(),
                };
                batch.set(invitationRef, invitation);
            }
        });

        try {
          await batch.commit();
          toast({ title: `${selectedColleagues.length} invitation(s) sent.` });
          setSelectedColleagues([]);
        } catch(error) {
          console.error("Error sending invites:", error);
          toast({ variant: 'destructive', title: "Error", description: "Could not send invitations." });
        } finally {
          setIsInviting(false);
        }
    };

    const availableColleagues = colleagues.filter(c => 
        !existingMembers.some(m => m.userId === c.id) && 
        !existingInvites.some(i => i.inviteeId === c.id && i.status === 'PENDING')
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" disabled={!project}><UserPlus className="mr-2 h-4 w-4" /> Invite</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Colleagues to {project?.projectName}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <h4 className="font-medium">Select colleagues to invite:</h4>
                    <ScrollArea className="h-64 border rounded-md p-2">
                        {availableColleagues.length > 0 ? availableColleagues.map(colleague => (
                            <div key={colleague.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={colleague.avatar} />
                                        <AvatarFallback>{colleague.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{colleague.name}</p>
                                        <p className="text-xs text-muted-foreground">{colleague.headline}</p>
                                    </div>
                                </div>
                                <Checkbox
                                    checked={selectedColleagues.includes(colleague.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedColleagues(prev => [...prev, colleague.id]);
                                        } else {
                                            setSelectedColleagues(prev => prev.filter(id => id !== colleague.id));
                                        }
                                    }}
                                />
                            </div>
                        )) : (
                            <p className="text-center text-sm text-muted-foreground p-8">No available colleagues to invite.</p>
                        )}
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                    <Button onClick={handleInvite} disabled={selectedColleagues.length === 0 || isInviting}>
                        {isInviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send {selectedColleagues.length > 0 ? selectedColleagues.length : ''} Invite(s)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function BoardroomsPage() {
  return (
    <ClientOnly>
      <BoardroomsPageInternal />
    </ClientOnly>
  );
}

    

    
