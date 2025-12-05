
"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AgentProvider } from "@/context/agent-context";
import { LanguageProvider } from "@/context/language-context";
import { LoadingProvider } from "@/context/loading-context";
import { ThemeProvider } from "@/context/theme-context";
import { SupabaseProvider } from "@/lib/supabase/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SupabaseProvider>
          <LoadingProvider>
            <AgentProvider>
                <SidebarProvider>
                {children}
                </SidebarProvider>
            </AgentProvider>
          </LoadingProvider>
        </SupabaseProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
