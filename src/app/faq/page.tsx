
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const faqData = {
  "General": [
    {
      question: "What is Sentrybase?",
      answer: "Sentrybase is an AI-powered networking and collaboration platform designed for creative professionals, freelancers, and businesses. Our goal is to help you build your dream team, find exciting projects, and enhance your professional skills."
    },
    {
      question: "Who is Sentrybase for?",
      answer: "Sentrybase is for developers, designers, writers, marketers, project managers, and any professional in the creative and tech industries. It's also for businesses of all sizes looking to hire top-tier freelance talent for their projects."
    },
    {
      question: "How is Sentrybase different from other professional networking sites?",
      answer: "Sentrybase differentiates itself through its deep integration of AI. Features like the AI Workmate Radar for team building and Skill Sync Net for project matching go beyond simple keyword searches to provide intelligent, context-aware recommendations."
    },
    {
      question: "Is Sentrybase free to use?",
      answer: "Sentrybase will offer a tiered subscription model, including a free tier with core functionalities and premium tiers with advanced features, increased limits, and access to exclusive tools."
    }
  ],
  "AI Features": [
    {
      question: "How does the AI Workmate Radar work?",
      answer: "The AI Workmate Radar analyzes your profile, skills, and project descriptions to suggest ideal collaborators. It looks for complementary skills and compatible working styles to help you build a well-rounded and effective team."
    },
    {
      question: "What is Skill Sync Net?",
      answer: "Skill Sync Net is our intelligent marketplace. For businesses, it finds the most suitable freelancer for a project based on a detailed brief. For freelancers, it scans the market for projects that perfectly match their skills and experience, eliminating the need for manual searching."
    },
    {
      question: "Can the AI help me write posts?",
      answer: "Yes! Our platform includes AI-powered tools to help you create better content. The Post Analyzer provides feedback on your drafts, while the Conversation Starters give you ideas to spark engagement on your feed."
    },
    {
      question: "Is my data used to train the AI?",
      answer: "We prioritize user privacy. Your personal data and private conversations are not used to train our models. We use anonymized and aggregated data to improve our services, always in compliance with strict privacy standards."
    }
  ],
  "Workspaces": [
    {
      question: "What are Workspaces?",
      answer: "Workspaces are collaborative, real-time environments for deep work. You can start a solo focus session to track your time and productivity, or create a team workspace to collaborate with others via video call, chat, and shared tools."
    },
    {
      question: "Can I record a session in a Workspace?",
      answer: "Yes, team workspaces include a recording feature, allowing you to save your sessions for later review or for team members who couldn't attend."
    },
    {
      question: "How many people can join a Team Workspace?",
      answer: "Our Team Workspaces support up to 15 participants, making them suitable for small team meetings, brainstorming sessions, and collaborative work sprints."
    },
     {
      question: "Can I share my screen in a Workspace?",
      answer: "Absolutely. Screen sharing is a core feature of Team Workspaces, allowing for seamless presentations, code reviews, and design walkthroughs."
    },
    {
      question: "How does video and audio work in Sentrybase Meetings?",
      answer: "Video and audio streams are handled peer-to-peer using WebRTC, with signaling managed by Firebase Realtime Database for maximum speed and privacy. There are no external APIs involved."
    },
    {
      question: "How can I structure my meeting?",
      answer: "You can define a clear meeting agenda beforehand. During the call, you can link notes directly to agenda items, creating actionable, real-time minutes for all participants."
    },
    {
      question: "Can I create tasks during a meeting?",
      answer: "Yes. You can turn discussion into action by creating tasks, assigning them to participants, and tracking their status directly within the meeting room interface."
    },
    {
      question: "What controls do I have as a meeting host?",
      answer: "Hosts can manage the meeting flow with powerful tools like 'Mute All', 'Lock Meeting', 'Kick Participant', and a 'Raise Hand' feature, all synced instantly with Firestore."
    }
  ],
  "Profile & Networking": [
    {
      question: "How can I make my profile stand out?",
      answer: "Complete your profile thoroughly! Add a clear headline, a detailed bio, list all your relevant skills, and upload high-quality portfolio items. A complete and polished profile is more likely to be discovered and matched by our AI."
    },
    {
      question: "How does connecting with others work?",
      answer: "You can discover other professionals through our AI Workmate Radar, get recommendations on your Mainstream feed, or find them via their content. You can then send connection requests to build your professional network."
    },
    {
      question: "What is the benefit of verifying my position?",
      answer: "Verifying your current job adds a badge of authenticity to your profile. It enhances trust and credibility, showing others that your stated experience is confirmed."
    },
    {
      question: "Can I customize my profile URL?",
      answer: "This feature is on our roadmap! We plan to allow premium users to create a custom, vanity URL for their Sentrybase profile."
    }
  ],
};

export default function FAQPage() {
  const router = useRouter();

  return (
    <div className="bg-background min-h-screen">
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                Have questions? We've got answers.
                </p>
            </header>

            <div className="mx-auto">
                {Object.entries(faqData).map(([category, qas]) => (
                <div key={category} className="mb-8">
                    <h2 className="mb-4 text-2xl font-semibold tracking-tight border-b pb-2">{category}</h2>
                    <Accordion type="single" collapsible className="w-full">
                    {qas.map((qa, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">{qa.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {qa.answer}
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </div>
                ))}
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
