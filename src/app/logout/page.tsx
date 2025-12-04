
"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, BrainCircuit, Feather, Mic, Newspaper, Radar, Send, Zap, Kanban } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/firebase";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LogoutPage() {
  const auth = useAuth();

  useEffect(() => {
    if (auth) {
      signOut(auth);
    }
  }, [auth]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border border-black text-center">
        <CardHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-transparent">
                <Kanban className="size-7 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tighter">You're Logged Out</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
                Your next opportunity is just a click away.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="flex w-full flex-col sm:flex-row gap-4">
              <Button asChild className="w-full" size="lg">
                <Link href="/signin">Log Back In <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/signup">Create an Account</Link>
              </Button>
            </div>
        </CardContent>
        <CardFooter className="justify-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                Return to Homepage
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
