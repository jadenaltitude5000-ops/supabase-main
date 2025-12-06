
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Briefcase, LogOut, Globe, Loader2, UploadCloud, FileText, Trash2, LayoutGrid, List, Maximize, Share2, PlusCircle, User as UserIcon, Award, Building, DollarSign, BrainCircuit, Users as UsersIcon, Settings2, SlidersHorizontal, Eye, Copy, GraduationCap, School, ShieldCheck, Bot, ChevronDown, Link as LinkIcon, Palette, Save, Feather, Phone, Bell, Cookie } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage, Language } from '@/context/language-context';
import { translations } from '@/lib/translations';
import { useUser, useSupabase } from '@/lib/supabase/provider';
import type { AppUser, PortfolioItem, DocumentItem, Experience, Certification, FreelancerProfile, BusinessProfile, Course, InstructorApplication, Database } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaUploader } from '@/components/ui/media-uploader';
import { FileUploader } from '@/components/ui/file-uploader';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClientOnly } from '@/components/layout/client-only';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { freelanceNiches } from '@/lib/freelance-niches';
import Link from 'next/link';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { ImageEditor } from '@/components/ui/image-editor';
import { CookieSettingsDialog, type ConsentSettings } from '@/components/layout/cookie-consent-banner';
import Cookies from 'js-cookie';


const countries = [
    "United States", "China", "India", "Indonesia", "Pakistan", "Brazil", "Nigeria", "Bangladesh", "Russia", "Mexico",
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
    "Kiribati", "Micronesia", "Grenada", "St. Vincent & Grenadines", "Tonga", "Seychelles",
    "Antigua and Barbuda", "Andorra", "Dominica", "Marshall Islands", "Saint Kitts and Nevis", "Monaco", "Liechtenstein",
    "San Marino", "Palau", "Tuvalu", "Nauru", "Vatican City"
];

type PortfolioLayout = 'grid' | 'list';

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
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>Choose Your Specializations</DialogTitle>
                <DialogDescription>Select the niches that best describe your expertise.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto pr-4">
                 <Accordion type="multiple" className="w-full">
                     {Object.entries(freelanceNiches).map(([category, subNiches]) => (
                        <AccordionItem key={category} value={category}>
                            <AccordionTrigger className="text-base font-semibold">{category}</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 pl-2">
                                    {subNiches.map(subNiche => (
                                        <div key={subNiche} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${category}-${subNiche}`}
                                                checked={selected[category]?.includes(subNiche) || false}
                                                onCheckedChange={() => handleSelect(category, subNiche)}
                                            />
                                            <label htmlFor={`${category}-${subNiche}`} className="text-sm font-medium leading-none">
                                                {subNiche}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
             <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <DialogClose asChild ><Button type="button" onClick={handleSaveChanges}>Save Specializations</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

const traitCategories = {
    'Experience Level & Seniority': {
      Seniority: ['Entry-Level/Junior', 'Mid-Level', 'Senior', 'Expert/Lead'],
      'Key Attributes': ['Strategic Thinker', 'Technical Specialist', 'Creative Visionary', 'Project Manager', 'Data-driven'],
    },
    'Collaboration & Communication': {
      'Working Style': ['Independent/Autonomous', 'Highly Collaborative', 'Agile/Scrum', 'Asynchronous'],
      Communication: ['Daily Check-ins', 'Weekly Syncs', 'Prefers Written Updates', 'Client-facing'],
    },
    'Soft Skills & Professionalism': {
      'Pace & Urgency': ['Fast-paced, deadline-driven', 'Steady and planned', 'Flexible and iterative'],
      'Attention to Detail': ['Pixel-perfect precision', 'High-level concepts', 'Balanced approach'],
      'Problem Solving': ['Requires strong analytical skills', 'Needs creative problem-solving', 'Prefers structured guidance'],
    }
  };

type TraitCategory = keyof typeof traitCategories;
type SelectedTraits = Record<TraitCategory, Record<string, string[]>>;

function AdvancedProfileDialog({ onSave, initialTraits }: { onSave: (traits: string[]) => void, initialTraits: string[] }) {
    const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>(() => {
        const initialState: SelectedTraits = {} as SelectedTraits;
        initialTraits.forEach(trait => {
             for (const mainCategory in traitCategories) {
                const subCategories = traitCategories[mainCategory as TraitCategory];
                for (const subCategory in subCategories) {
                    if ((subCategories as any)[subCategory].includes(trait)) {
                         if (!initialState[mainCategory as TraitCategory]) {
                            (initialState[mainCategory as TraitCategory] as any) = {};
                        }
                        if (!(initialState[mainCategory as TraitCategory] as any)[subCategory]) {
                           (initialState[mainCategory as TraitCategory] as any)[subCategory] = [];
                        }
                        (initialState[mainCategory as TraitCategory] as any)[subCategory].push(trait);
                    }
                }
            }
        });
        return initialState;
    });

    const handleSelect = (mainCategory: TraitCategory, subCategory: string, trait: string) => {
        setSelectedTraits(prev => {
            const newSelections = JSON.parse(JSON.stringify(prev));
            if (!newSelections[mainCategory]) newSelections[mainCategory] = {};
            if (!newSelections[mainCategory][subCategory]) newSelections[mainCategory][subCategory] = [];
            
            const currentTraits: string[] = newSelections[mainCategory][subCategory];
            const isSelected = currentTraits.includes(trait);
            if (isSelected) {
                newSelections[mainCategory][subCategory] = currentTraits.filter(t => t !== trait);
            } else {
                newSelections[mainCategory][subCategory].push(trait);
            }
            return newSelections;
        });
    };

    const handleSaveChanges = () => {
        const allSelected = Object.values(selectedTraits).flatMap(sub => Object.values(sub)).flat();
        onSave(allSelected);
    };

    return (
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>Advanced Profile Builder</DialogTitle>
                <DialogDescription>Define your work style, seniority, and soft skills to improve match quality.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto pr-4">
                 <Accordion type="multiple" className="w-full">
                     {Object.entries(traitCategories).map(([mainCategory, subCategories]) => (
                        <AccordionItem key={mainCategory} value={mainCategory}>
                            <AccordionTrigger className="text-lg font-semibold">{mainCategory}</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pl-2">
                                {Object.entries(subCategories).map(([subCategory, traits]) => (
                                    <div key={subCategory}>
                                        <h5 className="font-medium mb-3">{subCategory}</h5>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-3">
                                            {Array.isArray(traits) && traits.map(trait => (
                                                <div key={trait} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${mainCategory}-${subCategory}-${trait}`}
                                                        checked={(selectedTraits[mainCategory as TraitCategory]?.[subCategory] || []).includes(trait)}
                                                        onCheckedChange={() => handleSelect(mainCategory as TraitCategory, subCategory, trait)}
                                                    />
                                                    <label htmlFor={`${mainCategory}-${subCategory}-${trait}`} className="text-sm font-medium leading-none">
                                                        {trait}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
             <DialogFooter>
                <DialogClose asChild ><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <DialogClose asChild ><Button type="button" onClick={handleSaveChanges}>Save Details</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}


function PortfolioItemDialog({ item }: { item: PortfolioItem }) {
  const { toggleFullscreen } = useFullscreen();

  return (
    <DialogContent className="max-w-5xl p-0">
      <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr]">
        <div className="relative aspect-video bg-muted group">
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className={cn("object-contain", {
              "object-cover": item.objectFit === 'cover'
            })}
            onContextMenu={(e) => e.preventDefault()}
          />
           <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" onClick={toggleFullscreen}>
                <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">{item.title}</DialogTitle>
          </DialogHeader>
          <p className="mt-4 flex-grow text-muted-foreground">{item.description}</p>
          <div className="mt-6">
            <h4 className="mb-2 font-semibold">Technologies & Skills</h4>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="mt-6 flex gap-2 border-t pt-4">
            <Button className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Share Project
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}


function PortfolioCard({ item, layout }: { item: PortfolioItem; layout: PortfolioLayout }) {
  if (layout === 'list') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md cursor-pointer">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              <Image src={item.image_url} alt={item.title} fill className={cn("object-contain", { "object-cover": item.objectFit === 'cover' })} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
            </div>
            <Button variant="ghost" size="icon">
              <Maximize className="h-4 w-4" />
            </Button>
          </Card>
        </DialogTrigger>
        <PortfolioItemDialog item={item} />
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg">
          <Image
            src={item.image_url}
            alt={item.title}
            width={500}
            height={375} // Using a consistent aspect ratio (4:3) instead of random height
            className={cn("h-auto w-full", item.objectFit === 'cover' ? "object-cover aspect-[4/3]" : "object-contain")}
            onContextMenu={(e) => e.preventDefault()}
          />
          <div className="absolute inset-0 cursor-pointer bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-full flex-col justify-end p-4 text-white">
              <h3 className="font-bold">{item.title}</h3>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2 w-fit"
              >
                <Maximize className="mr-2 h-4 w-4" />
                Expand
              </Button>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <PortfolioItemDialog item={item} />
    </Dialog>
  );
}

function AddPortfolioItemDialog({ onSave }: { onSave: (item: Omit<PortfolioItem, 'id' | 'author_id' | 'author' | 'author_avatar' | 'author_headline' | 'media_type'>) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('contain');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title || !description || !tags || !imageUrl) return;
    setIsSaving(true);
    const newItem = {
      title,
      description,
      image_url: imageUrl,
      tags: tags.split(',').map(tag => tag.trim()),
      objectFit,
    };

    onSave(newItem);
    setIsSaving(false);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Portfolio Project</DialogTitle>
        <DialogDescription>Showcase your work by adding a new project to your profile.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <MediaUploader onUpload={(url) => setImageUrl(url)} />
        {imageUrl && (
            <div className="p-2 border rounded-md">
                <p className="text-sm font-medium mb-2">Image Preview:</p>
                <Image src={imageUrl} alt="Preview" width={100} height={100} className="rounded-md object-cover"/>
            </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="item-title">Project Title</Label>
          <Input id="item-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., E-commerce Website Redesign" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="item-description">Description</Label>
          <Textarea id="item-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of the project..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="item-tags">Tags / Technologies</Label>
          <Input id="item-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., React, Next.js, Figma" />
          <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
        </div>
         <div className="space-y-3">
          <Label>Image Display Style</Label>
          <RadioGroup defaultValue="contain" value={objectFit} onValueChange={(value: 'contain' | 'cover') => setObjectFit(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="contain" id="fit-contain" />
              <Label htmlFor="fit-contain">Auto-fit (Contain)</Label>
            </div>
             <p className="text-xs text-muted-foreground pl-6">Ensures the entire image is visible. Good for detailed shots.</p>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cover" id="fit-cover" />
              <Label htmlFor="fit-cover">Cover</Label>
            </div>
             <p className="text-xs text-muted-foreground pl-6">Fills the entire frame, cropping if necessary. Good for hero images.</p>
          </RadioGroup>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild ><Button variant="secondary">Cancel</Button></DialogClose>
        <DialogClose asChild ><Button onClick={handleSave} disabled={isSaving || !imageUrl}>{isSaving ? 'Saving...' : 'Add Project'}</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

function AddExperienceDialog({ onSave }: { onSave: (item: Experience) => void }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!title || !company || !startDate) return;
    setIsSaving(true);
    const newItem: Experience = { title, company, start_date: startDate, end_date: endDate, description, id: '', user_id: '' };
    // Simulate save
    setTimeout(() => {
        onSave(newItem);
        setIsSaving(false);
    }, 1000);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Work Experience</DialogTitle>
        <DialogDescription>Detail your professional journey.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="exp-title">Job Title</Label>
          <Input id="exp-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Senior Product Designer" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exp-company">Company</Label>
          <Input id="exp-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Google" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exp-start-date">Start Date</Label>
              <Input id="exp-start-date" type="month" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="exp-end-date">End Date</Label>
              <Input id="exp-end-date" type="month" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="Present" />
            </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="exp-description">Description</Label>
          <Textarea id="exp-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your role and accomplishments..." />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild ><Button variant="secondary">Cancel</Button></DialogClose>
        <DialogClose asChild ><Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Add Experience'}</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

function AddCertificationDialog({ onSave }: { onSave: (item: Certification) => void }) {
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [date, setDate] = useState('');
  const [url, setUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!name || !org || !date) return;
    setIsSaving(true);
    const newItem: Certification = { name, issuing_organization: org, date, credential_url: url, id: '', user_id: '' };
    setTimeout(() => {
        onSave(newItem);
        setIsSaving(false);
    }, 1000);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Certification</DialogTitle>
        <DialogDescription>Showcase your credentials and awards.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="cert-name">Certification Name</Label>
          <Input id="cert-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Google UX Design Certificate" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cert-org">Issuing Organization</Label>
          <Input id="cert-org" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="e.g., Coursera" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="cert-date">Date Issued</Label>
            <Input id="cert-date" type="month" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cert-url">Credential URL (Optional)</Label>
          <Input id="cert-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://coursera.org/verify/..." />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild ><Button variant="secondary">Cancel</Button></DialogClose>
        <DialogClose asChild ><Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Add Certification'}</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

function CreateCourseDialog({ onSave }: { onSave: (course: Partial<Course>) => void }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
    const [tags, setTags] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    const handleSave = () => {
        if (!title || !description || !price || !tags || !thumbnailUrl) return;
        const newCourse: Partial<Course> = {
            title,
            description,
            price: parseFloat(price),
            level,
            tags: tags.split(',').map(tag => tag.trim()),
            thumbnail_url: thumbnailUrl,
        };
        onSave(newCourse);
    };

    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>Fill out the details for your new course.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="space-y-2">
                    <Label>Course Thumbnail</Label>
                    <MediaUploader onUpload={setThumbnailUrl} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="course-title">Course Title</Label>
                    <Input id="course-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Introduction to React" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="course-description">Course Description</Label>
                    <Textarea id="course-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What will students learn in this course?" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="course-price">Price ($)</Label>
                        <Input id="course-price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 99.99" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="course-level">Skill Level</Label>
                        <Select value={level} onValueChange={(v) => setLevel(v as any)}>
                            <SelectTrigger id="course-level">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="course-tags">Tags</Label>
                    <Input id="course-tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., react, javascript, webdev" />
                    <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild ><Button variant="secondary">Cancel</Button></DialogClose>
                <DialogClose asChild ><Button onClick={handleSave} disabled={!thumbnailUrl}>Create Course</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

function AdminPanel({ applications, onUpdateApplication }: { applications: InstructorApplication[], onUpdateApplication: (appId: string, userId: string, status: 'approved' | 'rejected') => void }) {

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Instructor Applications</CardTitle>
                    <CardDescription>Review and approve pending applications to become an instructor.</CardDescription>
                </CardHeader>
                <CardContent>
                     {applications.length > 0 ? (
                        <div className="space-y-4">
                            {applications.map(app => (
                                <Card key={app.id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{app.user_name}</CardTitle>
                                        <CardDescription>{app.user_email}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                         <div>
                                            <h4 className="font-semibold text-sm">Expertise</h4>
                                            <p className="text-muted-foreground text-sm">{app.expertise}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm">Motivation</h4>
                                            <p className="text-muted-foreground text-sm">{app.motivation}</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex gap-4">
                                        <Button size="sm" onClick={() => onUpdateApplication(app.id, app.user_id, 'approved')}>Approve</Button>
                                        <Button size="sm" variant="destructive" onClick={() => onUpdateApplication(app.id, app.user_id, 'rejected')}>Reject</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">No pending applications.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function AdminPageInternal() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const supabase = useSupabase();

  const { user: authUser, isUserLoading } = useUser();
  
  const [user, setUser] = useState<AppUser | null>(null);
  const [isUserDocLoading, setIsUserDocLoading] = useState(true);

  const [hasDataBeenSet, setHasDataBeenSet] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);

  // Notification state
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);


  // General profile state
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [motto, setMotto] = useState('');
  const [country, setCountry] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [interests, setInterests] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [externalUrlName, setExternalUrlName] = useState('');
  const [businessCardBackground, setBusinessCardBackground] = useState('');
  const [businessCardStealth, setBusinessCardStealth] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Experience/Portfolio state
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [portfolioLayout, setPortfolioLayout] = useState<PortfolioLayout>('grid');

  // Matching Profile state
  const [profileType, setProfileType] = useState<'freelancer' | 'business'>('freelancer');
  const [freelancerTitle, setFreelancerTitle] = useState('');
  const [freelancerSkills, setFreelancerSkills] = useState('');
  const [specializedNiches, setSpecializedNiches] = useState<string[]>([]);
  const [advancedTraits, setAdvancedTraits] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState<number | string>('');
  const [availability, setAvailability] = useState<FreelancerProfile['availability'] | ''>('');
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState<BusinessProfile['company_size'] | ''>('');
  const [hiringGoals, setHiringGoals] = useState('');
  const [industry, setIndustry] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Instructor State
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const isInstructor = user?.is_instructor;
  const isAdmin = user?.is_admin;

  // Admin State
  const [applications, setApplications] = useState<InstructorApplication[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);


  useEffect(() => {
    if (!authUser?.id || !supabase) {
        setIsUserDocLoading(false);
        return;
    };
    
    setIsUserDocLoading(true);
    const fetchUser = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*, freelancer_profiles(*), business_profiles(*)')
            .eq('id', authUser.id)
            .single<AppUser>();

        if (error) {
            console.error("Error fetching user profile", error);
            setIsUserDocLoading(false);
            return;
        }

        if (data) {
            const freelancerProfile = Array.isArray(data.freelancer_profiles) ? data.freelancer_profiles[0] : data.freelancer_profiles;
            const businessProfile = Array.isArray(data.business_profiles) ? data.business_profiles[0] : data.business_profiles;

            const userData: AppUser = { ...data, freelancer_profiles: freelancerProfile, business_profiles: businessProfile };
            setUser(userData);
        }
        setIsUserDocLoading(false);
    };

    fetchUser();
  }, [supabase, authUser]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const fetchUserCourses = async () => {
        if (!authUser || !isInstructor || !supabase) {
            setIsLoadingCourses(false);
            return;
        };
        setIsLoadingCourses(true);
        const { data, error } = await supabase.from('courses').select('*').eq('instructor_id', authUser.id);
        if (data) setUserCourses(data);
        setIsLoadingCourses(false);
    };
    fetchUserCourses();
  }, [supabase, authUser, isInstructor]);


  useEffect(() => {
      const fetchApplications = async () => {
        if (!isAdmin || !supabase) {
            setIsLoadingApplications(false);
            return;
        };
        setIsLoadingApplications(true);
        const { data, error } = await supabase.from('instructor_applications').select('*').eq('status', 'pending');
        if(data) setApplications(data as any);
        setIsLoadingApplications(false);
    }
    fetchApplications();
  }, [supabase, isAdmin]);

  useEffect(() => {
    if (user && !hasDataBeenSet) {
        setName(user.name || '');
        setHandle(user.handle || '');
        setHeadline(user.headline || '');
        setBio(user.bio || '');
        setMotto(user.motto || '');
        setCountry(user.location || '');
        setAvatar(user.avatar || null);
        setBusinessCardBackground(user.business_card_background || '');
        setBusinessCardStealth(user.business_card_stealth || false);
        setExternalUrl(user.external_url || '');
        setExternalUrlName(user.external_url_name || '');
        setPortfolioItems((user.portfolio as PortfolioItem[]) || []);
        setDocuments((user.documents as DocumentItem[]) || []);
        setExperiences((user.experiences as Experience[]) || []);
        setCertifications((user.certifications as Certification[]) || []);
        setJobTitle(user.job_title || '');
        setCompany(user.company || '');
        setPronouns(user.pronouns || '');
        setInterests((user.interests || []).join(', '));
        setPhoneNumber(user.phone_number || '');
        setProfileType(user.category === 'business' ? 'business' : 'freelancer');
        
        if (user.freelancer_profiles) {
            const data = user.freelancer_profiles;
            setFreelancerTitle(data.title || '');
            setFreelancerSkills((data.skills || []).join(', '));
            setHourlyRate(data.hourly_rate || '');
            setAvailability(data.availability || '');
            setSpecializedNiches(data.specialized_niches || []);
            setAdvancedTraits(data.advanced_traits || []);
        }

        if(user.business_profiles) {
            const data = user.business_profiles;
            setCompanyName(data.company_name || '');
            setCompanySize(data.company_size || '');
            setHiringGoals(data.hiring_goals || '');
            setIndustry(data.industry || '');
        }

        setHasDataBeenSet(true);
        setIsLoading(false);
    } else if (!isUserLoading && !user) {
        setIsLoading(false);
    }
  }, [user, isUserLoading, hasDataBeenSet]);

  
  const handleProfileTypeChange = async (value: 'freelancer' | 'business') => {
    if (!authUser?.id || !supabase) return;
    setProfileType(value);
    const newCategory = value === 'business' ? 'business' : user?.category === 'business' ? 'other' : user?.category;
    const { error } = await supabase.from('users').update({ category: newCategory }).eq('id', authUser.id);
    if(error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update profile type' });
    } else {
        toast({
            title: "Profile Type Updated",
            description: `Your profile is now set to ${value}.`,
        });
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/logout');
  };

  const handleAvatarUpload = async (dataUrl: string) => {
    if (!authUser?.id || !supabase) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to update your profile picture.",
        });
        return;
    }
    setIsUploadingAvatar(true);
    try {
        const { error } = await supabase.from('users').update({ avatar: dataUrl }).eq('id', authUser.id);
        if(error) throw error;
        setAvatar(dataUrl);
        toast({
            title: "Profile Picture Updated!",
            description: "Your new picture has been saved.",
        });
    } catch (error: any) {
        console.error("Error updating profile picture:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update profile picture.",
        });
    } finally {
        setIsUploadingAvatar(false);
    }
  };


  const handleSaveChanges = async () => {
      if (!authUser?.id || !supabase) return;
      setIsSaving(true);
      
      const newHandle = handle.trim().toLowerCase();
      if (newHandle !== user?.handle) {
          const { data, error } = await supabase.from('users').select('handle').eq('handle', newHandle).single();
          if (data) {
              toast({
                  variant: "destructive",
                  title: "Handle already taken",
                  description: "Please choose a different handle.",
              });
              setIsSaving(false);
              return;
          }
      }

      const updatedData: Partial<AppUser> = { 
        name,
        handle: newHandle,
        headline, 
        bio,
        motto,
        location: country,
        job_title: jobTitle,
        company,
        pronouns,
        interests: interests.split(',').map(i => i.trim()).filter(Boolean),
       };
      
      const { error } = await supabase.from('users').update(updatedData).eq('id', authUser.id);
      if(error) {
          toast({ variant: 'destructive', title: "Error", description: error.message });
      } else {
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
        });
      }
      setIsSaving(false);
  };

  const handleAccountChanges = async () => {
    if (!authUser?.id || !supabase) return;
    setIsSaving(true);
    const updatedData: Partial<AppUser> = {
      phone_number: phoneNumber,
    };
    const { error } = await supabase.from('users').update(updatedData).eq('id', authUser.id);
    if(error) {
         toast({ variant: 'destructive', title: "Error", description: error.message });
    } else {
        toast({
            title: 'Account Info Updated',
            description: 'Your account details have been saved.',
        });
    }
    setIsSaving(false);
  };
  
  const handleSaveShareableProfile = async () => {
    if (!authUser?.id || !supabase) return;
    setIsSaving(true);
    const dataToUpdate: Partial<AppUser> = {
        external_url: externalUrl,
        external_url_name: externalUrlName,
        business_card_background: businessCardBackground,
        business_card_stealth: businessCardStealth,
    };
    const { error } = await supabase.from('users').update(dataToUpdate).eq('id', authUser.id);
    if(error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
        toast({ title: "Shareable Profile Updated" });
    }
    setIsSaving(false);
  };

  const handleSaveMatchingProfile = async () => {
    if (!user || !authUser || !supabase) return;
    setIsSaving(true);

    if (profileType === 'business') {
      const profileData: BusinessProfile = {
          company_name: companyName,
          company_size: companySize as BusinessProfile['company_size'],
          hiring_goals: hiringGoals,
          industry,
          id: authUser.id
      };
      // In Supabase, this would be an upsert
      const { error } = await supabase.from('business_profiles').upsert({ ...profileData });
      if(error) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      } else {
          toast({ title: "Business Profile Updated" });
      }
    } else {
      const profileData: FreelancerProfile = {
          title: freelancerTitle,
          skills: freelancerSkills.split(',').map(s => s.trim()).filter(Boolean),
          hourly_rate: Number(hourlyRate),
          availability: availability as FreelancerProfile['availability'],
          specialized_niches: specializedNiches,
          advanced_traits: advancedTraits,
          id: authUser.id
      };
      const { error } = await supabase.from('freelancer_profiles').upsert({ ...profileData });
      if(error) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      } else {
          toast({ title: "Freelancer Profile Updated" });
      }
    }
    
    setIsSaving(false);
  };

  const handleEnableNotifications = async () => {
    // This logic needs to be fully re-implemented with a different push notification provider (e.g., OneSignal or a custom VAPID setup)
    // as Supabase doesn't have a built-in equivalent of FCM for web push.
    toast({ title: 'Feature in Development', description: 'Push notifications are being migrated to a new service.' });
  };

  
  const handleAddPortfolioItem = async (itemData: Omit<PortfolioItem, 'id' | 'authorId' | 'author' | 'authorAvatar' | 'authorHeadline' | 'mediaType'>) => {
    if (!authUser || !supabase) return;
     const newPortfolio = [...(user?.portfolio as PortfolioItem[] || []), { id: crypto.randomUUID(), ...itemData }];
    const { error } = await supabase.from('users').update({ portfolio: newPortfolio as any }).eq('id', authUser.id);
    if(error) toast({ variant: 'destructive', title: "Error", description: "Could not save portfolio item." });
    else {
      setPortfolioItems(newPortfolio as PortfolioItem[]);
      toast({ title: 'Portfolio Updated!' });
    }
  }

  const handleAddDocument = async (fileUrl: string, name: string) => {
    if (!authUser || !supabase) return;
     const newDocument: DocumentItem = {
        title: name,
        file_url: fileUrl,
        file_type: name.split('.').pop() as any || 'pdf',
        uploaded_at: new Date(),
     };
     const newDocuments = [...(user?.documents as DocumentItem[] || []), newDocument];
     const { error } = await supabase.from('users').update({ documents: newDocuments as any }).eq('id', authUser.id);
     if(error) toast({ variant: 'destructive', title: "Error", description: "Could not save document." });
     else {
         setDocuments(newDocuments);
         toast({ title: 'Document Uploaded!' });
     }
  }
  
  const handleRemoveDocument = async (docToRemove: DocumentItem) => {
    if (!authUser || !supabase) return;
    const newDocuments = (user?.documents as DocumentItem[] || []).filter(doc => doc.file_url !== docToRemove.file_url);
    const { error } = await supabase.from('users').update({ documents: newDocuments as any }).eq('id', authUser.id);
    if(error) toast({ variant: 'destructive', title: "Error", description: "Could not remove document." });
    else {
        setDocuments(newDocuments);
        toast({ title: 'Document Removed' });
    }
  }

  const handleAddExperience = async (newItem: Experience) => {
    if (!authUser || !supabase) return;
    const newExperiences = [...(user?.experiences as Experience[] || []), newItem];
    const { error } = await supabase.from('users').update({ experiences: newExperiences as any }).eq('id', authUser.id);
    if(error) toast({ variant: 'destructive', title: "Error", description: "Could not save experience." });
    else {
        setExperiences(newExperiences);
        toast({ title: 'Experience Added!' });
    }
  };

  const handleAddCertification = async (newItem: Certification) => {
    if (!authUser || !supabase) return;
    const newCertifications = [...(user?.certifications as Certification[] || []), newItem];
    const { error } = await supabase.from('users').update({ certifications: newCertifications as any }).eq('id', authUser.id);
    if(error) toast({ variant: 'destructive', title: "Error", description: "Could not save certification." });
    else {
        setCertifications(newCertifications);
        toast({ title: 'Certification Added!' });
    }
  };

  const handleCreateCourse = async (newCourseData: Partial<Course>) => {
    if (!authUser || !user || !supabase) return;
    const completeCourseData: Omit<Course, 'id' | 'created_at' | 'rating' | 'student_count'> = {
        ...newCourseData,
        instructor_id: authUser.id,
        instructor_name: user.name,
        instructor_avatar: user.avatar,
    } as Omit<Course, 'id' | 'created_at' | 'rating' | 'student_count'>;

    const { data: inserted, error } = await supabase.from('courses').insert(completeCourseData).select();
    if(error) {
        toast({ variant: 'destructive', title: 'Error creating course', description: error.message });
    } else {
        if(inserted) setUserCourses(prev => [...prev, ...inserted as Course[]]);
        toast({
        title: "Course Created!",
        description: `"${newCourseData.title}" is now ready for content.`
        });
    }
  };

  const handleUpdateApplication = async (appId: string, userId: string, status: 'approved' | 'rejected') => {
    if (!supabase) return;
    const { error: appError } = await supabase.from('instructor_applications').update({ status }).eq('id', appId);
    if (appError) {
        toast({ variant: 'destructive', title: 'Error updating application', description: appError.message });
        return;
    }

    if (status === 'approved') {
        const { error: userError } = await supabase.from('users').update({ is_instructor: true }).eq('id', userId);
        if(userError) {
             toast({ variant: 'destructive', title: 'Error updating user role', description: userError.message });
             return;
        }
    }
    
    setApplications(prev => prev.filter(app => app.id !== appId));

    toast({
        title: `Application ${status}`,
        description: `The instructor application has been ${status}.`
    });
  };
  
  const handleSaveCookiePreferences = (settings: ConsentSettings) => {
    Cookies.set('sentrybase-cookie-consent', JSON.stringify(settings), { expires: 365 });
    toast({
      title: "Cookie Preferences Saved",
      description: "Your choices have been updated.",
    });
  };

  const [initialCookieSettings, setInitialCookieSettings] = useState<ConsentSettings | undefined>();

  useEffect(() => {
    const consent = Cookies.get('sentrybase-cookie-consent');
    if (consent) {
        try {
            setInitialCookieSettings(JSON.parse(consent));
        } catch(e) {
            console.error("Failed to parse cookie settings", e);
        }
    }
  }, []);


  if (isLoading || isLoadingCourses || isLoadingApplications || isUserDocLoading) {
    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 animate-pulse">
            <header className="mb-4">
                <Skeleton className="h-8 w-1/3" />
            </header>
            <Skeleton className="h-10 w-full max-w-lg" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }
  
  const dropdownTabs = [
    { value: "portfolio", label: "Portfolio" },
    ...(isInstructor ? [{ value: "instructor", label: "Instructor" }] : []),
    ...(isAdmin ? [{ value: "admin", label: "Admin" }] : []),
    { value: "share", label: "Share Profile" },
    { value: "account", label: "Account" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 overflow-x-hidden">
      <ImageEditor
        image={imageToEdit}
        onClose={() => setImageToEdit(null)}
        onSave={(croppedImage) => {
          setBusinessCardBackground(croppedImage);
          setImageToEdit(null);
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center gap-2">
            <TabsList className="bg-transparent p-0">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
            </TabsList>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-transparent">More <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {dropdownTabs.map(item => (
                        <DropdownMenuItem key={item.value} onSelect={() => setActiveTab(item.value)}>
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        
        <TabsContent value="admin">
            <AdminPanel applications={applications || []} onUpdateApplication={handleUpdateApplication} />
        </TabsContent>

        <TabsContent value="instructor">
            <Card className="border-transparent shadow-none">
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Instructor Dashboard</CardTitle>
                        <CardDescription>Manage your courses and view student analytics.</CardDescription>
                    </div>
                     <Dialog>
                        <DialogTrigger asChild>
                             <Button><PlusCircle className="mr-2 h-4 w-4" /> Create New Course</Button>
                        </DialogTrigger>
                        <CreateCourseDialog onSave={handleCreateCourse} />
                     </Dialog>
                </CardHeader>
                 <CardContent>
                    {isLoadingCourses ? (
                        <Skeleton className="w-full h-48" />
                    ) : userCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userCourses.map(course => (
                                <Card key={course.id}>
                                    <CardHeader className="flex-row gap-4 items-start">
                                        <Image src={course.thumbnail_url} alt={course.title} width={80} height={45} className="aspect-video rounded-md object-cover" />
                                        <div className="flex-1">
                                            <CardTitle className="text-base">{course.title}</CardTitle>
                                            <CardDescription>{course.student_count} students</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardFooter>
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href={`/courses/edit/${course.id}`}>Manage Course</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-24 text-center">
                            <GraduationCap className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-xl font-semibold">Start Your Teaching Journey</h3>
                            <p className="mt-2 text-muted-foreground">You haven't created any courses yet. Click "Create New Course" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="profile">
            <Card className="border-transparent shadow-none p-0">
              <CardContent className="space-y-6 p-0">
                 <div className="grid grid-cols-[auto_1fr] items-center gap-6">
                    <MediaUploader onUpload={handleAvatarUpload}>
                        <div className="relative group">
                            <Avatar className="w-24 h-24 border">
                                <AvatarImage src={avatar || undefined} alt={name} />
                                <AvatarFallback className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white">
                                    {name ? name.charAt(0) : <UserIcon className="w-12 h-12" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                {isUploadingAvatar ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <UploadCloud className="h-6 w-6 text-white" />}
                            </div>
                        </div>
                    </MediaUploader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t.name}</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="handle">Username</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                                    <Input id="handle" value={handle} onChange={e => setHandle(e.target.value)} className="pl-7" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="motto">Motto / Philosophy</Label>
                    <Input id="motto" value={motto} onChange={(e) => setMotto(e.target.value)} placeholder="e.g., Code with clarity, design with purpose." />
                 </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="job-title">Current Position</Label>
                        <Input id="job-title" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" value={company} onChange={e => setCompany(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="headline">{t.headline}</Label>
                    <Input id="headline" value={headline} onChange={e => setHeadline(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bio">{t.bio}</Label>
                    <Textarea id="bio" className="w-full min-h-24 p-2 border rounded-md" value={bio || ''} onChange={e => setBio(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="pronouns">Pronouns (optional)</Label>
                        <Input id="pronouns" value={pronouns} onChange={e => setPronouns(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Select value={country} onValueChange={setCountry}>
                            <SelectTrigger id="location">
                                <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className="h-72">
                                {countries.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="interests">Interests / Hobbies</Label>
                    <Input id="interests" value={interests} onChange={e => setInterests(e.target.value)} placeholder="e.g., Hiking, Photography, Open Source" />
                     <p className="text-xs text-muted-foreground">Separate interests with commas.</p>
                </div>
              </CardContent>
               <CardFooter>
                 <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Saving...' : t.saveChanges}
                </Button>
               </CardFooter>
            </Card>
             <Card className="mt-8 border-transparent shadow-none">
                <CardHeader>
                    <CardTitle>Sentrybase Verification</CardTitle>
                    <CardDescription>Get the official Sentrybase badge and show your support for the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {user?.is_sentrybase_verified ? (
                        <Alert variant="default" className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 [&>svg]:text-green-500">
                           <Feather className="h-4 w-4" />
                            <AlertTitle className="font-semibold text-green-800 dark:text-green-300">You are Sentrybase Verified!</AlertTitle>
                            <AlertDescription>
                                The verified badge is now active on your profile and posts. Thank you for your support!
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert>
                           <Feather className="h-4 w-4" />
                            <AlertTitle>Get Verified</AlertTitle>
                            <AlertDescription>
                                Purchase a Sentrybase Verification badge to stand out and support the platform's development.
                            </AlertDescription>
                            <div className="mt-4 flex justify-center">
                                <Button asChild>
                                    <Link href="/billing">Get Verified on Billing Page</Link>
                                </Button>
                            </div>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="metadata">
            <Card className="border-transparent shadow-none">
                <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                    <CardDescription>Manage your professional details for our AI matching engines, SkillSyncNet and Workmate Radar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label>Select Your Primary Role</Label>
                        <RadioGroup value={profileType} onValueChange={(v) => handleProfileTypeChange(v as any)} className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="freelancer" id="type-freelancer" />
                                <Label htmlFor="type-freelancer" className="font-semibold">I am a Freelancer / Individual</Label>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <RadioGroupItem value="business" id="type-business" />
                                <Label htmlFor="type-business" className="font-semibold">I am a Business / Agency</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Separator />

                    {profileType === 'business' ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="company-name">Company Name</Label>
                                <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g., Acme Inc." />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Industry</Label>
                                    <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., SaaS, E-commerce" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company-size">Company Size</Label>
                                    <Select value={companySize || undefined} onValueChange={(v) => setCompanySize(v as any)}>
                                        <SelectTrigger id="company-size">
                                            <SelectValue placeholder="Select company size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-10">1-10 employees</SelectItem>
                                            <SelectItem value="11-50">11-50 employees</SelectItem>
                                            <SelectItem value="51-200">51-200 employees</SelectItem>
                                            <SelectItem value="201-1000">201-1000 employees</SelectItem>
                                            <SelectItem value="1000+">1000+ employees</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hiring-goals">Hiring Goals</Label>
                                <Textarea id="hiring-goals" value={hiringGoals} onChange={(e) => setHiringGoals(e.target.value)} placeholder="Describe the type of talent you're looking for..." />
                            </div>
                        </>
                    ) : (
                        <>
                           <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="freelancer-title">Professional Title</Label>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="outline" size="sm"><Settings2 className="mr-2 h-4 w-4" />Choose Category</Button>
                                        </DialogTrigger>
                                        <NichePickerDialog onSave={setSpecializedNiches} initialNiches={specializedNiches} />
                                    </Dialog>
                                </div>
                                <Input id="freelancer-title" value={freelancerTitle} onChange={(e) => setFreelancerTitle(e.target.value)} placeholder="e.g., Senior React Developer" />
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {specializedNiches.map(niche => (
                                        <Badge key={niche} variant="secondary">{niche}</Badge>
                                    ))}
                                </div>
                            </div>
                             <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="freelancer-skills">Core Skills</Label>
                                     <Dialog>
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="outline" size="sm"><SlidersHorizontal className="mr-2 h-4 w-4" />Add Advanced Details</Button>
                                        </DialogTrigger>
                                        <AdvancedProfileDialog onSave={setAdvancedTraits} initialTraits={advancedTraits} />
                                    </Dialog>
                                </div>
                                <Input id="freelancer-skills" value={freelancerSkills} onChange={(e) => setFreelancerSkills(e.target.value)} placeholder="e.g., Next.js, GraphQL, Animations" />
                                <p className="text-xs text-muted-foreground">Separate skills with commas.</p>
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {advancedTraits.map(trait => (
                                        <Badge key={trait} variant="outline" className="font-normal">{trait}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hourly-rate">Hourly Rate ($USD)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="hourly-rate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="pl-8" placeholder="e.g., 100" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="availability">Availability</Label>
                                    <Select value={availability || undefined} onValueChange={(v) => setAvailability(v as any)}>
                                        <SelectTrigger id="availability">
                                            <SelectValue placeholder="Select your availability" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full-time">Available for Full-time</SelectItem>
                                            <SelectItem value="part-time">Available for Part-time</SelectItem>
                                            <SelectItem value="contract">Available for Contract</SelectItem>
                                            <SelectItem value="unavailable">Currently Unavailable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveMatchingProfile} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Saving...' : 'Save Metadata'}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
        
        <TabsContent value="account">
            <Card className="border-transparent shadow-none">
              <CardHeader>
                <CardTitle>{t.account}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t.email}</Label>
                        <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                    </div>
                </div>
                  <Button variant="outline">{t.changePassword}</Button>

                  <div className="space-y-4 rounded-lg border p-4">
                    <h4 className="font-medium">Notifications</h4>
                    {notificationPermission === 'granted' ? (
                        <Alert variant="default" className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 [&>svg]:text-green-500">
                            <Bell className="h-4 w-4" />
                            <AlertTitle className="font-semibold text-green-800 dark:text-green-300">Push Notifications are Enabled</AlertTitle>
                            <AlertDescription>
                                You can manage notification preferences in your browser settings.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="flex items-center justify-between">
                            <Label htmlFor="enable-notifications" className="flex flex-col gap-1">
                                <span>Enable Push Notifications</span>
                                <span className="font-normal text-muted-foreground text-xs">Receive updates for messages, mentions, and more.</span>
                            </Label>
                            <Button onClick={handleEnableNotifications} disabled={isRequestingPermission || notificationPermission === 'denied'}>
                                {isRequestingPermission ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {notificationPermission === 'denied' ? 'Permission Denied' : 'Enable'}
                            </Button>
                        </div>
                    )}
                    <Separator />
                      <h4 className="font-medium">{t.displayPreferences}</h4>
                      <div className="flex items-center justify-between">
                          <Label htmlFor="show-job-info" className="flex flex-col gap-1">
                              <span>{t.showPositionOnPosts}</span>
                              <span className="font-normal text-muted-foreground text-xs">{t.showPositionDesc}</span>
                          </Label>
                          <Switch id="show-job-info" defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                         <Label htmlFor="appearance" className="flex flex-col gap-1">
                              <span>{t.appearance}</span>
                              <span className="font-normal text-muted-foreground text-xs">{t.appearanceDesc}</span>
                          </Label>
                          <ThemeSwitcher />
                      </div>
                  </div>
                   <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-medium">{t.langAndRegion}</h4>
                        <div className="space-y-2">
                            <Label htmlFor="language">{t.language}</Label>
                            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                                <SelectTrigger id="language">
                                    <SelectValue placeholder="Select a language" />
                                </SelectTrigger>
                                <SelectContent>
                                <ScrollArea className="h-72">
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="zh">中文 (Chinese)</SelectItem>
                                    {/* ... other languages */}
                                </ScrollArea>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">{t.languageDesc}</p>
                        </div>
                  </div>
                   <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-medium">Privacy & Cookies</h4>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="manage-cookies" className="flex flex-col gap-1">
                                <span>Manage Cookie Consent</span>
                                <span className="font-normal text-muted-foreground text-xs">Adjust your preferences for analytics and marketing cookies.</span>
                            </Label>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" id="manage-cookies">Manage</Button>
                                </DialogTrigger>
                                <CookieSettingsDialog onSave={handleSaveCookiePreferences} initialSettings={initialCookieSettings} />
                            </Dialog>
                        </div>
                  </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-4">
                 <Button onClick={handleAccountChanges} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Account Info
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.logout}
                </Button>
              </CardFooter>
            </Card>
        </TabsContent>
        
        <TabsContent value="portfolio">
             <Card className="border-transparent shadow-none">
                <CardHeader className="flex-row items-center justify-between">
                  <div>
                    <CardTitle>Portfolio Projects</CardTitle>
                    <CardDescription>Upload and manage your visual portfolio.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-md border bg-background p-1">
                        <Button variant={portfolioLayout === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setPortfolioLayout('grid')}><LayoutGrid className="h-5 w-5" /></Button>
                        <Button variant={portfolioLayout === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setPortfolioLayout('list')}><List className="h-5 w-5" /></Button>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Project</Button>
                        </DialogTrigger>
                        <AddPortfolioItemDialog onSave={handleAddPortfolioItem} />
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                     <div className="mt-6">
                        {portfolioItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-24 text-center">
                                <h3 className="text-xl font-semibold">Showcase Your Work</h3>
                                <p className="mt-2 text-muted-foreground">You haven't added any projects yet. Click "Add Project" to start.</p>
                            </div>
                        ) : portfolioLayout === 'grid' ? (
                            <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
                               {portfolioItems.map((item, index) => (
                                    <PortfolioCard key={index} item={item} layout={portfolioLayout} />
                                ))}
                            </div>
                        ) : (
                             <div className="space-y-4">
                                {portfolioItems.map((item, index) => (
                                    <PortfolioCard key={index} item={item} layout={portfolioLayout} />
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-8 border-transparent shadow-none">
                <CardHeader>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Upload and manage your CV, case studies, or reports.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUploader onUpload={handleAddDocument} />
                     <div className="mt-6 space-y-3">
                        <h3 className="text-lg font-semibold">Your Documents</h3>
                         {documents.length > 0 ? (
                            documents.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between rounded-md border p-3">
                                    <div className="flex items-center gap-3">
                                       <FileText className="h-5 w-5 text-muted-foreground"/>
                                       <p className="font-medium truncate">{doc.title}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveDocument(doc)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </div>
                            ))
                         ) : (
                            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                         )}
                     </div>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="experience">
            <Card className="border-transparent shadow-none">
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Work Experience</CardTitle>
                        <CardDescription>List your professional history and credentials.</CardDescription>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
                        </DialogTrigger>
                        <AddExperienceDialog onSave={handleAddExperience} />
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {experiences.length > 0 ? (
                        <div className="space-y-6">
                            {experiences.map((exp, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        <Building className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{exp.title}</h3>
                                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                                        <p className="text-xs text-muted-foreground">{exp.start_date} - {exp.end_date || 'Present'}</p>
                                        <p className="mt-2 text-sm">{exp.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground py-12">No past work experience added yet.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="mt-8 border-transparent shadow-none">
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Awards & Certifications</CardTitle>
                        <CardDescription>Showcase your credentials.</CardDescription>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Certification</Button>
                        </DialogTrigger>
                        <AddCertificationDialog onSave={handleAddCertification} />
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {certifications.length > 0 ? (
                        <div className="space-y-4 pt-6">
                            {certifications.map((cert, index) => (
                                <div key={index} className="flex gap-4 items-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        <Award className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{cert.name}</h3>
                                        <p className="text-sm text-muted-foreground">{cert.issuing_organization} · Issued: {cert.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <p className="text-sm text-center text-muted-foreground py-12">No certifications added yet.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="share">
            <Card className="border-transparent shadow-none">
                <CardHeader>
                    <CardTitle>Customize Your Business Card</CardTitle>
                    <CardDescription>
                        Control the look and feel of your pop-up business card.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label>Card Background</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="space-y-3">
                                <RadioGroup value={businessCardBackground.startsWith('bg-') ? businessCardBackground : 'custom'} onValueChange={(value) => value !== 'custom' && setBusinessCardBackground(value)} className="flex gap-2">
                                    <Label htmlFor="bg-black" className="cursor-pointer rounded-md h-16 w-16 border-2 has-[:checked]:border-primary bg-black border-border" />
                                    <RadioGroupItem value="bg-black" id="bg-black" className="sr-only" />
                                    
                                    <Label htmlFor="bg-white" className="cursor-pointer rounded-md h-16 w-16 border-2 has-[:checked]:border-primary bg-white border" />
                                    <RadioGroupItem value="bg-white" id="bg-white" className="sr-only" />

                                    <Label htmlFor="bg-blue-950" className="cursor-pointer rounded-md h-16 w-16 border-2 has-[:checked]:border-primary bg-blue-950 border" />
                                    <RadioGroupItem value="bg-blue-950" id="bg-blue-950" className="sr-only" />
                                </RadioGroup>
                            </div>
                            <div
                                onClick={() => document.getElementById('card-bg-uploader')?.click()}
                                className={cn(
                                    "relative cursor-pointer rounded-md border-2 border-dashed p-4 text-center text-muted-foreground hover:border-primary",
                                    businessCardBackground && businessCardBackground.startsWith('http') && "border-primary"
                                )}
                            >
                                {businessCardBackground && businessCardBackground.startsWith('http') ? (
                                    <Image src={businessCardBackground} alt="Current background" fill className="object-cover rounded-md" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <UploadCloud className="h-6 w-6 mb-2"/>
                                        <span className="text-sm font-semibold">Upload Image</span>
                                    </div>
                                )}
                                <div id="card-bg-uploader" className="hidden">
                                    <MediaUploader onUpload={(url) => setImageToEdit(url)} />
                                </div>
                            </div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="external-url-name">Link Name</Label>
                        <Input id="external-url-name" value={externalUrlName} onChange={(e) => setExternalUrlName(e.target.value)} placeholder="e.g., My Portfolio, Company Website" />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="external-url">External URL</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="external-url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="e.g., https://your-portfolio.com" className="pl-9" />
                        </div>
                     </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="stealth-mode" className="text-base">Stealth Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Only show your business card to your connections.
                            </p>
                        </div>
                        <Switch
                            id="stealth-mode"
                            checked={businessCardStealth}
                            onCheckedChange={setBusinessCardStealth}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveShareableProfile} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save Card Details
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminPage() {
    return (
        <ClientOnly>
            <AdminPageInternal />
        </ClientOnly>
    );
}
