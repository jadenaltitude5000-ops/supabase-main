
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Lock, Loader2, ShoppingCart, Gift, Heart, Feather, ShieldCheck, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { ClientOnly } from '@/components/layout/client-only';
import { translations } from '@/lib/translations';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useUser as useAuthUser,
  useSupabase,
} from '@/lib/supabase-client';
import type { Plan, User } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/language-context';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { DonateDialog } from '@/components/features/donations/DonateDialog';
import Link from 'next/link';

interface PlanWithPitch extends Plan {
    pitch?: string;
    subPrice?: string;
}

const FREELANCER_PLANS: PlanWithPitch[] = [
    {
        id: 'freelancer-essential',
        name: 'Essential',
        price: 'Free',
        pitch: 'For new freelancers exploring the platform.',
        features: [
            'Standard Profile: Create a portfolio, list your skills and experience.',
            'Launch Boost: Get a 48-hour "New Talent" boost in search results.',
            'Basic Search: Access the main job board.',
            '5 Proposals/Month: Enough to get your feet wet and test the platform.',
        ],
        isCurrent: false,
    },
    {
        id: 'freelancer-standard',
        name: 'Standard',
        price: '99.99',
        pitch: 'Stop searching, start getting matched. This is your engine for a steady stream of relevant projects.',
        features: [
            'All Essential features',
            '1 SkillSyncNet Match/Month',
            '15 Workmate Radar Pings/Month',
            'Enhanced Profile Analytics',
            '30 Proposals/Month',
        ],
        bestFor: 'Established freelancers',
        isCurrent: false,
    },
    {
        id: 'freelancer-pro',
        name: 'Professional',
        price: '399.99',
        pitch: 'Gain a competitive edge. Get more of the right opportunities and win more projects with advanced tools.',
        features: [
            'All Professional features',
            '4 SkillSyncNet Matches/Month',
            'Unlimited Workmate Radar Pings',
            '"Professional" Badge on profile',
            'Competitive Insights on projects',
            'Unlimited Proposals',
        ],
        bestFor: 'Serious professionals',
        isCurrent: false,
    },
    {
        id: 'freelancer-ultra',
        name: 'Ultra',
        price: '999.95',
        pitch: 'The ultimate unfair advantage. Get curated matches, predictive market intelligence, and priority support.',
        features: [
            'All Professional features',
            'Unlimited SkillSyncNet Matches',
            'Actionable Market Intelligence Report',
            'Priority Client Support',
            'Direct "Featured" Placement',
        ],
        bestFor: 'Top-tier experts',
        isCurrent: false,
    }
];

const BUSINESS_PLANS: PlanWithPitch[] = [
    {
        id: 'business-starter',
        name: 'Starter',
        price: '99',
        subPrice: 'per project',
        pitch: 'For businesses testing the waters with a single, small project.',
        features: [
            'Post 1 active project',
            'Receive up to 15 proposals',
            'Basic search and messaging',
        ],
        isCurrent: false,
    },
    {
        id: 'business-pro',
        name: 'Pro',
        price: '2599',
        subPrice: '/ month',
        pitch: 'Hire with confidence. Get a curated shortlist of top-tier talent and advanced tools to manage your hiring.',
        features: [
            'All Starter features',
            'Curated Shortlist (Top 3-5) in 72 hours',
            'Advanced Search Filters (Ultra tier, ratings)',
            'Applicant Tracking System (ATS) Lite',
            'Post up to 5 active projects',
        ],
        bestFor: 'Growing businesses',
        isCurrent: false,
    },
    {
        id: 'business-enterprise',
        name: 'Enterprise',
        price: 'Custom',
        pitch: 'A fully managed talent solution. We integrate with your workflow and provide dedicated support to scale your team.',
        features: [
            'All Pro features',
            'Dedicated Account Manager',
            'Team Collaboration Tools',
            'API & HRIS Integrations',
            'Custom SLAs & Consolidated Billing',
        ],
        bestFor: 'Agencies and large teams',
        isCurrent: false,
    }
];

function ContactSalesDialog() {
  const { toast } = useToast();
  const { user: authUser } = useAuthUser();
  const supabase = useSupabase();

  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  
  const isFormValid = message.trim() && businessName.trim() && businessEmail.trim();

  const handleSubmit = async () => {
    if (!isFormValid || !authUser || !supabase) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out all required fields to contact sales.',
      });
      return;
    }

    const { error } = await supabase.from('sales_inquiries').insert({
      userId: authUser.id,
      userName: authUser.user_metadata.full_name,
      userEmail: authUser.email,
      businessName,
      businessEmail,
      phoneNumber,
      message,
    });
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error sending message', description: error.message });
    } else {
      toast({
        title: 'Message Sent',
        description:
          'Our sales team has received your message and will be in touch shortly.',
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Contact Sales</DialogTitle>
        <DialogDescription>
          Tell us about your team's needs, and we'll get back to you with a
          custom plan.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
         <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input id="business-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Company, Inc." />
            </div>
             <div className="space-y-2">
                <Label htmlFor="business-email">Business Email</Label>
                <Input id="business-email" type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="work@yourcompany.com" />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number (Optional)</Label>
            <Input id="phone-number" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sales-message">Your Requirements</Label>
          <Textarea
            id="sales-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your team size, required features, and any other specific needs..."
            className="min-h-[100px]"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            Send Message
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

function PaymentDialog({ item, onSuccessfulPayment }: { item: {name: string, price: string, description: string}; onSuccessfulPayment: () => void }) {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configuration Error</DialogTitle>
                </DialogHeader>
                <p>PayPal client ID is not configured. Payment cannot be processed.</p>
            </DialogContent>
        )
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Purchase: {item.name}</DialogTitle>
                <DialogDescription>
                    {item.description}
                </DialogDescription>
            </DialogHeader>
            {isProcessing ? (
                <div className="flex flex-col items-center justify-center p-8">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p>Processing your payment...</p>
                </div>
            ) : (
                <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
                    <PayPalButtons
                        style={{ layout: "vertical" }}
                        createOrder={async (data, actions) => {
                            return actions.order.create({
                                intent: 'CAPTURE',
                                purchase_units: [{
                                    description: `Sentrybase - ${item.name}`,
                                    amount: {
                                        currency_code: 'USD',
                                        value: item.price
                                    }
                                }]
                            });
                        }}
                        onApprove={async (data, actions) => {
                            setIsProcessing(true);
                            const order = await actions.order?.capture();
                            console.log("Payment successful:", order);
                            onSuccessfulPayment();
                            toast({
                                title: "Payment Successful!",
                                description: `Your purchase of ${item.name} is complete.`
                            });
                            setIsProcessing(false);
                            return Promise.resolve();
                        }}
                        onError={(err) => {
                            console.error("PayPal Error:", err);
                            toast({
                                variant: "destructive",
                                title: "Payment Failed",
                                description: "An error occurred during the payment process. Please try again."
                            });
                        }}
                    />
                </PayPalScriptProvider>
            )}
        </DialogContent>
    );
}

function PlanCard({ plan, onSelect, isCurrent, isLocked, t }: { plan: PlanWithPitch, onSelect: (plan: Plan) => void, isCurrent: boolean, isLocked: boolean, t: typeof translations['en'] }) {
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    const handleUpgradeClick = () => {
        if (plan.price === 'Free') {
            onSelect(plan);
        } else {
            setIsPaymentDialogOpen(true);
        }
    };
    
    return (
        <Card className={cn('flex flex-col shadow-none border-black', isCurrent ? 'ring-2 ring-primary' : '')}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {plan.name}
                </CardTitle>
                <CardDescription>{plan.pitch}</CardDescription>
                <div className="flex items-baseline gap-1 pt-2">
                     <span className="text-3xl font-bold">
                        {plan.price === 'Free' || plan.price === 'Custom' ? plan.price : `$${plan.price}`}
                    </span>
                     {plan.price !== 'Free' && plan.price !== 'Custom' && (
                        <span className="text-muted-foreground">{plan.subPrice || '/ month'}</span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0 text-primary/50" />
                        <span>{feature}</span>
                    </li>
                ))}
            </CardContent>
            <CardFooter>
                 {plan.price === 'Custom' ? (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full" variant="outline">{t.contactSales}</Button>
                        </DialogTrigger>
                        <ContactSalesDialog />
                    </Dialog>
                ) : isCurrent ? (
                    <Button className="w-full" disabled variant="outline">Current Plan</Button>
                ) : (
                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="w-full" tabIndex={0}>
                                         <DialogTrigger asChild>
                                            <Button className="w-full" onClick={handleUpgradeClick} disabled={isLocked}>
                                                {isLocked && <Lock className="mr-2 h-4 w-4" />}
                                                {t.upgrade}
                                            </Button>
                                        </DialogTrigger>
                                    </span>
                                </TooltipTrigger>
                                 {isLocked && (
                                    <TooltipContent>
                                        <p>Login to upgrade your plan.</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        <PaymentDialog item={{name: `${plan.name} Plan`, price: plan.price, description: `You are upgrading to the ${plan.name} plan.`}} onSuccessfulPayment={() => { onSelect(plan); setIsPaymentDialogOpen(false); }} />
                    </Dialog>
                )}
            </CardFooter>
        </Card>
    );
}

const DashboardSkeleton = () => (
    <div className="h-full p-4 sm:p-6 md:p-8 animate-pulse">
        <header className="mb-8">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-5 w-1/2 mt-2" />
        </header>
        <Skeleton className="h-12 w-full max-w-lg" />
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
            ))}
        </div>
    </div>
);


function BillingPageInternal() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  const { user: authUser, isUserLoading } = useAuthUser();
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [isUserDocLoading, setIsUserDocLoading] = useState(true);

  useEffect(() => {
    if (!authUser || !supabase) {
      setIsUserDocLoading(false);
      return;
    }
    const fetchUser = async () => {
      setIsUserDocLoading(true);
      const { data, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      if (data) setUser(data as User);
      setIsUserDocLoading(false);
    };
    fetchUser();
  }, [authUser, supabase]);


  const isLoading = isUserLoading || isUserDocLoading;

  if (isLoading) {
      return <DashboardSkeleton />
  }

  const currentPlanId = user?.subscription?.planId;
  const isUserLoggedIn = !!authUser;

  const handleUpgrade = async (plan: Plan) => {
    if (!authUser || !supabase) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to upgrade your plan." });
      return;
    }
    const { error } = await supabase.from('users').update({ subscription: { planId: plan.id } }).eq('id', authUser.id);
    
    if (error) {
        toast({ variant: 'destructive', title: "Upgrade Failed", description: error.message });
    } else {
        setUser(prev => prev ? ({...prev, subscription: { planId: plan.id }}) : null);
        toast({ title: "Upgrade Successful!", description: `You are now on the ${plan.name} plan.` });
    }
  };
  
  const handlePurchaseVerification = async () => {
    if (!authUser || !supabase) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to purchase verification." });
      return;
    }
     const { error } = await supabase.from('users').update({ isSentrybaseVerified: true }).eq('id', authUser.id);

     if(error) {
        toast({ variant: 'destructive', title: 'Purchase Failed', description: error.message });
     } else {
        setUser(prev => prev ? ({...prev, isSentrybaseVerified: true}) : null);
        toast({ title: "Verification Successful!", description: "You are now a Sentrybase Verified member." });
     }
  };
  
  const DonationCard = () => (
    <Card className="text-center col-span-1 md:col-span-2 lg:col-span-4 border-transparent shadow-none">
        <CardHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-transparent">
                <Feather className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Support Sentrybase</CardTitle>
            <CardDescription>
            Sentrybase is built for the community. Your support helps us innovate faster and build the best platform for professionals like you.
            </CardDescription>
        </CardHeader>
        <CardFooter>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full max-w-xs mx-auto bg-yellow-500 hover:bg-yellow-600 text-black">
                        <Feather className="mr-2 h-4 w-4" /> Donate Now
                    </Button>
                </DialogTrigger>
                <DonateDialog />
            </Dialog>
        </CardFooter>
    </Card>
  );

  return (
    <div className="h-full p-4 sm:p-6 md:p-8">
        <header className="mb-8">
            <h1 className="font-headline text-3xl font-light tracking-tight">{t.billingTitle}</h1>
            <p className="mt-1 text-lg text-muted-foreground font-light">{t.billingDescription}</p>
        </header>
        <Tabs defaultValue="freelancers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md bg-transparent text-muted-foreground">
                 <TabsTrigger value="freelancers">
                    <span className="hidden sm:inline">For Freelancers & Individuals</span>
                    <span className="sm:hidden">Freelancer</span>
                </TabsTrigger>
                <TabsTrigger value="businesses">
                    <span className="hidden sm:inline">For Businesses & Agencies</span>
                    <span className="sm:hidden">Business</span>
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="freelancers" className="mt-6">
                 <Card className="border-transparent shadow-none">
                    <CardHeader>
                        <CardTitle>Plans for Freelancers</CardTitle>
                        <CardDescription>A clear ladder, where each tier solves a more critical problem for a growing freelancer.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {FREELANCER_PLANS.map((plan) => (
                            <PlanCard 
                                key={plan.id}
                                plan={plan}
                                onSelect={handleUpgrade}
                                isCurrent={plan.id === currentPlanId}
                                isLocked={!isUserLoggedIn}
                                t={t}
                            />
                        ))}
                        <Card className="flex flex-col shadow-none border-dashed border-primary/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck /> Sentrybase Verified
                                </CardTitle>
                                <CardDescription>Get the official badge of trust and support the platform.</CardDescription>
                                <div className="flex items-baseline gap-1 pt-2">
                                    <span className="text-3xl font-bold">$49.99</span>
                                    <span className="text-muted-foreground">one-time</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground"><Feather className="h-4 w-4 mt-1 flex-shrink-0 text-primary/50" /><span>Verified badge on your profile and posts</span></li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground"><Feather className="h-4 w-4 mt-1 flex-shrink-0 text-primary/50" /><span>Increased visibility in search results</span></li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground"><Feather className="h-4 w-4 mt-1 flex-shrink-0 text-primary/50" /><span>Directly support Sentrybase development</span></li>
                            </CardContent>
                            <CardFooter>
                                {user?.isSentrybaseVerified ? (
                                    <Button className="w-full" disabled variant="outline">Already Verified</Button>
                                ) : (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="w-full" disabled={!isUserLoggedIn}>Get Verified</Button>
                                        </DialogTrigger>
                                        <PaymentDialog item={{name: 'Sentrybase Verification', price: '49.99', description: 'One-time purchase for a lifetime verification badge.'}} onSuccessfulPayment={handlePurchaseVerification} />
                                    </Dialog>
                                )}
                            </CardFooter>
                        </Card>
                        <DonationCard />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="businesses" className="mt-6">
                <Card className="border-transparent shadow-none">
                    <CardHeader>
                        <CardTitle>Plans for Businesses</CardTitle>
                        <CardDescription>Hire with confidence. Get a curated shortlist of top-tier talent and advanced tools.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {BUSINESS_PLANS.map((plan) => (
                            <PlanCard 
                                key={plan.id}
                                plan={plan}
                                onSelect={handleUpgrade}
                                isCurrent={plan.id === currentPlanId}
                                isLocked={!isUserLoggedIn}
                                t={t}
                            />
                        ))}
                        <Card className="flex flex-col shadow-none border-dashed border-primary/50 md:col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LineChart /> Business Consultation
                                </CardTitle>
                                <CardDescription>Get a custom market intelligence report for your specific needs.</CardDescription>
                                <div className="flex items-baseline gap-1 pt-2">
                                    <span className="text-3xl font-bold">$4,999</span>
                                    <span className="text-muted-foreground">one-time report</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground"><Feather className="h-4 w-4 mt-1 flex-shrink-0 text-primary/50" /><span>In-depth competitive analysis</span></li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground"><Feather className="h-4 w-4 mt-1 flex-shrink-0 text-primary/50" /><span>Market trend forecasting</span></li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground"><Feather className="h-4 w-4 mt-1 flex-shrink-0 text-primary/50" /><span>Target audience deep-dive</span></li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground"><Feather className="h-4 w-4 mt-1 flex-shrink-0 text-primary/50" /><span>Actionable growth strategies</span></li>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full" disabled={!isUserLoggedIn}>
                                    <Link href="/consultation">Inquire Now</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                         <div className="md:col-span-2 lg:col-span-3">
                            <DonationCard />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

export default function BillingPage() {
  return (
    <ClientOnly>
      <BillingPageInternal />
    </ClientOnly>
  );
}

    