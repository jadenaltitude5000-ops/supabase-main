
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  MoreHorizontal,
  PlusCircle,
  BarChart2,
  Users,
  DollarSign,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClientOnly } from '@/components/layout/client-only';
import { useUser, useSupabase } from '@/lib/supabase-client';
import type { Campaign } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { adAnalyticsData } from '@/lib/ad-analytics-data';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';

function CreateCampaignDialog() {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <DialogContent className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-8 max-w-4xl p-0">
            <div className="p-8 space-y-6">
                 <DialogHeader>
                    <DialogTitle>{t.createCampaignTitle}</DialogTitle>
                    <DialogDescription>{t.createCampaignDesc}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="campaign-name">{t.campaignName}</Label>
                        <Input id="campaign-name" placeholder={t.campaignNamePlaceholder} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="ad-type">{t.adType}</Label>
                        <Select>
                            <SelectTrigger id="ad-type">
                                <SelectValue placeholder={t.adTypePlaceholder} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="profile">{t.adTypeProfile}</SelectItem>
                                <SelectItem value="product">{t.adTypeProduct}</SelectItem>
                                <SelectItem value="content">{t.adTypeContent}</SelectItem>
                                <SelectItem value="job">{t.adTypeJob}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ad-content">{t.adContent}</Label>
                        <Textarea id="ad-content" placeholder={t.adContentPlaceholder} className="min-h-24" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="targeting-keywords">{t.targetingKeywords}</Label>
                        <Input id="targeting-keywords" placeholder={t.targetingKeywordsPlaceholder} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                    <Button>{t.launchCampaign}</Button>
                </DialogFooter>
            </div>
            <div className="bg-muted/50 p-8 space-y-6 rounded-r-lg">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    {t.pocketGuide}
                </h3>
                 <p className="text-sm text-muted-foreground">{t.pocketGuideDesc}</p>
                <Card>
                    <CardHeader><CardTitle className="text-base">{t.campaignNameStrength}</CardTitle></CardHeader>
                    <CardContent><Skeleton className="h-8" /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">{t.contentSuggestions}</CardTitle></CardHeader>
                    <CardContent className="text-sm text-muted-foreground">Fill out your ad content to get AI suggestions.</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">{t.keywordSuggestions}</CardTitle></CardHeader>
                    <CardContent className="text-sm text-muted-foreground">Start typing keywords to see suggestions.</CardContent>
                </Card>
            </div>
        </DialogContent>
    )
}

function AdStudioPageInternal() {
  const { user, isUserLoading } = useUser();
  const supabase = useSupabase();
  const { language } = useLanguage();
  const t = translations[language];

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !supabase) return;

    const fetchCampaigns = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            console.error("Error fetching campaigns:", error);
            setCampaigns([]);
        } else {
            setCampaigns(data as Campaign[]);
        }
        setIsLoading(false);
    };

    fetchCampaigns();
  }, [user?.id, supabase]);

  const isLoadingData = isLoading || isUserLoading;

  return (
    <div className="h-full p-4 sm:p-6 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            {t.adStudioTitle}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t.adStudioDescription}
          </p>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t.createCampaign}
                </Button>
            </DialogTrigger>
            <CreateCampaignDialog />
        </Dialog>
      </header>
       <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-4 bg-black text-muted-foreground">
          <TabsTrigger value="campaigns">{t.campaigns}</TabsTrigger>
          <TabsTrigger value="analytics">{t.analytics}</TabsTrigger>
          <TabsTrigger value="audiences">{t.audiences}</TabsTrigger>
          <TabsTrigger value="billing">{t.billingAndAds}</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.yourCampaigns}</CardTitle>
                <CardDescription>{t.yourCampaignsDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.campaignName}</TableHead>
                      <TableHead>{t.status}</TableHead>
                      <TableHead>{t.type}</TableHead>
                      <TableHead>{t.spend}</TableHead>
                      <TableHead>{t.conversions}</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingData ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : campaigns && campaigns.length > 0 ? (
                      campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">
                            {campaign.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={campaign.status?.toLowerCase() === 'active' ? 'default' : 'secondary'}>{campaign.status}</Badge>
                          </TableCell>
                          <TableCell>{campaign.type}</TableCell>
                          <TableCell>{campaign.spend}</TableCell>
                          <TableCell>{campaign.conversions}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Pause</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          No campaigns created yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(adAnalyticsData.kpis).map(([key, item]) => (
                    <Card key={key}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.value}</div>
                            <p className="text-xs text-muted-foreground">{item.change} from last month</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="grid gap-6 lg:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Performance Over Time</CardTitle>
                        <CardDescription>Clicks and Spend over the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Campaign Breakdown</CardTitle>
                        <CardDescription>Spend distribution across top campaigns.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
         <TabsContent value="audiences" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>{t.audienceManagement}</CardTitle>
                    <CardDescription>{t.audienceManagementDesc}</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                    <p>{t.audienceToolsComingSoon}</p>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="billing" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>{t.billingAndAds}</CardTitle>
                    <CardDescription>{t.billingAndAdsDesc}</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                    <p>{t.billingToolsComingSoon}</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdStudioPage() {
    return (
        <ClientOnly>
            <AdStudioPageInternal />
        </ClientOnly>
    );
}

    