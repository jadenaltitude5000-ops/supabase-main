
'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FreelancerManifestoPage() {
    const router = useRouter();

    const sections = [
        {
            title: "1. Your Profile is Your Foundation. Build it Strong.",
            content: "Your profile is the bedrock of your SentryBase presence. It must instantly communicate the value and security you bring to a client. Lead with the solution, not the service. Instead of 'I write copy,' say 'I write landing page copy that converts visitors into customers.' Showcase proof, not just promise. Use case studies with hard numbers. 'Helped Client X increase trial sign-ups by 30% in 60 days.' Declare your specialty. 'I partner with fintech startups needing clear, compliant UX writing.' This filters out the noise and attracts your ideal client."
        },
        {
            title: "2. Guard Your Time. Vet Every Inquiry.",
            content: "A sentry doesn't let just anyone past the gate. Your time is your most valuable, non-renewable resource. Protect it fiercely. In your first conversation, qualify the lead by asking: 'What does success for this project look like?' 'What is the allocated budget for this work?' 'What is your decision-making process?' Vague answers are a red flag. Polite disengagement is your right."
        },
        {
            title: "3. Secure Your Commitment. Always Require a Deposit.",
            content: "This is the most critical rule for a secure business. A deposit (30-50%) is the foundation of a professional relationship. It proves the client is invested and secures your time and resources. No deposit. No work. No exceptions. This isn't about distrust; it's about establishing a professional standard from day one."
        },
        {
            title: "4. Build Proposals on Trust. Be Clear and Firm.",
            content: "Your proposal is the blueprint for the project. It eliminates ambiguity and sets clear expectations. A strong proposal includes: Scope of Work, Deliverables, Timeline, Investment, and Terms. When a client questions your price, don't flinch. Say, 'That's the investment for the full scope we discussed. If the budget is a concern, we can adjust the deliverables to fit.'"
        },
        {
            title: "5. Define Your Defenses. Annihilate Scope Creep.",
            content: "'Could you just...' is the Trojan horse of freelancing. Your proposal is your city wall. Anything outside the walls is an add-on. Be specific in your scope. Have a process for changes. 'That's a great idea. It falls outside the original scope, but I can send you a separate quote for that new feature.' Document everything. Get changes approved in writing on SentryBase. Your message history is your shield."
        },
        {
            title: "6. Maintain a Clear Signal. Communicate with Purpose.",
            content: "A sentry reports back regularly. You must do the same. Proactive communication builds immense trust and prevents anxiety. Send regular updates. Never miss a deadline without warning. Invoice professionally and promptly."
        },
        {
            title: "7. Fortify Your Reputation. It's Your Strongest Asset.",
            content: "Your reputation is the fortress that will bring clients to you. Build it brick by brick. Actively request testimonials. Be a connector in Mainstream. Our social hub, Mainstream, is your opportunity to build alliances. Share your expertise. Answer questions, post insights, and position yourself as an expert. A strong reputation attracts better clients and higher rates."
        }
    ];

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-3xl">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">The SentryBase Code</h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        A Freelancer's Guide to Building a Secure Business
                    </p>
                </header>
                
                <div className="prose prose-lg dark:prose-invert mx-auto">
                    <p className="lead">
                       Welcome to SentryBase. This isn't just another freelance platform; it's your secure base of operations. We built SentryBase on the principles of trust, clarity, and professional strength. To thrive here, you need to operate like a sentry for your own business: vigilant, prepared, and always building a stronger foundation. Here is your code.
                    </p>
                    
                    <div className="space-y-6 mt-8">
                        {sections.map((section, index) => (
                            <div key={index}>
                                <h2 className="text-2xl font-semibold">{section.title}</h2>
                                <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{section.content}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Previous Page
                    </Button>
                </div>
            </div>
        </div>
    );
}
