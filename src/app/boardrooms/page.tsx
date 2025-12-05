'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  useUser as useAuthUser,
  useSupabase,
} from '@/lib/supabase/provider';
import { ClientOnly } from '@/components/layout/client-only';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    const supabase = useSupabase();
    const { toast } = useToast();

    // --- Active Project Data ---
    const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
    const [messages, setMessages] = useState<ProjectMessage[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    
    useEffect(() => {
        if (!project || !supabase) return;
        
        const fetchProjectData = async () => {
            const { data: membersData } = await supabase.from('project_members').select('*, user:users(*)').eq('project_id', project.id);
            if (membersData) {
              setProjectMembers(membersData.map((m: any) => ({ ...m, name: m.user.name, avatar: m.user.avatar, userId: m.user_id })));
            }

            const { data: messagesData } = await supabase.from('project_messages').select('*').eq('project_id', project.id).order('created_at', { ascending: true });
            if (messagesData) setMessages(messagesData as ProjectMessage[]);
        };
        fetchProjectData();

        const messagesChannel = supabase.channel(`project-messages:${project.id}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_messages', filter: `project_id=eq.${project.id}` }, 
            (payload) => setMessages(current => [...current, payload.new as ProjectMessage])
          ).subscribe();

        return () => { supabase.removeChannel(messagesChannel) };
    }, [project, supabase]);


    const [newMessage, setNewMessage] = useState('');
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
    const [fileName, setFileName] = useState<string | undefined>(undefined);
    const [isSending, setIsSending] = useState(false);

    const [colleagues, setColleagues] = useState<User[]>([]);
    useEffect(() => {
        if (!authUser || !supabase) return;
        const fetchColleagues = async () => {
            const { data: colleagueRelations } = await supabase.from('colleagues').select('colleague_id').eq('user_id', authUser.id);
            if (colleagueRelations) {
                const colleagueIds = colleagueRelations.map(r => r.colleague_id);
                if (colleagueIds.length > 0) {
                    const { data: colleaguesData } = await supabase.from('users').select('*').in('id', colleagueIds);
                    if(colleaguesData) setColleagues(colleaguesData as User[]);
                }
            }
        }
        fetchColleagues();
    }, [authUser, supabase]);


    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !imageUrl && !fileUrl) || !project || !authUser || !supabase) return;
        setIsSending(true);

        const { data: userProfile } = await supabase.from('users').select('name, avatar').eq('id', authUser.id).single();

        const messageData: Partial<ProjectMessage> = {
            project_id: project.id,
            sender_id: authUser.id,
            sender_name: userProfile?.name || 'User',
            sender_avatar: userProfile?.avatar || '',
            content: newMessage,
            image_url: imageUrl,
            file_url: fileUrl,
            file_name: fileName,
        };
        
        try {
          await supabase.from('project_messages').insert(messageData);
          setNewMessage('');
          setImageUrl(undefined);
          setFileUrl(undefined);
          setFileName(undefined);
        } catch (error: any) {
          console.error("Error sending message:", error);
          toast({ variant: 'destructive', title: "Message Failed", description: error.message });
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
                            <Avatar key={member.user_id} className="h-8 w-8">
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
                                    <AvatarImage src={msg.sender_avatar} />
                                    <AvatarFallback>{msg.sender_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="font-bold">{msg.sender_name}</span>
                                        <span className="text-muted-foreground">
                                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : 'sending...'}
                                        </span>
                                    </div>
                                    <div className="text-sm mt-1 space-y-2 border-l-2 border-primary pl-4 py-1">
                                        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                                        {msg.image_url && (
                                            <div className="relative aspect-video w-48 overflow-hidden rounded-md">
                                                <Image src={msg.image_url} alt="Uploaded image" fill className="object-cover" />
                                            </div>
                                        )}
                                        {msg.file_url && (
                                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="justify-start">
                                                    <Paperclip className="mr-2 h-4 w-4" />
                                                    {msg.file_name || "View Attachment"}
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
                                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5" onClick={() => setImageUrl(undefined)}><X className="h-3 w-3"/></Button>
                                </div>
                            </div>
                        )}
                        {fileName && (
                            <div className="absolute -top-12 left-0 w-full max-w-xs">
                                <div className="flex items-center gap-2 rounded-md border bg-muted p-1 text-sm">
                                    <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="flex-1 truncate">{fileName}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => { setFileUrl(undefined); setFileName(undefined); }}>
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
  const supabase = useSupabase();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  
  useEffect(() => {
      if (!authUser || !supabase) {
          setIsLoadingProjects(false);
          return;
      };
      
      const fetchProjects = async () => {
          setIsLoadingProjects(true);
          const { data } = await supabase.from('user_projects').select('*, project:projects(*)').eq('user_id', authUser.id).order('created_at', { ascending: false });
          if(data) {
              const userProjects = data.map((up: any) => ({ ...up.project, id: up.project_id, role: up.role, projectName: up.project.project_name }));
              setProjects(userProjects);
          }
          setIsLoadingProjects(false);
      }
      fetchProjects();

      const projectsSub = supabase.channel('user-projects')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_projects', filter: `user_id=eq.${authUser.id}` }, 
        () => fetchProjects()
        ).subscribe();

      return () => { supabase.removeChannel(projectsSub); }

  }, [authUser, supabase]);


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

  const isLoading = isAuthUserLoading || isLoadingProjects;

  const handleCreateProject = async (projectName: string) => {
    if (!projectName.trim() || !authUser || !supabase) {
        toast({ variant: 'destructive', title: "Cannot create project", description: "You must be logged in and provide a project name." });
        return;
    }
    
    // Create Project
    const { data: newProject, error: projectError } = await supabase.from('projects').insert({ project_name: projectName, creator_id: authUser.id }).select().single();
    if(projectError) {
        toast({ variant: 'destructive', title: "Creation Failed", description: projectError.message });
        return;
    }

    // Add creator to members
    const { error: memberError } = await supabase.from('project_members').insert({ project_id: newProject.id, user_id: authUser.id, role: 'creator' });
    if(memberError) { /* handle rollback if needed */ }

    // Add to user's project list
    const { error: userProjectError } = await supabase.from('user_projects').insert({ user_id: authUser.id, project_id: newProject.id, role: 'creator' });
    if(userProjectError) { /* handle rollback */ }

    toast({ title: 'Project Created', description: `"${projectName}" has been successfully created.` });
    setIsCreateProjectOpen(false);
  };
  
  const handleDeleteProject = async (projectId: string) => {
    if (!authUser || !supabase) return;
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if(error) {
        toast({ variant: 'destructive', title: "Delete Failed", description: error.message });
    } else {
        toast({ title: "Project Deleted" });
        if (activeProject?.id === projectId) {
            setActiveProject(null);
        }
    }
  }

  const handleRenameProject = async (projectId: string, newName: string) => {
    if (!newName.trim() || !authUser || !supabase) return;
    const { error } = await supabase.from('projects').update({ project_name: newName }).eq('id', projectId);
    
    if(error) {
        toast({ variant: 'destructive', title: "Rename Failed", description: error.message });
    } else {
        toast({ title: "Boardroom Renamed", description: `Successfully renamed to "${newName}".` });
        if (activeProject?.id === projectId) {
            setActiveProject(prev => prev ? { ...prev, projectName: newName } : null);
        }
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

  const [colleagues, setColleagues] = useState<User[]>([]);
  const [isLoadingColleagues, setIsLoadingColleagues] = useState(true);

  useEffect(() => {
    if(!authUser || !supabase) return;
    setIsLoadingColleagues(true);
    const fetchColleagues = async () => {
        const { data: relations } = await supabase.from('colleagues').select('colleague_id').eq('user_id', authUser.id);
        if (relations) {
            const ids = relations.map(r => r.colleague_id);
            if (ids.length > 0) {
                const { data: users } = await supabase.from('users').select('*').in('id', ids);
                if (users) setColleagues(users as User[]);
            }
        }
        setIsLoadingColleagues(false);
    }
    fetchColleagues();
  }, [authUser, supabase]);

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
                                              {project.creatorId === authUser?.id && (
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
                {(isLoadingColleagues) ? (
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
                                {project.creatorId === authUser?.id && (
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
    const supabase = useSupabase();
    const { toast } = useToast();

    const handleInvite = async () => {
        if (selectedColleagues.length === 0 || !authUser || !project || !supabase) return;
        setIsInviting(true);

        const invites = selectedColleagues.map(colleagueId => ({
            project_id: project.id,
            inviter_id: authUser.id,
            invitee_id: colleagueId,
            status: 'PENDING',
        }));

        const { error } = await supabase.from('project_invitations').insert(invites);

        if(error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not send invitations." });
        } else {
            toast({ title: `${selectedColleagues.length} invitation(s) sent.` });
            setSelectedColleagues([]);
        }
        setIsInviting(false);
    };

    const availableColleagues = colleagues.filter(c => 
        !existingMembers.some(m => m.user_id === c.id) && 
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