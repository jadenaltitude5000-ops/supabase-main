
"use client"

import * as React from "react"
import { usePathname } from "next/navigation";
import { Briefcase, CreditCard, FileText, Fullscreen, Kanban, LayoutGrid, LineChart, ChevronsLeftRight, Radar, Send, Cog, TextCursorInput, User as UserIcon, Users, BookOpen, Shield, ShoppingBag } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useLanguage } from "@/context/language-context";
import { translations } from "@/lib/translations";
import { useUser } from "@/lib/supabase/provider";
import { LoadingLink } from "./loading-link";

const SidebarNavLink = ({
  href,
  isActive,
  tooltip,
  children,
  className,
}: {
  href: string;
  isActive: boolean;
  tooltip: string;
  children: React.ReactNode;
  className?: string;
}) => {
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    
    const button = (
        <Button
          asChild
          variant={"ghost"}
          className={cn(
              "justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-transparent",
              className,
              isActive && "text-sidebar-foreground",
              state === "collapsed" && "w-8 h-8 p-2 justify-center"
          )}
        >
          <LoadingLink href={href} loadingMessage={`Loading ${tooltip}...`}>
            {children}
          </LoadingLink>
        </Button>
    );

    if (!tooltip || state === 'expanded' || isMobile) {
        return button;
    }

    return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" align="center">
            {tooltip}
          </TooltipContent>
        </Tooltip>
    );
};


const TooltipButton = ({
  onClick,
  tooltip,
  children,
  className,
  disabled = false,
}: {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  tooltip: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  
  const buttonContent = (
    <Button
      variant="bleep"
      className={cn(
          "justify-start w-full",
          className,
          state === "collapsed" && "w-8 h-8 p-2 justify-center"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );

  if (!tooltip || state === 'expanded' || isMobile) {
    return buttonContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};


export function AppSidebar() {
  const pathname = usePathname();
  const { language, isHydrated } = useLanguage();
  const { user } = useUser();
  
  if (!isHydrated) {
    return null; 
  }

  const t = translations[language];

  const menuItems = [
    { href: "/professions", label: t.sidebarFeed, icon: TextCursorInput },
    { href: "/workmate-radar", label: t.sidebarWorkmateRadar, icon: Radar },
    { href: "/skill-sync-net", label: t.sidebarSkillSyncNet, icon: Briefcase },
    { href: "/boardrooms", label: "Boardrooms", icon: Send },
    { href: "/contracts", label: "Contracts", icon: FileText },
    { href: "/marketbase", label: "Marketbase", icon: ShoppingBag },
    { href: "/billing", label: t.sidebarBilling, icon: CreditCard },
  ];

  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const isActive = (href: string) => (href === "/" ? pathname === href : pathname.startsWith(href) && href !== "/");
  const { state, toggleSidebar } = useSidebar();
  
  return (
    <Sidebar variant="sidebar" collapsible="icon" side="left">
      <SidebarHeader>
        <div className="flex w-full items-center justify-between p-2">
            <div className="flex items-center gap-2 font-logo [&>span]:font-bold [&>span]:text-lg [&>span]:tracking-wide">
                <Kanban className="h-full" />
                <span className="font-logo duration-200 group-data-[collapsible=icon]:-ml-8 group-data-[collapsible=icon]:opacity-0">sentrybase</span>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <SidebarMenuItem key={item.href} className="group/item">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-sidebar-foreground opacity-0 transition-opacity duration-200 group-hover/item:opacity-100" />
                {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-sidebar-foreground animate-pulse" />
                )}
                <SidebarNavLink
                  href={item.href}
                  isActive={active}
                  tooltip={item.label}
                  className="w-full"
                >
                  <item.icon strokeWidth={1.5} />
                  <span className={cn("font-headline", state === "collapsed" && "hidden")}>{item.label}</span>
                </SidebarNavLink>
              </SidebarMenuItem>
            );
          })}
          {(user as any)?.isAdmin && (
             <SidebarMenuItem className="group/item">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-sidebar-foreground opacity-0 group-hover/item:opacity-100 transition-opacity duration-200" />
                 {isActive("/ad-studio") && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-sidebar-foreground animate-pulse" />
                )}
                <SidebarNavLink
                    href="/ad-studio"
                    isActive={isActive("/ad-studio")}
                    tooltip="Ad Studio"
                    className="w-full"
                >
                    <Shield strokeWidth={1.5} />
                    <span className={cn("font-headline", state === "collapsed" && "hidden")}>Ad Studio</span>
                </SidebarNavLink>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <TooltipButton
                    onClick={toggleSidebar}
                    tooltip={state === 'expanded' ? 'Collapse' : 'Expand'}
                >
                    <ChevronsLeftRight strokeWidth={1.5} />
                    <span className={cn("font-headline", state === "collapsed" && "hidden")}>{state === 'expanded' ? t.sidebarCollapse : t.sidebarExpand}</span>
                </TooltipButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <TooltipButton
                    onClick={toggleFullscreen}
                    tooltip={isFullscreen ? t.sidebarExitFullscreen : t.sidebarFullscreen}
                >
                    <Fullscreen strokeWidth={1.5} />
                    <span className={cn("font-headline", state === "collapsed" && "hidden")}>{isFullscreen ? t.sidebarExitFullscreen : t.sidebarFullscreen}</span>
                </TooltipButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="group/item">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-sidebar-foreground opacity-0 group-hover/item:opacity-100 transition-opacity duration-200" />
                {isActive("/admin") && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-sidebar-foreground animate-pulse" />
                )}
                <SidebarNavLink
                  href="/admin"
                  isActive={isActive("/admin")}
                  tooltip={t.settings}
                  className="w-full"
                >
                  <Cog strokeWidth={1.5} />
                  <span className={cn("font-headline", state === "collapsed" && "hidden")}>Admin</span>
              </SidebarNavLink>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
