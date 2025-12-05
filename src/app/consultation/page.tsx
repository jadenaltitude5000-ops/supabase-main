
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser, useSupabase } from '@/lib/supabase-client';
import { ClientOnly } from '@/components/layout/client-only';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

const consultationTemplate = `
1. Business Overview:
What does your business do?
Who are your primary customers?
What is your unique value proposition?

2. Current Challenges:
What specific problem are you trying to solve?
What obstacles are you facing in your market?
Who are your main competitors?

3. Goals & Objectives:
What do you hope to achieve with this market intelligence report?
What specific questions do you need answered? (e.g., "Is there a market for X?", "How should we price Y?", "Who are our top 3 competitor's weaknesses?")

4. Target Market Details:
Describe your ideal customer profile in more detail.
Are you entering a new market or expanding in an existing one?
`.trim();

function ConsultationPageInternal() {
  const { toast } = useToast();
  const { user: authUser } = useUser();
  const supabase = useSupabase();
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = message.trim() && businessName.trim() && businessEmail.trim() && industry && companySize;

  const handleSubmit = async () => {
    if (!isFormValid || !authUser || !supabase) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out all required fields.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
        const { error } = await supabase.from('sales_inquiries').insert({
            user_id: authUser.id,
            user_name: authUser.user_metadata.full_name,
            user_email: authUser.email,
            business_name: businessName,
            business_email: businessEmail,
            phone_number: phoneNumber,
            industry,
            company_size: companySize,
            message,
            type: 'Consultation Request',
        });

        if (error) throw error;

        toast({
            title: 'Inquiry Sent',
            description: 'Our team has received your request and will be in touch shortly.',
        });
        
        // Reset form
        setBusinessName('');
        setBusinessEmail('');
        setPhoneNumber('');
        setIndustry('');
        setCompanySize('');
        setMessage('');

    } catch(error: any) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Submission Error',
            description: error.message || 'There was a problem submitting your inquiry. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
          <h1 className="font-headline text-4xl font-light tracking-tight">Business Consultation</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Request a custom market intelligence report tailored to your specific needs.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Inquiry Form</CardTitle>
            <CardDescription>Tell us about your business and your goals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input id="business-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Company, Inc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-email">Business Email</Label>
                <Input id="business-email" type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="work@yourcompany.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., SaaS, E-commerce, Healthcare" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="company-size">Company Size</Label>
                    <Select value={companySize} onValueChange={setCompanySize}>
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
              <Label htmlFor="phone-number">Phone Number (Optional)</Label>
              <Input id="phone-number" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="requirements">
                  Your Requirements & Goals
                </Label>
                <Button variant="link" size="sm" onClick={() => setMessage(consultationTemplate)}>
                  Use Template
                </Button>
              </div>
              <Textarea
                id="requirements"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your business, the challenges you're facing, and what you hope to achieve with a market intelligence report. Please be as detailed as possible."
                className="min-h-[150px]"
              />
            </div>
             <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ConsultationPage() {
    return (
        <ClientOnly>
            <ConsultationPageInternal />
        </ClientOnly>
    );
}

    