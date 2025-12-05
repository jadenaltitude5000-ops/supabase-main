

"use client";

import React, { useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/sidebar";
import { GlobalSearch } from "@/components/layout/global-search";
import { useSidebar } from "@/components/ui/sidebar";
import { ClientOnly } from "@/components/layout/client-only";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/lib/supabase/provider";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { ArrowRight, Bell, Kanban, Radar, Send, TextCursorInput, Briefcase, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { LoadingContext } from "@/context/loading-context";
import { WelcomeAnimation } from "@/components/features/welcome/WelcomeAnimation";
import { PresenceManager } from "@/components/features/presence/PresenceManager";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { NotificationsPanel } from "./global-search";
import { LoadingLink } from "./loading-link";

export const MainScrollContext = React.createContext<React.RefObject<HTMLDivElement> | null>(null);

function MobileBottomNav() {
    const pathname = usePathname();
    const navItems = [
        { href: "/skill-sync-net", icon: Briefcase, label: "Sync Net" },
        { href: "/workmate-radar", icon: Radar, label: "Radar" },
        { href: "/professions", icon: TextCursorInput, label: "Professions" },
        { href: "/boardrooms", icon: Send, label: "Boardrooms" },
        { href: "/marketbase", icon: ShoppingBag, label: "Marketbase" },
    ];
    
    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden h-14 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-full">
                {navItems.map(item => (
                    <LoadingLink 
                        key={item.href} 
                        href={item.href} 
                        className={cn("flex flex-col items-center justify-center h-full w-full", pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground")}
                        loadingMessage={`Loading ${item.label}...`}
                    >
                        <item.icon className="h-5 w-5" strokeWidth={1.5} />
                    </LoadingLink>
                ))}
            </div>
        </div>
    )
}

function UnauthenticatedAccessPlaceholder() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>
            You need to be logged in to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Please sign in to continue or create an account to join our
            community of professionals.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-4 sm:flex-row">
          <Button asChild className="w-full">
            <Link href="/signin">Sign In <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/signup">Create Account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { state: sidebarState } = useSidebar();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const LayoutComponent = 'div';
  const layoutProps = isMobile ? {
      className: "flex flex-col h-screen" 
  } : {
      className: cn(
          "grid h-screen", // Ensure the grid takes up the full screen height
          "transition-[grid-template-columns] duration-300 ease-in-out",
          sidebarState === 'collapsed' ? "grid-cols-[auto_1fr]" : "grid-cols-[16rem_1fr]"
      )
  };
  
  return (
    <>
    <PresenceManager />
    <WelcomeAnimation />
    <LayoutComponent {...layoutProps}>
      <AppSidebar />
      {/* This container will hold the search bar and the main scrollable content */}
      <div className="flex flex-col overflow-hidden relative">
        <GlobalSearch />
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-transparent">
            <MainScrollContext.Provider value={scrollRef}>
            {children}
            </MainScrollContext.Provider>
        </div>
        <MobileBottomNav />
      </div>
    </LayoutComponent>
    </>
  );
}

export function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  
  const publicPages = ['/', '/signin', '/signup', '/logout', '/waitlist-confirmation', '/donate', '/faq', '/contracts/blueprint', '/skill-sync-net/code', '/workmate-radar/manifesto', '/keynote'];
  const isPublicPage = publicPages.includes(pathname) || pathname.startsWith('/u/');

  React.useEffect(() => {
    if (!isUserLoading && !user && !isPublicPage) {
      router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isUserLoading, user, isPublicPage, pathname, router]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <UnauthenticatedAccessPlaceholder />;
  }

  return (
      <ClientOnly>
        <AppLayoutContent>
            {children}
        </AppLayoutContent>
      </ClientOnly>
  )
}
