
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Zap, AlertCircle, Kanban, CircleDollarSign, Clock, SlidersHorizontal, Settings2, Building, UserPlus, Barcode, User as UserIcon, ShieldCheck, BookOpen, Heart, Info, CalendarDays, PercentCircle, ChevronDown, CheckCircle, XCircle } from "lucide-react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillSyncNet, type SkillSyncNetInput, type SkillSyncNetOutput } from "@/lib/matches";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ClientOnly } from "@/components/layout/client-only";
import { useUserCollection, useFirestore, useUser as useAuthUser, setDocumentNonBlocking, useDoc } from "@/firebase";
import { collection, query, limit, where, doc, Timestamp, getDocs } from 'firebase/firestore';
import type { User as UserType, FreelancerProfile } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { createTfIdfVector, buildVocabulary } from "@/lib/algorithms/text-analysis";
import { freelanceNiches } from "@/lib/freelance-niches";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";

const clientFormSchema = z.object({
  projectTitle: z.string().min(5, "Project title must be at least 5 characters."),
  projectDescription: z.string().min(20, "Please provide a detailed project description."),
  requiredSkills: z.string().min(3, "Please list at least one required skill."),
  budget: z.coerce.number().min(1, "Budget must be a positive number."),
  timeline: z.enum(["<1 week", "1-2 weeks", "2-4 weeks", "1-2 months", ">2 months"]),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

const requirementCategories = {
    "Project & Scope": {
        "Project Type": ["One-time task", "Short-term project", "Long-term engagement", "Full-time contract", "Consultation"],
        "Project Scale": ["Small (Individual Contributor)", "Medium (Small Team Collaboration)", "Large (Complex, Multi-team)"],
        "Deliverables": ["Strategy/Plan", "Creative Assets (e.g., designs, content)", "Code/Software", "Analysis & Reports", "Hands-on Implementation"],
    },
    "Experience Level & Seniority": {
        "Seniority": ["Entry-Level/Junior", "Mid-Level", "Senior", "Expert/Lead"],
        "Key Attributes": ["Strategic Thinker", "Technical Specialist", "Creative Visionary", "Project Manager", "Data-driven"],
        "Tool Proficiency": ["Beginner", "Intermediate", "Advanced", "Expert"],
    },
    "Collaboration & Communication": {
        "Working Style": ["Independent/Autonomous", "Highly Collaborative", "Agile/Scrum", "Asynchronous"],
        "Communication": ["Daily Check-ins", "Weekly Syncs", "Prefers Written Updates", "Client-facing"],
        "Team Structure": ["Works directly with client", "Integrates with an existing team", "Leads a team"],
    },
    "Industry & Domain": {
        "Industry Experience": ["Tech/SaaS", "Creative/Media", "Business/Finance", "Healthcare/Science", "Education", "E-commerce/Retail", "Legal/Compliance"],
        "Company Size": ["Startup (1-50)", "Scale-up (51-500)", "Enterprise (500+)", "Non-profit"],
        "Target Audience": ["B2B", "B2C", "Internal", "Specialized/Niche"],
    },
    "Soft Skills & Professionalism": {
        "Pace & Urgency": ["Fast-paced, deadline-driven", "Steady and planned", "Flexible and iterative"],
        "Attention to Detail": ["Pixel-perfect precision", "High-level concepts", "Balanced approach"],
        "Problem Solving": ["Requires strong analytical skills", "Needs creative problem-solving", "Prefers structured guidance"],
    }
};

type ReqCategory = keyof typeof requirementCategories;
type SelectedReqs = Record<ReqCategory, Record<string, string[]>>;

type FreelanceNicheCategory = keyof typeof freelanceNiches;
type SelectedNiches = Record<string, string[]>;

function NichePickerDialog({ onSave, initialNiches }: { onSave: (niches: string[]) => void, initialNiches: string[] }) {
    const [selected, setSelected] = useState<SelectedNiches>(() => {
        const initialState: SelectedNiches = {};
        initialNiches.forEach(niche => {
            for (const category in freelanceNiches) {
                if (freelanceNiches[category as FreelanceNicheCategory].includes(niche)) {
                    if (!initialState[category]) {
                        initialState[category] = [];
                    }
                    initialState[category].push(niche);
                }
            }
        });
        return initialState;
    });
    const [activeCategory, setActiveCategory] = useState<FreelanceNicheCategory>(Object.keys(freelanceNiches)[0] as FreelanceNicheCategory);


    const handleSelect = (category: string, subNiche: string) => {
        setSelected(prev => {
            const newSelection = { ...prev };
            if (!newSelection[category]) {
                newSelection[category] = [];
            }
            const isSelected = newSelection[category].includes(subNiche);
            if (isSelected) {
                newSelection[category] = newSelection[category].filter(s => s !== subNiche);
            } else {
                newSelection[category].push(subNiche);
            }
            return newSelection;
        });
    };
    
    const handleSaveChanges = () => {
        const allSelected = Object.values(selected).flat();
        onSave(allSelected);
    };

    return (
        <DialogContent className="sm:max-w-4xl p-0">
            <div className="grid grid-cols-[250px_1fr] h-[70vh]">
                <div className="bg-muted/50 border-r py-4">
                    <DialogHeader className="px-4 pb-2">
                        <DialogTitle className="text-base font-semibold">Niche Categories</DialogTitle>
                    </DialogHeader>
                     <ScrollArea className="h-full">
                        <div className="flex flex-col gap-1 px-2">
                            {Object.keys(freelanceNiches).map((mainCategory) => (
                                <Button
                                    key={mainCategory}
                                    variant={activeCategory === mainCategory ? "secondary" : "ghost"}
                                    className="h-auto justify-start text-left text-sm whitespace-normal py-2"
                                    onClick={() => setActiveCategory(mainCategory as FreelanceNicheCategory)}
                                >
                                    {mainCategory}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                 <div className="py-4 overflow-y-auto">
                    <DialogHeader className="px-6 pb-4">
                        <DialogTitle className="text-xl font-bold">{activeCategory}</DialogTitle>
                        <DialogDescription>Select all skills that apply to your project.</DialogDescription>
                    </DialogHeader>
                    <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        {(freelanceNiches[activeCategory] || []).map(subNiche => (
                            <div key={subNiche} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`${activeCategory}-${subNiche}`}
                                    checked={selected[activeCategory]?.includes(subNiche) || false}
                                    onCheckedChange={() => handleSelect(activeCategory, subNiche)}
                                />
                                <label
                                    htmlFor={`${activeCategory}-${subNiche}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {subNiche}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
             <DialogFooter className="p-4 border-t">
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <DialogClose asChild><Button type="button" onClick={handleSaveChanges}>Apply Selection</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

function AdvancedRequirementsDialog({ onSave }: { onSave: (reqs: string) => void }) {
    const [selectedReqs, setSelectedReqs] = useState<SelectedReqs>({} as SelectedReqs);
    const [activeCategory, setActiveCategory] = useState<ReqCategory>("Project & Scope");

    const handleSelect = (mainCategory: ReqCategory, subCategory: string, req: string) => {
        setSelectedReqs(prev => {
            const newSelections = JSON.parse(JSON.stringify(prev));
            if (!newSelections[mainCategory]) newSelections[mainCategory] = {};
            if (!newSelections[mainCategory][subCategory]) newSelections[mainCategory][subCategory] = [];
            
            const currentReqs: string[] = newSelections[mainCategory][subCategory];
            const isSelected = currentReqs.includes(req);

            if (isSelected) {
                newSelections[mainCategory][subCategory] = currentReqs.filter(r => r !== req);
            } else {
                newSelections[mainCategory][subCategory].push(req);
            }
            return newSelections;
        });
    };

    const handleSaveChanges = () => {
        let advancedDescription = "\n\nAdvanced Requirements:\n";
        const allSelections: string[] = [];

        for (const mainCategory in selectedReqs) {
            const subCategories = selectedReqs[mainCategory as ReqCategory];
            let categoryHasSelection = false;
            let categoryString = `  ${mainCategory.toUpperCase()}:\n`;
            
            for (const subCategory in subCategories) {
                const reqs = subCategories[subCategory];
                if (reqs.length > 0) {
                    categoryHasSelection = true;
                    categoryString += `    - ${subCategory}: ${reqs.join(', ')}\n`;
                }
            }
            if(categoryHasSelection) {
                allSelections.push(categoryString);
            }
        }
        
        if (allSelections.length > 0) {
            advancedDescription += allSelections.join('');
            onSave(advancedDescription);
        } else {
            onSave(""); // Save an empty string if no selections
        }
    };

    return (
        <DialogContent className="sm:max-w-4xl p-0">
            <div className="grid grid-cols-[250px_1fr] h-[70vh]">
                <div className="bg-muted/50 border-r py-4">
                    <DialogHeader className="px-4 pb-2">
                        <DialogTitle className="text-base font-semibold">Categories</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-full">
                        <div className="flex flex-col gap-1 px-2">
                            {Object.keys(requirementCategories).map((mainCategory) => (
                                <Button
                                    key={mainCategory}
                                    variant={activeCategory === mainCategory ? "secondary" : "ghost"}
                                    className="h-auto justify-start text-left text-sm whitespace-normal py-2"
                                    onClick={() => setActiveCategory(mainCategory as ReqCategory)}
                                >
                                    {mainCategory}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                 <div className="py-4 overflow-y-auto">
                    <DialogHeader className="px-6 pb-4">
                        <DialogTitle className="text-xl font-bold">{activeCategory}</DialogTitle>
                        <DialogDescription>Select the criteria that best fit your project.</DialogDescription>
                    </DialogHeader>
                    <div className="px-6 space-y-8">
                        {Object.entries(requirementCategories[activeCategory]).map(([subCategory, reqs]) => (
                            <div key={subCategory}>
                                <h5 className="font-semibold mb-4 text-base">{subCategory}</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    {Array.isArray(reqs) && reqs.map(req => (
                                        <div key={req} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`${activeCategory}-${subCategory}-${req}`}
                                                checked={(selectedReqs[activeCategory]?.[subCategory] || []).includes(req)}
                                                onCheckedChange={() => handleSelect(activeCategory, subCategory, req)}
                                            />
                                            <label htmlFor={`${activeCategory}-${subCategory}-${req}`} className="text-sm font-medium leading-none cursor-pointer">
                                                {req}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
             <DialogFooter className="p-4 border-t">
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <DialogClose asChild><Button type="button" onClick={handleSaveChanges}>Add Requirements</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

function GuidelinesDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const guidelines = [
        { title: "Respect Their Business", text: "They have bills to pay. Treat them as the professionals they are." },
        { title: "Lead with Your Budget", text: "Don't make them guess. Be upfront about what you can afford." },
        { title: "Pay a Deposit", text: "This is non-negotiable for serious clients and secures your freelancer's time." },
        { title: "Pay on Time", text: "Fast payment terms make you a hero and a preferred client." },
        { title: "Be Transparent", text: "If you can't pay their full rate, be upfront and offer a structured, valuable alternative (like cash + equity)." },
    ];
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader className="text-center items-center font-playfair">
                    <AlertDialogTitle className="text-2xl font-bold">
                        A Guide to Working with Top Talent
                    </AlertDialogTitle>
                    <AlertDialogDescription className="mt-2 text-md text-muted-foreground">
                        Follow these principles to build strong, professional relationships and attract the best freelancers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-4">
                    {guidelines.map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <span className="text-4xl font-bold text-primary opacity-20 font-playfair -mt-1">0{index + 1}</span>
                            <div>
                                <h4 className="font-semibold">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => onOpenChange(false)}>I Understand</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function FreelancerGuidelinesDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const guidelines = [
        { title: "Your Profile is Your Resume", text: "A complete, professional profile is the single most important factor for getting matched." },
        { title: "Specialize Your Skills", text: "Clearly define your niche and core skills to attract the right projects." },
        { title: "Communicate Professionally", text: "Respond promptly and clearly to project inquiries." },
        { title: "Know Your Worth", text: "Set a fair rate that reflects your skills and experience. Be prepared to explain your value." },
        { title: "Always Use a Contract", text: "Protect yourself and the client by using the Sentrybase contract system for every project." },
    ];
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader className="text-center items-center font-playfair">
                    <AlertDialogTitle className="text-2xl font-bold">
                        The Freelancer's Code
                    </AlertDialogTitle>
                    <AlertDialogDescription className="mt-2 text-md text-muted-foreground">
                        Follow these principles to maximize your success and security on Sentrybase.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-4">
                    {guidelines.map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <span className="text-4xl font-bold text-primary opacity-20 font-playfair -mt-1">0{index + 1}</span>
                            <div>
                                <h4 className="font-semibold">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <AlertDialogFooter>
                     <AlertDialogCancel asChild>
                         <Link href="/skill-sync-net/code">
                            <Button variant="outline"><BookOpen className="mr-2 h-4 w-4" />Read the Code</Button>
                        </Link>
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => onOpenChange(false)}>I Understand</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function BusinessEligibilityCard({ accountAge, hasSubscription, isLoading }: { accountAge: number, hasSubscription: boolean, isLoading: boolean }) {
    const accountAgeReq = 7;
    const accountAgeProgress = Math.min(100, (accountAge / accountAgeReq) * 100);

    return (
        <Card className="border-dashed">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    Unlock Freelancer Search
                </CardTitle>
                <CardDescription>
                    To ensure a high-quality marketplace, some criteria must be met before you can search for talent.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading ? (
                    <>
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>Account Age</span>
                                </div>
                                <span className={cn(accountAge >= accountAgeReq && "text-green-500")}>{accountAge} / {accountAgeReq} day(s)</span>
                            </div>
                            <Progress value={accountAgeProgress} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    <span>Active Subscription</span>
                                </div>
                                <span className={cn(hasSubscription && "text-green-500")}>{hasSubscription ? 'Active' : 'Inactive'}</span>
                            </div>
                            <Progress value={hasSubscription ? 100 : 0} />
                             <p className="text-xs text-muted-foreground pt-1">An active, paid subscription is required to contact freelancers.</p>
                        </div>
                    </>
                )}
            </CardContent>
             <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/billing">Upgrade Subscription</Link>
                 </Button>
            </CardFooter>
        </Card>
    );
}


function ClientView() {
    const [result, setResult] = useState<SkillSyncNetOutput | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
    const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
    const [candidateUsers, setCandidateUsers] = useState<UserType[]>([]);
    const firestore = useFirestore();
    const { user: authUser } = useAuthUser();

    useEffect(() => {
        const hasSeenGuidelines = sessionStorage.getItem('seenClientGuidelines');
        if (!hasSeenGuidelines) {
            setIsGuidelinesOpen(true);
            sessionStorage.setItem('seenClientGuidelines', 'true');
        }
    }, []);

    const currentUserQuery = useMemo(() => {
        if (!firestore || !authUser) return null;
        return doc(firestore, 'users', authUser.uid);
    }, [firestore, authUser]);
    const { data: currentUser, isLoading: isLoadingCurrentUser } = useDoc<UserType>(currentUserQuery);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            projectDescription: "",
            requiredSkills: ""
        }
    });
    
    const differenceInDays = (dateLeft: Date, dateRight: Date): number => {
      const _MS_PER_DAY = 1000 * 60 * 60 * 24;
      const utc1 = Date.UTC(dateLeft.getFullYear(), dateLeft.getMonth(), dateLeft.getDate());
      const utc2 = Date.UTC(dateRight.getFullYear(), dateRight.getMonth(), dateRight.getDate());
      return Math.floor((utc1 - utc2) / _MS_PER_DAY);
    }

    const accountAge = useMemo(() => {
        if (!currentUser?.createdAt) return 0;
        const createdAtDate = (currentUser.createdAt as Timestamp).toDate();
        return differenceInDays(new Date(), createdAtDate);
    }, [currentUser]);

    const hasActiveSubscription = useMemo(() => {
        const planId = currentUser?.subscription?.planId;
        return !!(planId && planId !== 'plan-free');
    }, [currentUser]);
    
    const isEligible = accountAge >= 7 && hasActiveSubscription;
    const isLoading = loading || isLoadingCurrentUser;

    const handleAdvancedSave = (requirements: string) => {
        const currentDescription = form.getValues("projectDescription");
        const baseDescription = currentDescription.split("\n\nAdvanced Requirements:")[0];
        form.setValue("projectDescription", baseDescription + requirements, { shouldValidate: true });
    };

    const handleNicheSave = (niches: string[]) => {
        setSelectedNiches(niches);
        const currentSkills = form.getValues("requiredSkills").split(',').map(s => s.trim()).filter(s => s && !Object.values(freelanceNiches).flat().includes(s));
        const newSkills = [...currentSkills, ...niches].join(', ');
        form.setValue("requiredSkills", newSkills, { shouldValidate: true });
    };

    const onSubmit: SubmitHandler<ClientFormValues> = async (data) => {
        setLoading(true);
        setError(null);
        setResult(null);

        if (!firestore) {
            setError("Firestore is not available.");
            setLoading(false);
            return;
        }

        try {
            // Stage 1: Fetch candidates based on niches
            const skillsAndNiches = data.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillsAndNiches.length === 0) {
                setError("Please provide at least one required skill or niche.");
                setLoading(false);
                return;
            }

            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('skills', 'array-contains-any', skillsAndNiches.slice(0, 10)), limit(50));
            const querySnapshot = await getDocs(q);
            const candidates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
            setCandidateUsers(candidates); // Store for later use

            if (candidates.length === 0) {
                setResult({ match: null });
                setLoading(false);
                return;
            }

            // Stage 2: Build corpus and vectors for the pre-filtered candidates
            const corpus = candidates.map(u => `${u.bio || ''} ${u.skills?.join(' ') || ''}`);
            const briefText = `${data.projectTitle} ${data.projectDescription} ${data.requiredSkills}`;
            const combinedCorpus = [briefText, ...corpus];
            const vocabulary = buildVocabulary(combinedCorpus);
            
            const clientBriefVector = createTfIdfVector(briefText, combinedCorpus, vocabulary);
            const freelancerProfilesWithVectors = candidates.map(u => ({
                profile: u,
                vector: createTfIdfVector(`${u.bio || ''} ${u.skills?.join(' ') || ''}`, combinedCorpus, vocabulary),
            }));

            // Stage 3: Run the matching algorithm
            const input: SkillSyncNetInput = {
                context: "client_seeking_freelancer",
                clientBrief: data,
                clientBriefVector: clientBriefVector,
                freelancerProfilesWithVectors: freelancerProfilesWithVectors,
            };
            const output = await skillSyncNet(input);
            setResult(output);
        } catch (e) {
            setError("Failed to find a match. Please try again later.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCategorySelect = (category: string, isChecked: boolean) => {
        const subNiches = freelanceNiches[category as FreelanceNicheCategory];
        let newNiches: string[];
        if (isChecked) {
            // Add all sub-niches from the category
            newNiches = [...new Set([...selectedNiches, ...subNiches])];
        } else {
            // Remove all sub-niches from the category
            newNiches = selectedNiches.filter(n => !subNiches.includes(n));
        }
        setSelectedNiches(newNiches);
        updateSkillsFromNiches(newNiches);
    };
    
    const handleSubNicheSelect = (subNiche: string, isChecked: boolean) => {
        let newNiches: string[];
        if(isChecked) {
            newNiches = [...new Set([...selectedNiches, subNiche])];
        } else {
            newNiches = selectedNiches.filter(n => n !== subNiche);
        }
        setSelectedNiches(newNiches);
        updateSkillsFromNiches(newNiches);
    };

    const updateSkillsFromNiches = (niches: string[]) => {
        const currentSkills = form.getValues("requiredSkills").split(',').map(s => s.trim()).filter(s => s && !Object.values(freelanceNiches).flat().includes(s));
        const newSkills = [...new Set([...currentSkills, ...niches])].join(', ');
        form.setValue("requiredSkills", newSkills, { shouldValidate: true });
    };

    return (
        <>
        <GuidelinesDialog open={isGuidelinesOpen} onOpenChange={setIsGuidelinesOpen} />
        <ScrollArea className="h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start p-1">
                <div>
                    {!isEligible && !isLoading ? (
                        <BusinessEligibilityCard accountAge={accountAge} hasSubscription={hasActiveSubscription} isLoading={isLoading} />
                    ) : (
                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="projectTitle">Project Title</Label>
                                <Input id="projectTitle" {...form.register("projectTitle")} placeholder="e.g., Redesign of E-commerce Checkout Flow" />
                                {form.formState.errors.projectTitle && <p className="text-sm text-destructive">{form.formState.errors.projectTitle.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="projectDescription">Project Description</Label>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="link" className="text-muted-foreground hover:text-primary"><SlidersHorizontal className="mr-2 h-4 w-4" />Add Requirements</Button>
                                        </DialogTrigger>
                                        <AdvancedRequirementsDialog onSave={handleAdvancedSave} />
                                    </Dialog>
                                </div>
                                <Textarea id="projectDescription" {...form.register("projectDescription")} placeholder="Describe the project goals, deliverables, and any specific requirements..." className="min-h-32" />
                                {form.formState.errors.projectDescription && <p className="text-sm text-destructive">{form.formState.errors.projectDescription.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="requiredSkills">Required Skills & Niches</Label>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="link" className="text-muted-foreground hover:text-primary">
                                                <Settings2 className="mr-2 h-4 w-4" />
                                                Choose Niches
                                            </Button>
                                        </DialogTrigger>
                                        <NichePickerDialog onSave={handleNicheSave} initialNiches={selectedNiches} />
                                    </Dialog>
                                </div>
                                <Input id="requiredSkills" {...form.register("requiredSkills")} placeholder="e.g., Figma, UX Research, Prototyping" />
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {selectedNiches.map(niche => (
                                        <Badge key={niche} variant="secondary">{niche}</Badge>
                                    ))}
                                </div>
                                 {form.formState.errors.requiredSkills && <p className="text-sm text-destructive">{form.formState.errors.requiredSkills.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="budget">Budget ($)</Label>
                                    <Input id="budget" type="number" {...form.register("budget")} placeholder="e.g., 5000" />
                                    {form.formState.errors.budget && <p className="text-sm text-destructive">{form.formState.errors.budget.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timeline">Timeline</Label>
                                    <Controller
                                        name="timeline"
                                        control={form.control}
                                        render={({ field }) => (
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a timeline" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="<1 week">&lt; 1 Week</SelectItem>
                                                    <SelectItem value="1-2 weeks">1-2 Weeks</SelectItem>
                                                    <SelectItem value="2-4 weeks">2-4 Weeks</SelectItem>
                                                    <SelectItem value="1-2 months">1-2 Months</SelectItem>
                                                    <SelectItem value=">2 months">&gt; 2 Months</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.timeline && <p className="text-sm text-destructive">{form.formState.errors.timeline.message}</p>}
                                </div>
                            </div>
                             <Button type="submit" className="w-full bg-primary text-primary-foreground" size="lg" disabled={isLoading}>
                                <Zap className="mr-2 h-5 w-5" />
                                {loading ? "Finding Your Perfect Match..." : "Find My Freelancer"}
                            </Button>
                        </form>
                    )}
                </div>

                <div className="space-y-6">
                    {(isLoading) && <MatchSkeleton isClientView={true} />}
                    {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                    {result && result.match && result.match.freelancer && <FreelancerMatchCard freelancer={result.match.freelancer} freelancerUser={candidateUsers?.find(u => u.name === result.match?.freelancer?.name)} />}
                    {!isLoading && !result && !error && (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 text-center min-h-[500px] p-8">
                            <Barcode className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-normal">Your matched freelancer will appear here.</h3>
                            <p className="text-muted-foreground">Fill out the project details to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </ScrollArea>
        </>
    );
}

function ProfileStrengthCard({ profileCompletion }: { profileCompletion: Record<string, boolean> & { progress: number } }) {
    const CompletionItem = ({ label, isComplete }: { label: string; isComplete: boolean }) => (
        <div className="flex items-center gap-3 text-sm">
            {isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
                <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
            <span className={cn(isComplete ? "text-foreground" : "text-muted-foreground")}>
                {label}
            </span>
        </div>
    );

    return (
        <Card className="bg-muted/50 border-dashed">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Profile Strength</CardTitle>
                    <span className="font-bold text-primary">{profileCompletion.progress}%</span>
                </div>
                <Progress value={profileCompletion.progress} className="mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
                <CompletionItem label="Add a detailed bio" isComplete={profileCompletion.hasBio} />
                <CompletionItem label="Add a professional title" isComplete={profileCompletion.hasJobTitle} />
                <CompletionItem label="List at least 7 skills" isComplete={profileCompletion.hasEnoughSkills} />
                <CompletionItem label="Add at least one work experience" isComplete={profileCompletion.hasExperience} />
                <CompletionItem label="Complete your Skill Sync profile details" isComplete={profileCompletion.hasSkillSyncInfo} />
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/admin">Complete Your Profile</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

function EligibilityCard({ accountAge, loginActivity, isEligible, isLoading }: { accountAge: number, loginActivity: number, isEligible: boolean, isLoading: boolean }) {
    const accountAgeReq = 30;
    const loginActivityReq = 80;
    const accountAgeProgress = Math.min(100, (accountAge / accountAgeReq) * 100);

    return (
        <Card className="border-dashed">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    Automatch Eligibility
                </CardTitle>
                <CardDescription>
                    To maintain a high-quality pool of candidates for clients, our automatch feature requires active and established profiles.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {isLoading ? (
                     <>
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </>
                 ) : (
                    <>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>Account Age</span>
                                </div>
                                <span className={cn(accountAge >= accountAgeReq && "text-green-500")}>{accountAge} / {accountAgeReq} days</span>
                            </div>
                            <Progress value={accountAgeProgress} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <PercentCircle className="h-4 w-4" />
                                    <span>Login Activity (Last 30d)</span>
                                </div>
                                <span className={cn(loginActivity >= loginActivityReq && "text-green-500")}>{Math.round(loginActivity)}% / {loginActivityReq}%</span>
                            </div>
                            <Progress value={loginActivity} />
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    {isEligible 
                        ? "You are eligible for automatching!" 
                        : "Keep using Sentrybase to become eligible for automatic project matching."
                    }
                </p>
            </CardFooter>
        </Card>
    );
}

function FreelancerView() {
    const [result, setResult] = useState<SkillSyncNetOutput | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
    const firestore = useFirestore();
    const { user: authUser } = useAuthUser();

    useEffect(() => {
        const hasSeenGuidelines = localStorage.getItem('seenFreelancerGuidelines');
        if (!hasSeenGuidelines) {
            setIsGuidelinesOpen(true);
            localStorage.setItem('seenFreelancerGuidelines', 'true');
        }
    }, []);

    const userQuery = useMemo(() => {
        if(!firestore || !authUser) return null;
        return doc(firestore, 'users', authUser.uid);
    }, [firestore, authUser]);
    const { data: currentUser, isLoading: isLoadingUsers } = useDoc<UserType>(userQuery);

    const freelancerProfileQuery = useMemo(() => {
        if (!currentUser) return null;
        return doc(firestore, 'users', currentUser.id, 'freelancerProfile', 'main');
    }, [currentUser, firestore]);
    const { data: freelancerProfile, isLoading: isLoadingFreelancerProfile } = useDoc<FreelancerProfile>(freelancerProfileQuery);

    const profileCompletion = useMemo(() => {
        if (!currentUser || !freelancerProfile) return { progress: 0 };
        const checks = {
            hasBio: !!currentUser.bio,
            hasJobTitle: !!currentUser.jobTitle,
            hasEnoughSkills: (currentUser.skills?.length || 0) >= 7,
            hasExperience: (currentUser.experiences?.length || 0) > 0,
            hasSkillSyncInfo: !!(freelancerProfile.title && freelancerProfile.availability),
        };
        const completedCount = Object.values(checks).filter(Boolean).length;
        const totalChecks = Object.keys(checks).length;
        return {
            ...checks,
            progress: Math.round((completedCount / totalChecks) * 100),
        };
    }, [currentUser, freelancerProfile]);
    
    const isProfileComplete = profileCompletion.progress === 100;
    
    const differenceInDays = (dateLeft: Date, dateRight: Date): number => {
      const _MS_PER_DAY = 1000 * 60 * 60 * 24;
      const utc1 = Date.UTC(dateLeft.getFullYear(), dateLeft.getMonth(), dateLeft.getDate());
      const utc2 = Date.UTC(dateRight.getFullYear(), dateRight.getMonth(), dateRight.getDate());
      return Math.floor((utc1 - utc2) / _MS_PER_DAY);
    }

    const accountAge = useMemo(() => {
        if (!currentUser?.createdAt) return 0;
        const createdAtDate = (currentUser.createdAt as Timestamp).toDate();
        return differenceInDays(new Date(), createdAtDate);
    }, [currentUser]);

    // Placeholder for login activity calculation
    const loginActivity = useMemo(() => {
        if (!currentUser || !currentUser.loginHistory || accountAge <= 0) return 0;
        const relevantLogins = currentUser.loginHistory.filter(login => 
            differenceInDays(new Date(), (login as Timestamp).toDate()) <= 30
        );
        const uniqueLoginDays = new Set(relevantLogins.map(login => (login as Timestamp).toDate().toDateString())).size;
        return (uniqueLoginDays / Math.min(accountAge, 30)) * 100;
    }, [currentUser, accountAge]);

    const isEligibleForAutomatch = accountAge >= 30 && loginActivity >= 80;
    const isEligible = isProfileComplete && isEligibleForAutomatch;

    const handleFindProject = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        if (!currentUser) {
            setError("Could not find your profile for automatch. Please complete your profile.");
            setLoading(false);
            return;
        }

        try {
            const freelancerProfile = {
                name: currentUser.name,
                headline: currentUser.headline,
                bio: currentUser.bio,
                skills: currentUser.skills,
                experience_years: currentUser.experience_years,
                email: currentUser.email,
            };

            const input: SkillSyncNetInput = {
                context: "freelancer_seeking_project",
                freelancerProfile: freelancerProfile,
                clientBriefVector: new Map(), 
                freelancerProfilesWithVectors: [],
            };
            const output = await skillSyncNet(input);
            setResult(output);
        } catch (e) {
            setError("Failed to find a project. Please try again later.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const isLoadingData = isLoadingUsers || isLoadingFreelancerProfile;

    return (
        <>
        <FreelancerGuidelinesDialog open={isGuidelinesOpen} onOpenChange={setIsGuidelinesOpen} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Instant Project Matching</CardTitle>
                        <CardDescription>
                            Our algorithm analyzes your profile to find the perfect project for you, on demand.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         {!isProfileComplete && !isLoadingData ? (
                           <ProfileStrengthCard profileCompletion={profileCompletion as any} />
                        ) : null}
                    </CardContent>
                    <CardFooter>
                         {isProfileComplete ? (
                             <Button size="lg" className="w-full" onClick={handleFindProject} disabled={loading || isLoadingData || !isEligible}>
                                <Zap className="mr-2 h-5 w-5" />
                                {loading ? "Scanning for Projects..." : "Find Instant Match"}
                            </Button>
                         ) : (
                             <Button asChild className="w-full" disabled={isLoadingData}>
                                <Link href="/admin">Complete Your Profile</Link>
                            </Button>
                         )}
                    </CardFooter>
                </Card>

                {isProfileComplete && (
                    <EligibilityCard
                        accountAge={accountAge}
                        loginActivity={loginActivity}
                        isEligible={isEligibleForAutomatch}
                        isLoading={isLoadingData}
                    />
                )}
            </div>
            <div className="space-y-6">
                {(loading || isLoadingData) && <MatchSkeleton isClientView={false} />}
                {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                {result && result.match && result.match.project && <ProjectMatchCard project={result.match.project} />}
                {result && !result.match && !loading && !error && (
                    <div className="flex flex-col items-center justify-content-center rounded-lg border-2 border-dashed border-muted-foreground/20 text-center min-h-[500px] p-8">
                        <Barcode className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-normal">No Projects Found</h3>
                        <p className="text-muted-foreground">The algorithm couldn't find a suitable match at this time. Try again later as new projects are posted.</p>
                    </div>
                )}
                 {!loading && !isLoadingData && !result && !error && (
                    <div className="flex flex-col items-center justify-content-center rounded-lg border-2 border-dashed border-muted-foreground/20 text-center min-h-[500px] p-8">
                        <Barcode className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-normal">Your matched project will appear here.</h3>
                        <p className="text-muted-foreground">Click the "Find Instant Match" button to start.</p>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}

function MatchSkeleton({ isClientView }: { isClientView: boolean }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    {isClientView && <Skeleton className="h-16 w-16" />}
                     <div className="flex-1 space-y-2">
                        {isClientView ? (
                             <Skeleton className="h-6 w-3/4" />
                        ) : (
                            <Skeleton className="h-6 w-full" />
                        )}
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                 <div className="pt-4 space-y-2">
                    <Skeleton className="h-5 w-1/4" />
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
}

function MatchCardActions({ userId }: { userId: string }) {
    const { toast } = useToast();
    const { user: authUser } = useAuthUser();
    const firestore = useFirestore();

    const handleAddColleague = async () => {
        if (!authUser || !firestore) {
            toast({ variant: 'destructive', title: "You must be logged in." });
            return;
        }
        const colleagueRef = doc(firestore, 'users', authUser.uid, 'colleagues', userId);
        await setDocumentNonBlocking(colleagueRef, { addedAt: new Date() });
        toast({
            title: "Colleague Added",
            description: "They have been added to your 'My Colleagues' list in Cohorts.",
        });
    };
    
    const handleLike = () => {
        toast({ title: "Liked!", description: "This user has been added to your liked list (not implemented)." });
    };

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleLike}><Heart className="h-4 w-4" /></Button>
            <Button className="w-full" onClick={handleAddColleague}><UserPlus className="mr-2 h-4 w-4"/> Add Colleague</Button>
        </div>
    );
}

function FreelancerMatchCard({ freelancer, freelancerUser }: { freelancer: NonNullable<NonNullable<SkillSyncNetOutput['match']>['freelancer']>, freelancerUser?: UserType }) {
     return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-4 pt-4">
                    <div className="flex h-16 w-16 items-center justify-center">
                        <UserIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-2xl">{freelancer.name}</CardTitle>
                        <p className="text-muted-foreground">{freelancer.headline}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold mb-2">Match Assessment</h4>
                    <Progress value={freelancer.matchConfidence} className="h-1 mb-2" />
                    <p className="text-sm text-muted-foreground">{freelancer.matchReasoning}</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Vetted Skills</h4>
                    <div className="flex flex-wrap gap-2">
                        {freelancer.skills.map(skill => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 {freelancerUser && <MatchCardActions userId={freelancerUser.id} />}
            </CardFooter>
        </Card>
    );
}

function ProjectMatchCard({ project }: { project: NonNullable<NonNullable<SkillSyncNetOutput['match']>['project']>}) {
    const projectData = {
        clientName: project.clientName,
        projectTitle: project.title,
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="pt-4">
                    <CardTitle className="text-xl font-semibold">{project.title}</CardTitle>
                    <CardDescription>Posted by: {project.clientName}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold mb-2">Match Assessment</h4>
                    <Progress value={project.matchConfidence} className="h-1 mb-2" />
                    <p className="text-sm text-muted-foreground">{project.matchReasoning}</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Project Details</h4>
                    <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Budget</p>
                                <p>${project.budget.toLocaleString()}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Timeline</p>
                                <p>{project.timeline}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                        {project.requiredSkills.map(skill => (
                            <Badge key={skill}>{skill}</Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button asChild className="w-full" size="lg">
                    <Link href={`/`}>Accept Project Instantly</Link>
                </Button>
                <div className="w-full">
                    <MatchCardActions userId={"temp-client-id"} />
                </div>
            </CardFooter>
        </Card>
    );
}

export default function SkillSyncNetPage() {
  return (
    <ClientOnly>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
           <Tabs defaultValue="client" className="mx-auto w-full">
            <header className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-light tracking-tight sm:text-4xl">Skill Sync Net</h1>
                    <p className="mt-1 text-lg text-muted-foreground font-light">The right fit, found faster.</p>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="font-mono flex items-center gap-2 text-green-400 text-xs">
                        <span>SYS_STATUS:</span>
                        <span className="animate-pulse">ONLINE</span>
                    </div>
                    <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 border-b border-border">
                        <TabsTrigger value="client" className="gap-2 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary">
                            <Kanban className="h-5 w-5" /> Businesses
                        </TabsTrigger>
                        <TabsTrigger value="freelancer" className="gap-2 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary">
                            <UserIcon className="h-5 w-5" /> Freelancers
                        </TabsTrigger>
                    </TabsList>
                 </div>
            </header>
            <TabsContent value="client" className="mt-8">
              <ClientView />
            </TabsContent>
            <TabsContent value="freelancer" className="mt-8">
              <FreelancerView />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ClientOnly>
  );
}
