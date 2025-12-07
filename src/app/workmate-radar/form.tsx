
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { aiWorkmateRadar } from '@/lib/workmate-radar';
import type { AIWorkmateRadarInput, AIWorkmateRadarOutput, User as UserType, AppUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertCircle,
  User as UserIcon,
  SlidersHorizontal,
  Zap,
  MessageSquare,
  UserPlus,
  Heart,
  Globe,
  Link as LinkIcon,
  Users,
  CheckCircle,
  X,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { User } from '@/lib/types';
import { useUser, useSupabase } from '@/lib/supabase/provider';
import { buildVocabulary, createTfIdfVector } from '@/lib/algorithms/text-analysis';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


const formSchema = z.object({
  userProfile: z
    .string()
    .min(10, 'Please provide a profile description or select traits from the picker.'),
  teamSize: z.coerce
    .number()
    .int()
    .min(1, 'Team size must be at least 1.')
    .max(10, 'Team size cannot exceed 10.'),
  country: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// In a real app, this would be fetched or be in a shared config
const countries = [
    "Global", "United States", "China", "India", "Indonesia", "Pakistan", "Brazil", "Nigeria", "Bangladesh", "Russia", "Mexico",
    "Japan", "Ethiopia", "Philippines", "Egypt", "Vietnam", "DR Congo", "Turkey", "Iran", "Germany", "Thailand",
    "United Kingdom", "France", "Italy", "Tanzania", "South Africa", "Myanmar", "Kenya", "South Korea", "Colombia",
    "Spain", "Uganda", "Argentina", "Algeria", "Sudan", "Ukraine", "Iraq", "Afghanistan", "Poland", "Canada",
    "Morocco", "Saudi Arabia", "Uzbekistan", "Peru", "Angola", "Malaysia", "Mozambique", "Ghana", "Yemen", "Nepal",
    "Venezuela", "Madagascar", "Cameroon", "Côte d'Ivoire", "North Korea", "Australia", "Niger", "Taiwan", "Sri Lanka",
    "Burkina Faso", "Mali", "Romania", "Malawi", "Chile", "Kazakhstan", "Zambia", "Guatemala", "Ecuador", "Syria",
    "Netherlands", "Senegal", "Cambodia", "Chad", "Somalia", "Zimbabwe", "Guinea", "Rwanda", "Benin", "Burundi",
    "Tunisia", "Bolivia", "Belgium", "Haiti", "Cuba", "South Sudan", "Dominican Republic", "Czech Republic", "Greece",
    "Jordan", "Portugal", "Azerbaijan", "Sweden", "Honduras", "United Arab Emirates", "Hungary", "Tajikistan",
    "Belarus", "Austria", "Papua New Guinea", "Serbia", "Israel", "Switzerland", "Togo", "Sierra Leone", "Hong Kong",
    "Laos", "Paraguay", "Bulgaria", "Libya", "Lebanon", "Nicaragua", "Kyrgyzstan", "El Salvador", "Turkmenistan",
    "Singapore", "Denmark", "Finland", "Congo", "Slovakia", "Norway", "Oman", "State of Palestine", "Costa Rica",
    "Liberia", "Ireland", "Central African Republic", "New Zealand", "Mauritania", "Panama", "Kuwait", "Croatia",
    "Moldova", "Georgia", "Eritrea", "Uruguay", "Bosnia and Herzegovina", "Mongolia", "Armenia", "Jamaica", "Qatar",
    "Albania", "Lithuania", "Namibia", "Gambia", "Botswana", "Gabon", "Lesotho", "North Macedonia", "Slovenia",
    "Guinea-Bissau", "Latvia", "Bahrain", "Equatorial Guinea", "Trinidad and Tobago", "Estonia", "Timor-Leste",
    "Mauritius", "Cyprus", "Eswatini", "Djibouti", "Fiji", "Comoros", "Guyana", "Bhutan", "Solomon Islands", "Macau",
    "Montenegro", "Luxembourg", "Western Sahara", "Suriname", "Cape Verde", "Maldives", "Malta", "Brunei", "Belize",
    "Bahamas", "Iceland", "Vanuatu", "Barbados", "Sao Tome and Principe", "Samoa", "Saint Lucia",
    "Kiribati", "Micronesia", "Grenada", "St. Vincent &amp; Grenadines", "Tonga", "Seychelles",
    "Antigua and Barbuda", "Andorra", "Dominica", "Marshall Islands", "Saint Kitts and Nevis", "Monaco", "Liechtenstein",
    "San Marino", "Palau", "Tuvalu", "Nauru", "Vatican City"
];

// Define a more specific type for the results to avoid `any`
type SuggestedMember = AIWorkmateRadarOutput['suggestedMembers'][0];
type SuggestedMemberWithProfile = SuggestedMember & {
    fullProfile: UserType | null;
    isFallback?: boolean;
};
type RadarResultWithProfile = {
    suggestedMembers: SuggestedMemberWithProfile[];
};


export function WorkmateRadarForm() {
  const [result, setResult] = useState<RadarResultWithProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<UserType[]>([]);

  const { user: authUser } = useUser();
  const supabase = useSupabase();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isCurrentUserLoading, setIsCurrentUserLoading] = useState(true);

  useEffect(() => {
    if (!authUser || !supabase) {
        setIsCurrentUserLoading(false);
        return;
    };
    const fetchUser = async () => {
        setIsCurrentUserLoading(true);
        const { data } = await supabase.from('users').select('*, freelancer_profiles(*)').eq('id', authUser.id).single();
        if (data) {
            const userData: AppUser = {
                ...data,
                freelancer_profiles: Array.isArray(data.freelancer_profiles) ? data.freelancer_profiles[0] : data.freelancer_profiles
            };
            setCurrentUser(userData);
        }
        setIsCurrentUserLoading(false);
    }
    fetchUser();
  }, [supabase, authUser]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userProfile: '',
      teamSize: 3,
      country: 'Global',
    },
  });
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    if (isCurrentUserLoading || !currentUser || !supabase) {
      setError('User data is not available yet. Please try again in a moment.');
      setLoading(false);
      return;
    }

    try {
        const { data: allUsers, error: usersError } = await supabase.from('users').select('*');

        if(usersError) throw usersError;

        if (!allUsers || allUsers.length === 0) {
            setError("No users found in the database to perform a match.");
            setLoading(false);
            return;
        }

        const corpus = allUsers.map(u => `${u.bio || ''} ${u.skills?.join(' ') || ''}`);
        const vocabulary = buildVocabulary(corpus);

        const allUsersWithVectors = allUsers.map(u => {
            const serializableProfile: Partial<User> = {
                id: u.id,
                name: u.name,
                headline: u.headline,
                bio: u.bio,
                skills: u.skills,
                reliability_score: u.reliability_score,
                location: u.location,
                created_at: u.created_at,
            };
            return {
                profile: serializableProfile as User,
                vector: createTfIdfVector(`${u.bio || ''} ${u.skills?.join(' ') || ''}`, corpus, vocabulary),
            }
        });

        const currentUserWithVector = allUsersWithVectors.find(u => u.profile.id === currentUser.id);

        if (!currentUserWithVector) {
            setError("Could not process your own profile for matching. Please ensure your profile is complete.");
            setLoading(false);
            return;
        }

        const input: AIWorkmateRadarInput = {
            currentUserVector: currentUserWithVector.vector,
            allUsersWithVectors: allUsersWithVectors as any,
            teamSize: data.teamSize,
            currentUserId: currentUser.id,
            country: data.country,
        };

        const output = await aiWorkmateRadar(input);
        
        const detailedResults = output.suggestedMembers.map(member => {
            const fullProfile = allUsers.find(u => u.id === member.profileId);
            return {
                ...member,
                fullProfile: fullProfile || null,
            }
        });
        
        setResult({ suggestedMembers: detailedResults });
    } catch (e) {
      setError('An unexpected error occurred. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAutomatch = () => {
    if (isCurrentUserLoading) {
      toast({
        variant: "destructive",
        title: "Loading Profile",
        description: "Please wait for your profile to load before using Automatch.",
      });
      return;
    }
    if (!currentUser) {
       toast({
        variant: "destructive",
        title: "Profile Incomplete",
        description: "Could not find your profile for automatch. Please complete your profile in settings.",
      });
      return;
    }
    
    // Construct a descriptive string from the user's profile
    const userTraits = (currentUser.freelancer_profiles?.advanced_traits || []).join(', ');
    let autoProfile = `This user's headline is "${currentUser.headline}". Their bio is: "${currentUser.bio}". Their skills include: ${(currentUser.skills || []).join(', ')}.`;
    if (userTraits) {
        autoProfile += ` Their work style and traits include: ${userTraits}.`;
    }
    autoProfile += " Please find collaborators who would complement this user's profile.";


    // Set the value in the form field for user review
    form.setValue('userProfile', autoProfile, { shouldValidate: true });
    
    toast({
        title: "Profile Loaded!",
        description: "Your profile has been loaded into the description field for review."
    });
  };
  
  const formIsLoading = loading || isCurrentUserLoading;

  const handleMemberSelect = (member: UserType, isSelected: boolean) => {
      setSelectedMembers(prev => 
          isSelected ? [...prev, member] : prev.filter(m => m.id !== member.id)
      );
  };

  const handleCreateBoardroom = async (teamName: string) => {
    if (!supabase || !authUser || !currentUser || selectedMembers.length === 0) return;
    
    const { data: newProject, error: projectError } = await supabase.from('projects').insert({ project_name: teamName, creator_id: authUser.id }).select().single();
    if(projectError || !newProject) {
        toast({ variant: 'destructive', title: 'Error creating project', description: projectError?.message });
        return;
    }

    const allMemberIds = [currentUser.id, ...selectedMembers.map(m => m.id)];
    
    const memberInserts = allMemberIds.map(memberId => ({
        project_id: newProject.id,
        user_id: memberId,
        role: memberId === authUser.id ? 'creator' : 'member'
    }));

    const userProjectInserts = allMemberIds.map(memberId => ({
        user_id: memberId,
        project_id: newProject.id,
        role: memberId === authUser.id ? 'creator' : 'member'
    }));
    
    const { error: memberError } = await supabase.from('project_members').insert(memberInserts);
    if(memberError) {
        toast({ variant: 'destructive', title: 'Error adding members', description: memberError?.message });
        return;
    }

    const { error: userProjectError } = await supabase.from('user_projects').insert(userProjectInserts);
    if(userProjectError) {
        toast({ variant: 'destructive', title: 'Error updating user projects', description: userProjectError?.message });
        return;
    }

    toast({
        title: "Boardroom Created!",
        description: `"${teamName}" has been created with ${selectedMembers.length + 1} members.`
    });
    setSelectedMembers([]);
    setResult(null);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="userProfile"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Your Profile / Project Description</FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Describe yourself, your skills, or the project you're building."
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The more detail you provide, the better the matches will be.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <FormField
              control={form.control}
              name="teamSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Members</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <ScrollArea className="h-72">
                        {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </ScrollArea>
                    </SelectContent>
                  </Select>
                  <FormDescription>Filter matches by country or search globally.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              type="submit"
              disabled={formIsLoading}
              className="flex-1"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              {loading
                ? 'Analyzing...'
                : 'Find My Dream Team'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={formIsLoading}
              onClick={handleAutomatch}
              className="flex-1"
            >
              <Zap className="mr-2 h-4 w-4" />
              {isCurrentUserLoading
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                : null}
              {isCurrentUserLoading
                ? 'Loading Profile...'
                : 'Automatch From My Profile'}
            </Button>
          </div>
        </form>
      </Form>

      {loading && <ResultsSkeleton />}
      {error && <ErrorAlert message={error} />}
      {result && (
        <ResultsDisplay
          result={result}
          onMemberSelect={handleMemberSelect}
          selectedMemberIds={selectedMembers.map(m => m.id)}
        />
      )}
      
      {selectedMembers.length > 0 && (
        <div className="sticky bottom-4 z-10 mt-8 w-full">
            <Card className="max-w-3xl mx-auto bg-background/80 backdrop-blur-md border-primary shadow-2xl">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Finalize Your Team</CardTitle>
                        <CardDescription>You've selected {selectedMembers.length} member(s).</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 -mt-2 -mr-2" onClick={() => setSelectedMembers([])}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        {currentUser && (
                            <div className="flex items-center gap-2 rounded-full border border-dashed p-1 pr-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={currentUser.avatar ?? undefined} />
                                    <AvatarFallback>{currentUser.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{currentUser.name} (You)</span>
                            </div>
                        )}
                        {selectedMembers.map(member => (
                            <div key={member.id} className="flex items-center gap-2 rounded-full border bg-muted p-1 pr-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.avatar ?? undefined} />
                                    <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{member.name}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <ConfirmationDialog 
                        teamName={`${currentUser?.name}'s New Team`} 
                        onConfirm={handleCreateBoardroom} 
                    />
                </CardFooter>
            </Card>
        </div>
      )}
    </div>
  );
}

function ConfirmationDialog({ teamName, onConfirm }: { teamName: string; onConfirm: (name: string) => void }) {
    const [name, setName] = useState(teamName);
    return (
         <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="w-full">Create Boardroom</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Create a New Boardroom?</AlertDialogTitle>
                    <AlertDialogDescription>
                        A new private project boardroom will be created with the selected members.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Label htmlFor="team-name">Boardroom Name</Label>
                    <Input id="team-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onConfirm(name)} disabled={!name.trim()}>
                        Confirm &amp; Create
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

function ResultsSkeleton() {
  return (
    <div className="mt-8">
      <Skeleton className="mb-6 h-8 w-1/3" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-1/4" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </CardContent>
             <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="mt-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function ProfileDialog({ member }: { member: SuggestedMemberWithProfile }) {
    if (!member.fullProfile) return null;
    
    return (
        <DialogContent className="max-w-md">
            <DialogHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={member.fullProfile.avatar ?? undefined} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <DialogTitle className="text-2xl">{member.name}</DialogTitle>
                <DialogDescription>{member.fullProfile.headline}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 text-sm text-muted-foreground">
                <p>{member.fullProfile.bio}</p>
                <div>
                    <h4 className="font-semibold text-foreground mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                        {member.fullProfile.skills?.map((skill: string) => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                    </div>
                </div>
            </div>
            <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                 <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                 </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

function ResultsDisplay({
  result,
  onMemberSelect,
  selectedMemberIds,
}: {
  result: RadarResultWithProfile;
  onMemberSelect: (member: UserType, selected: boolean) => void;
  selectedMemberIds: string[];
}) {
  if (!result.suggestedMembers || result.suggestedMembers.length === 0) {
    return (
      <Card className="mt-8 text-center">
        <CardContent className="p-8">
          <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Members Found</h3>
          <p className="mt-1 text-muted-foreground">
            We couldn't find any matches based on your criteria.
            Try adjusting your profile description or location filter.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const isFallbackResult = result.suggestedMembers.some(m => m.isFallback);
  const allMemberProfiles = result.suggestedMembers.map(m => m.fullProfile).filter(Boolean) as UserType[];
  const areAllSelected = allMemberProfiles.length > 0 && allMemberProfiles.every(p => selectedMemberIds.includes(p.id));

  const handleSelectAll = () => {
    if (areAllSelected) {
      allMemberProfiles.forEach(p => onMemberSelect(p, false));
    } else {
      allMemberProfiles.forEach(p => {
        if (!selectedMemberIds.includes(p.id)) {
          onMemberSelect(p, true);
        }
      });
    }
  };

  return (
    <div className="mt-8">
       <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {isFallbackResult ? 'Who You Might Profit With' : 'Suggested Team Members'}
        </h2>
        <Button variant="outline" onClick={handleSelectAll}>
            {areAllSelected ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
       {isFallbackResult && (
        <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Secondary Matches</AlertTitle>
            <AlertDescription>
                We couldn't find direct skill-based matches. Here are some professionals in your area with similar experience levels who might be valuable connections.
            </AlertDescription>
        </Alert>
      )}
      <div className="space-y-6">
        {result.suggestedMembers.map((member) => {
            const isSelected = selectedMemberIds.includes(member.profileId);
            return (
              <Card key={member.profileId} className={isSelected ? 'border-primary ring-2 ring-primary' : ''}>
                <div className="flex">
                    <div
                        onClick={() => member.fullProfile && onMemberSelect(member.fullProfile, !isSelected)}
                        className="flex cursor-pointer items-center justify-center bg-muted/50 p-4"
                    >
                        <Checkbox checked={isSelected} className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <CardHeader>
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="flex items-start gap-4 cursor-pointer">
                                    <Avatar className="h-12 w-12">
                                    <AvatarImage src={member.fullProfile?.avatar ?? undefined} alt={member.name} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                    <CardTitle>{member.name}</CardTitle>
                                    <div>
                                        <p className="text-sm font-medium text-primary">
                                        Match Score: {member.matchScore}%
                                        </p>
                                        <Progress value={member.matchScore} variant="swiss" />
                                    </div>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <ProfileDialog member={member} />
                        </Dialog>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">{member.shortBio}</p>
                        <div>
                            <h4 className="mb-2 text-sm font-semibold">Top Skills</h4>
                            <div className="flex flex-wrap gap-2">
                            {member.skills.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                {skill}
                                </Badge>
                            ))}
                            </div>
                        </div>
                        </CardContent>
                    </div>
                </div>
                 {(member.secondaryMatches && member.secondaryMatches.length > 0) && (
                    <Accordion type="single" collapsible className="w-full px-6 pb-4">
                        <AccordionItem value="item-1" className="border-b-0">
                            <AccordionTrigger className="text-sm text-muted-foreground hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Recommended Team-Up
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-3 pt-2">
                                    {member.secondaryMatches.map(sec_member => (
                                        <div key={sec_member.profileId} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={sec_member.avatar} />
                                                    <AvatarFallback>{sec_member.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-semibold">{sec_member.name}</p>
                                                    <p className="text-xs text-muted-foreground">{sec_member.headline}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    )}
              </Card>
            )
        })}
      </div>
    </div>
  );
}
