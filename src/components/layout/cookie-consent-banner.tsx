
'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, Cookie, Cog } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export type ConsentSettings = {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
};

export function CookieSettingsDialog({ onSave, initialSettings }: { onSave: (settings: ConsentSettings) => void, initialSettings?: ConsentSettings }) {
    const [settings, setSettings] = useState<ConsentSettings>(initialSettings || {
        essential: true,
        analytics: false,
        marketing: false,
    });

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Customize Cookie Preferences</DialogTitle>
                <DialogDescription>
                    You can manage your cookie preferences below. Essential cookies are required for the site to function.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="essential-cookies" className="text-base">Essential Cookies</Label>
                        <p className="text-sm text-muted-foreground">
                            These cookies are necessary for the website to function and cannot be switched off.
                        </p>
                    </div>
                    <Switch id="essential-cookies" checked={true} disabled />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="analytics-cookies" className="text-base">Analytics Cookies</Label>
                         <p className="text-sm text-muted-foreground">
                            These cookies allow us to count visits and traffic sources so we can measure and improve performance.
                        </p>
                    </div>
                    <Switch
                        id="analytics-cookies"
                        checked={settings.analytics}
                        onCheckedChange={(checked) => setSettings(s => ({...s, analytics: checked}))}
                    />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="marketing-cookies" className="text-base">Marketing Cookies</Label>
                        <p className="text-sm text-muted-foreground">
                            These cookies may be set through our site by our advertising partners to build a profile of your interests.
                        </p>
                    </div>
                    <Switch
                        id="marketing-cookies"
                        checked={settings.marketing}
                        onCheckedChange={(checked) => setSettings(s => ({...s, marketing: checked}))}
                    />
                </div>
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" onClick={() => onSave(settings)}>Save Preferences</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}


export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // This now runs only on the client, after the initial render.
    const consent = Cookies.get('sentrybase-cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);
  
  const handleSavePreferences = (settings: ConsentSettings) => {
    Cookies.set('sentrybase-cookie-consent', JSON.stringify(settings), { expires: 365 });
    setShowBanner(false);
  }

  const handleAcceptAll = () => {
    const allSettings: ConsentSettings = {
        essential: true,
        analytics: true,
        marketing: true,
    };
    handleSavePreferences(allSettings);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md">
      <Card className="bg-background/80 backdrop-blur-md">
        <CardHeader>
            <div className="flex items-center gap-3">
                <Cookie className="h-6 w-6" />
                <CardTitle>We Value Your Privacy</CardTitle>
            </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can customize your preferences.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Cog className="h-5 w-5 mr-2" />
                        Custom
                    </Button>
                </DialogTrigger>
                <CookieSettingsDialog onSave={handleSavePreferences} />
            </Dialog>
            <Button size="sm" onClick={handleAcceptAll}>
                <Check className="mr-2 h-4 w-4" />
                Accept All
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
