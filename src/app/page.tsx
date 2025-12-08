
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit, Feather, Radar, Zap, FileText, Send, Newspaper, Ellipsis, LineChart, PlayCircle, User, Briefcase, Check, Code, Brush, BarChart2, DollarSign, Wrench, Users, Search, Heart, MessageCircle, Repeat, Kanban } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LoadingContext } from '@/context/loading-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LoadingLink } from '@/components/layout/loading-link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, useInView, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ParticleNetwork, type Rect } from '@/components/features/landing/particle-network';

export const dynamic = 'force-dynamic'

const features = [
  {
    icon: <Radar className="h-6 w-6 text-black" strokeWidth={1} />,
    title: 'AI Workmate Radar',
    description: 'Find the perfect collaborators to build your dream team.',
    link: '/workmate-radar',
  },
  {
    icon: <Zap className="h-6 w-6 text-black" strokeWidth={1} />,
    title: 'Skill Sync Net',
    description: 'Get matched with opportunities that align with your expertise.',
    link: '/skill-sync-net',
  },
  {
    icon: <BrainCircuit className="h-6 w-6 text-black" strokeWidth={1} />,
    title: 'Agentic Workflow',
    description: 'Leverage our AI agent for analysis, talent sourcing, and insights.',
    link: '/professions',
  },
  {
    icon: <Send className="h-6 w-6 text-black" strokeWidth={1} />,
    title: 'Collaborative Boardrooms',
    description: 'Real-time project rooms with chat, file sharing, and task management.',
    link: '/boardrooms',
  },
  {
    icon: <FileText className="h-6 w-6 text-black" strokeWidth={1} />,
    title: 'Secure Contracts',
    description: 'Create, manage, and sign professional agreements directly on the platform.',
    link: '/contracts',
  },
  {
    icon: <Newspaper className="h-6 w-6 text-black" strokeWidth={1} />,
    title: 'Professions Feed',
    description: 'A professional feed to share insights, post opportunities, and build your network.',
    link: '/professions',
  },
  {
    icon: <LineChart className="h-6 w-6 text-black" strokeWidth={1} />,
    title: 'Business Consultations',
    description: 'We offer business consultations with actionable market intelligence.',
    link: '/consultation',
  },
];

const trendingNiches = [
    { name: "AI & Machine Learning", rate: "$75–$250", description: "Developing AI tools, automation scripts, and ML models; includes prompt engineering and AI integration for businesses. Booming due to AI's rapid adoption across industries." },
    { name: "Digital Marketing & SEO", rate: "$50–$150", description: "SEO optimization, social media management, email campaigns, and content strategy. High demand from e-commerce and B2B firms scaling online presence." },
    { name: "Content Writing & Copywriting", rate: "$40–$200", description: "Blog posts, SaaS/product descriptions, ghostwriting, and e-commerce copy. Evergreen need for SEO-optimized content, with niches like health/wellness and tech paying premium. $40–$200" },
    { name: "Web & App Development", rate: "$60–$200", description: "Building websites, mobile apps, no-code solutions (e.g., using Bubble or Adalo), and SaaS platforms. Driven by digital transformation and custom software needs." },
    { name: "Graphic Design & UI/UX", rate: "$50–$150", description: "Visual branding, website interfaces, and user experience design. Essential for apps and marketing materials in a visually competitive digital space." },
    { name: "Video Editing & Scriptwriting", rate: "$50–$150", description: "Short-form videos (Reels, TikTok), product demos, and scripts for YouTube/SaaS. Exploding with video expected to dominate 82% of internet traffic." },
    { name: "Business Consulting", rate: "$100–$300", description: "Strategy for digital ops, financial planning, and efficiency audits. Valued for expertise in high-growth areas like e-commerce and remote teams." },
    { name: "Data Analytics", rate: "$60–$180", description: "Analyzing business data for insights, dashboards, and decision-making tools. Rising with data-driven strategies in every sector." },
    { name: "Virtual Assistance & Project Management", rate: "$30–$80", description: "Admin tasks, CRM handling, and team coordination. Popular for busy entrepreneurs outsourcing routine work." },
    { name: "Cybersecurity", rate: "$100–$300", description: "Vulnerability assessments, compliance audits, and security strategies. Critical amid rising cyber threats and digital shifts." },
];

function AnimatedNumber({ value }: { value: number }) {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });
    const spring = useSpring(isInView ? value : 0, {
      damping: 100,
      stiffness: 100,
    });
    const display = useTransform(spring, (current) =>
      Math.round(current).toLocaleString()
    );
  
    React.useEffect(() => {
      spring.set(isInView ? value : 0);
    }, [spring, isInView, value]);
  
    return <motion.span ref={ref}>{display}</motion.span>;
}

function AnimatedProfileCard() {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    const skills = [
        { icon: <ArrowRight className="h-4 w-4 text-white/50" />, text: "React & Next.js" },
        { icon: <ArrowRight className="h-4 w-4 text-white/50" />, text: "UI/UX Design" },
        { icon: <ArrowRight className="h-4 w-4 text-white/50" />, text: "Marketing Analytics" },
    ];

    const cardVariants = {
        hidden: { opacity: 0, x: -50, rotate: -5 },
        visible: {
            opacity: 1,
            x: 0,
            rotate: -3,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };
    
    const listVariants = {
        visible: {
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
    };

    return (
        <motion.div
            ref={ref}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex-1"
        >
             <Card className="w-full transform -rotate-3 transition-all duration-300 hover:rotate-0 hover:scale-105 h-full bg-black border-white/20 text-white font-mono">
                <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center gap-2"><User className="h-5 w-5" /> Your Profile</CardTitle>
                    <p className="text-xs text-white/60 pt-1">The system analyzes your strongest skills.</p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <motion.div className="space-y-3" variants={listVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
                        {skills.map((skill, index) => (
                             <motion.div key={index} className="flex items-center gap-2 text-sm" variants={itemVariants}>
                                 {skill.icon} <span>{skill.text}</span>
                             </motion.div>
                        ))}
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function AnimatedProjectMatchCard() {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const title = `"Redesign marketing analytics dashboard"`;
    const budget = 15000;
    const matchScore = 95;

    return (
         <div ref={ref} className="flex-1">
            <Card className="w-full transform rotate-3 transition-all duration-300 hover:rotate-0 hover:scale-105 h-full bg-black border-white/20 text-white font-mono">
                <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-5 w-5" /> Project Match</CardTitle>
                     <p className="text-xs text-white/60 pt-1">
                        {isInView ? title.split("").map((char, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.05, delay: i * 0.03 }}
                            >
                                {char}
                            </motion.span>
                        )) : <span>{title}</span>}
                    </p>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                     <p className="text-sm text-white/80">Budget: <span className="font-semibold text-white">$<AnimatedNumber value={budget} /></span></p>
                     <p className="text-sm text-white/80">Timeline: <span className="font-semibold text-white">6 Weeks</span></p>
                     <div className="space-y-1">
                        <p className="text-xs font-semibold">Match Score: {isInView ? <AnimatedNumber value={matchScore} /> : 0}%</p>
                        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="bg-green-400 h-2 rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: isInView ? `${matchScore}%` : '0%' }}
                                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                            />
                        </div>
                     </div>
                </CardContent>
            </Card>
        </div>
    )
}

const slides = [
  {
    id: 'vision',
    title: 'The Sentrybase Vision',
    description: 'A professional network where merit, skill, and collaboration are the primary currencies, powered by intelligent tools that eliminate friction and unlock human potential.',
    visual: () => (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="relative flex items-center justify-center w-64 h-64">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div
            className="absolute inset-0 origin-center animate-spin"
            style={{
              animationDuration: '10s',
              background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.1) 70%, transparent 71%)',
              maskImage: 'conic-gradient(from 0deg, transparent 0%, black 5%, black 20%, transparent 25%)',
              animationTimingFunction: 'linear',
            }}
          />
          <Kanban className="h-16 w-16 text-white" strokeWidth={1} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-1"><Code className="h-8 w-8 text-white" strokeWidth={1} /></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-2"><Brush className="h-8 w-8 text-white" strokeWidth={1} /></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-3"><BarChart2 className="h-8 w-8 text-white" strokeWidth={1} /></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-4"><User className="h-8 w-8 text-white" strokeWidth={1} /></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-5"><DollarSign className="h-8 w-8 text-white" strokeWidth={1} /></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-6"><Wrench className="h-8 w-8 text-white" strokeWidth={1} /></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-7"><Users className="h-8 w-8 text-white" strokeWidth={1} /></div>
        </div>
      </div>
    ),
  },
  {
    id: 'radar',
    title: 'Workmate Radar: Build Your Dream Team',
    description: 'Describe your ideal collaborator—by skills, work style, and experience. Our algorithm analyzes profiles to find perfect matches, helping you build a high-performing, cohesive team.',
    visual: () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, amount: 0.5 });
        const containerVariants = {
            hidden: { opacity: 0, scale: 0.95 },
            visible: { 
                opacity: 1, 
                scale: 1,
                transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1, delayChildren: 0.2 } 
            }
        };
        const itemVariants = {
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 }
        };
        const matches = [
            { name: 'Elena Vance', score: '94.8', skills: 'UX RESEARCH, DATA ANALYSIS', location: 'BERLIN' },
            { name: 'Marcus Cole', score: '91.2', skills: 'BACKEND DEV, API DESIGN', location: 'LONDON' },
            { name: 'S. Ishikawa', score: '88.5', skills: 'MOTION DESIGN, 3D', location: 'TOKYO' },
        ];

        return (
            <motion.div
                ref={ref}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={containerVariants}
                className="w-full h-full flex items-center justify-center p-4 bg-black rounded-lg font-mono text-white"
            >
                <div className="w-full h-full border border-white/20 p-4 space-y-4">
                    <motion.div variants={itemVariants} className="flex justify-between items-center text-xs text-white/70">
                        <span>// SENTRYBASE RADAR //</span>
                        <span>STATUS: <span className="text-green-400">ONLINE</span></span>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2">
                        <span className="text-green-400">$</span>
                        <p>SCAN FOR "LEAD PRODUCT DESIGNER"</p>
                        <div className="w-2 h-4 bg-white animate-pulse ml-1" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="text-green-400 text-xs">
                        &gt; PROCESSING... 3 MATCHES FOUND.
                    </motion.div>
                    <div className="space-y-3 pt-2">
                         {matches.map((match, index) => (
                             <motion.div key={index} variants={itemVariants} transition={{ delay: index * 0.2 }}>
                                 <div className="grid grid-cols-4 gap-2 text-sm">
                                    <span className="col-span-2">{match.name}</span>
                                    <span>{match.score}</span>
                                    <span>{match.location}</span>
                                 </div>
                                 <p className="text-xs text-white/60">{match.skills}</p>
                             </motion.div>
                         ))}
                    </div>
                </div>
            </motion.div>
        );
    },
  },
  {
    id: 'skill-sync',
    title: 'Skill Sync Net: Find Your Next Project',
    description: "Our system scans the market for projects that perfectly match your skills, eliminating manual searches. For businesses, it pinpoints the most suitable talent for your needs.",
    visual: () => (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="flex w-full max-w-lg items-start justify-center gap-4">
            <AnimatedProfileCard />
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
            >
                <Search className="h-12 w-12 text-white shrink-0 animate-pulse mt-12" style={{ animationDuration: '2s' }} />
            </motion.div>
            <AnimatedProjectMatchCard />
        </div>
      </div>
    ),
  },
   {
    id: 'contracts',
    title: 'Secure Contracts: Built on Trust',
    description: "Create, manage, and sign professional agreements directly on the platform. Our system ensures clarity and security for both parties.",
    visual: () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, amount: 0.5 });
        const cardVariants = {
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
        };
        const listVariants = {
             visible: { transition: { staggerChildren: 0.3, delayChildren: 0.4 } }
        };
        const itemVariants = {
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
        };

        return (
          <motion.div 
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={cardVariants}
            className="w-full h-full flex items-center justify-center p-8">
              <Card className="w-full max-w-sm bg-black border-white/20 text-white font-mono">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><FileText className="h-6 w-6"/> Project Agreement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-white/70">
                    <p className="line-clamp-2">This agreement is made between [Client] and [Freelancer] for the development of a new e-commerce website, as per the agreed scope of work...</p>
                    <motion.div variants={listVariants}>
                        <motion.div className="flex items-center gap-2 pt-2" variants={itemVariants}>
                            <Check className="h-4 w-4 text-green-400" />
                            <span>Scope of Work Defined</span>
                        </motion.div>
                        <motion.div className="flex items-center gap-2" variants={itemVariants}>
                            <Check className="h-4 w-4 text-green-400" />
                            <span>Payment Terms Set</span>
                        </motion.div>
                    </motion.div>
                </CardContent>
                 <CardFooter className="flex justify-between">
                    <p className="text-xs text-white/50">Status: Pending Signature</p>
                    <Button disabled variant="outline" className="bg-black border-white/30 text-white/50">Sign Contract</Button>
                </CardFooter>
              </Card>
          </motion.div>
        );
    },
  },
  {
    id: 'feed',
    title: 'Professions Feed: Share Your Expertise',
    description: "A professional feed to share insights, post opportunities, and build your network. Our algorithm surfaces the most relevant content for you.",
    visual: () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, amount: 0.5 });
        const containerVariants = {
            visible: { transition: { staggerChildren: 0.3, delayChildren: 0.2 } }
        };
        const itemVariants = {
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
        };

        return (
            <motion.div 
                ref={ref}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={containerVariants}
                className="w-full h-full flex items-center justify-center p-8"
            >
                <div className="w-full max-w-sm space-y-4">
                    <motion.div variants={itemVariants}>
                        <Card className="bg-black border-white/20">
                            <CardHeader className="p-3 flex-row items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-400 border-2 border-black" />
                                <div>
                                    <p className="font-semibold text-sm text-white flex items-center gap-2">
                                        Jane Doe <Feather className="h-4 w-4 text-green-400" />
                                    </p>
                                    <p className="text-xs text-white/70">UI/UX Designer</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <p className="text-sm text-white/90">Just published a new case study on designing accessible data visualizations. Check it out! #UIUX #Accessibility</p>
                            </CardContent>
                             <CardFooter className="p-3 pt-2 text-xs text-white/60 flex gap-4">
                                <div className="flex items-center gap-1"><Heart className="h-4 w-4" /> 112</div>
                                <div className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> 18</div>
                                <div className="flex items-center gap-1"><Repeat className="h-4 w-4" /> 23</div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                     <motion.div variants={itemVariants}>
                        <Card className="bg-black border-white/20">
                             <CardHeader className="p-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-teal-400 border-2 border-black" />
                                    <div>
                                        <p className="font-semibold text-sm text-white">Acme Corp</p>
                                        <p className="text-xs text-white/70">Hiring Manager</p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-white/90 pt-3">Now Hiring: Senior Frontend Developer (Remote)</p>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                 <p className="text-sm text-white/90 line-clamp-2">We're looking for an experienced developer to join our team and help build the future of our analytics platform. Must have 5+ years with React & TypeScript.</p>
                            </CardContent>
                             <CardFooter className="p-3 pt-0">
                                <Button size="sm" variant="secondary" className="w-full bg-green-400/20 text-green-300 hover:bg-green-400/30">View Opportunity</Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        );
    },
  },
  {
    id: 'agentic-ai',
    title: 'Agentic AI: Your Personal Analyst',
    description: "Leverage our AI agent for deep analysis, talent sourcing, and market insights. Ask complex questions, get actionable answers.",
    visual: () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, amount: 0.5 });
        const cardVariants = {
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
        };
        const itemVariants = {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        };
        
        return (
           <motion.div 
                ref={ref}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={cardVariants}
                className="w-full h-full flex items-center justify-center p-8"
            >
               <Card className="w-full max-w-md bg-black border-white/20 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-mono"><BrainCircuit className="h-5 w-5 text-green-400" /> Agentic Workflow</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 font-mono">
                        <motion.div 
                            variants={itemVariants} 
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="p-3 rounded-md bg-white/10 text-right"
                        >
                            <p className="text-sm">"Find me three senior TypeScript developers in Germany who have experience with financial apps."</p>
                        </motion.div>
                         <motion.div 
                            variants={itemVariants} 
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="p-3 rounded-md bg-green-400/20 text-green-300"
                        >
                            <p className="text-sm">Analyzing user data... Cross-referencing skills, location, and project history... Found 3 high-confidence matches.</p>
                        </motion.div>
                    </CardContent>
               </Card>
           </motion.div>
        );
    },
  },
  {
    id: 'boardrooms',
    title: 'Collaborative Boardrooms',
    description: 'Move beyond endless email chains. Our boardrooms are real-time project hubs with integrated chat, file sharing, and task management to keep your team aligned and productive.',
     visual: () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, amount: 0.5 });
        const cardVariants = {
            hidden: { opacity: 0, y: 50, rotate: 3 },
            visible: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.6, ease: "easeOut" } }
        };
        const messageVariants = {
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
        };

        return (
            <motion.div 
                ref={ref}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={cardVariants}
                className="w-full h-full flex items-center justify-center p-8"
            >
                <Card className="w-full max-w-sm bg-black border-white/20 text-white">
                    <CardHeader className="p-3 flex-row items-center justify-between">
                        <CardTitle className="text-base font-mono">Project Phoenix</CardTitle>
                        <div className="flex -space-x-2">
                            <div className="h-8 w-8 rounded-full bg-teal-500 border-2 border-black" />
                            <div className="h-8 w-8 rounded-full bg-indigo-500 border-2 border-black" />
                            <div className="h-8 w-8 rounded-full bg-rose-500 border-2 border-black" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-3 font-mono">
                        <motion.p variants={messageVariants} transition={{ delay: 0.4, duration: 0.4 }} className="text-sm p-2 rounded-md bg-white/10">Hey team, the new designs from Jane are in. Let's review them on the call this afternoon.</motion.p>
                        <motion.p variants={messageVariants} transition={{ delay: 0.8, duration: 0.4 }} className="text-sm p-2 rounded-md bg-green-400/20 text-green-300 ml-auto w-fit">Looks great! Approved. I'll start building the components.</motion.p>
                         <motion.p variants={messageVariants} transition={{ delay: 1.2, duration: 0.4 }} className="text-sm p-2 rounded-md bg-white/10">Perfect. I've added the component tasks to the board.</motion.p>
                    </CardContent>
                    <CardFooter className="p-3 border-t border-white/20">
                        <div className="flex items-center w-full gap-2">
                            <Input placeholder="Type a message..." className="h-8 bg-black border-white/20 text-white" disabled />
                            <Button size="sm" disabled><Send className="h-4 w-4" /></Button>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        );
    },
  },
  {
    id: 'get-started',
    title: 'Get Started: Unlock Your Potential',
    description: "Sentrybase streamlines building teams and finding work, letting you focus on what you do best. Sign up to connect with the right people and projects.",
     visual: () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, amount: 0.5 });
        const containerVariants = {
            hidden: { opacity: 0 },
            visible: { 
                opacity: 1, 
                transition: { 
                    duration: 0.5, 
                    delay: 0.2,
                    staggerChildren: 0.3,
                }
            }
        };
        const itemVariants = {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
        };

        return (
           <motion.div
                ref={ref}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={containerVariants}
                className="w-full h-full flex items-center justify-center p-8"
            >
              <div className="text-center font-mono">
                <motion.h3 variants={itemVariants} className="text-2xl font-bold text-white">Your Next Opportunity Awaits</motion.h3>
                <motion.p variants={itemVariants} className="text-white/80 mt-2">Join the leading professions network built on merit and collaboration.</motion.p>
                <motion.p variants={itemVariants} className="text-white/60 mt-4 text-lg">700,000,000 / 1.5bn freelancers</motion.p>
                <motion.div variants={itemVariants} className="mt-6">
                    <Button 
                        variant="link" 
                        className="text-green-400 text-lg group" 
                        onClick={() => (window.location.href = '/signup')}
                    >
                        Get Started Now
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </motion.div>
              </div>
           </motion.div>
        );
    },
  },
];

function ProductDemoSection() {
    return (
        <section className="bg-black py-20 md:py-28 text-white font-mono">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl tracking-tight sm:text-5xl text-green-400">
                        <span className="text-white">// </span>Product Demo
                    </h2>
                    <p className="mt-4 text-lg text-white">
                        Take a quick tour of our core features. See how Sentrybase streamlines collaboration and creates opportunities.
                    </p>
                </div>
                <div className="mt-20 space-y-24">
                    {slides.map((slide) => (
                        <div key={slide.id} className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
                            <div className="space-y-4 border border-white/20 p-6 md:sticky md:top-28">
                                <h3 className="text-3xl tracking-tight text-green-400">
                                    <span className="text-white">// </span>{slide.title}
                                </h3>
                                <p className="text-lg text-white">{slide.description}</p>
                            </div>
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className="h-[60vh] min-h-[500px] flex items-center justify-center border border-white/20"
                                >
                                    <slide.visual />
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const TerminalCursor = ({ className }: { className?: string }) => {
    return <span className={cn("animate-pulse", className)}>|</span>
};

export default function Home() {
  const router = useRouter();
  const { showLoader } = React.useContext(LoadingContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState('Performing...');
  const [dots, setDots] = React.useState('');
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | null>(null);

  const [keynoteVisited, setKeynoteVisited] = React.useState(false);
  const [learnMoreVisited, setLearnMoreVisited] = React.useState(false);

  // New state for hero section content dimensions
  const contentRef = useRef<HTMLDivElement>(null);
  const [restrictedAreas, setRestrictedAreas] = useState<Rect[]>([]);

  useEffect(() => {
    const updateRects = () => {
      const areas: Rect[] = [];
      if (contentRef.current) {
        areas.push(contentRef.current.getBoundingClientRect());
      }
      setRestrictedAreas(areas);
    };

    updateRects();
    window.addEventListener('resize', updateRects);
    return () => window.removeEventListener('resize', updateRects);
  }, []);


   React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev.length >= 3) return '.';
          return prev + '.';
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

   if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex h-screen w-full items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 text-white">
          <Feather className="h-10 w-10 animate-pulse" />
          <p className="font-logo tracking-widest text-lg">
            {loadingMessage}
            <span className="w-6 inline-block text-left">{dots}</span>
          </p>
        </div>
      </div>
    );
  }

  // Show landing page if user is not logged in
  return (
    <div className="bg-white text-black">
      <main>
        {/* Hero Section */}
        <section className="relative flex h-[80vh] min-h-[600px] w-full flex-col items-center justify-center overflow-hidden bg-black text-white">
           <ParticleNetwork restrictedAreas={restrictedAreas} />
           <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:p-8">
            <div className="flex items-center gap-4">
               <Kanban className="size-8 text-white" />
               <span className="font-logo text-2xl tracking-tighter text-white hidden sm:inline-block">Sentrybase</span>
            </div>
            <div className="flex items-center justify-start gap-2 sm:gap-4">
                <LoadingLink href="/signup" loadingMessage="Registering..." className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 underline-offset-4 hover:underline text-white h-8 px-3 sm:h-10 sm:px-4 sm:py-2">
                    <span className="flex items-center">
                    <TerminalCursor className="mr-2 text-green-400" />
                    Get Started
                    </span>
                </LoadingLink>
                <LoadingLink href="/keynote" loadingMessage="Loading Demo..." className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 underline-offset-4 hover:underline text-white h-8 px-3 sm:h-10 sm:px-4 sm:py-2">
                    <span className="flex items-center">
                    <TerminalCursor className="mr-2 text-blue-500" />
                    Keynote
                    </span>
                </LoadingLink>
                <LoadingLink href="/faq" className="hidden md:inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 underline-offset-4 hover:underline text-white h-8 px-3 sm:h-10 sm:px-4 sm:py-2">
                    <span className="flex items-center">
                    <TerminalCursor className="mr-2 text-white" />
                    Learn More
                    </span>
                </LoadingLink>
            </div>
          </div>
           
          <div ref={contentRef} className="container mx-auto px-4 relative z-20">
            <div className="relative z-20 max-w-xl rounded-lg border border-transparent bg-black/80 p-6 text-white backdrop-blur-sm shadow-lg">
                <h1 className="font-headline text-3xl font-normal tracking-tight">
                    The Professions Network
                </h1>
                <div className="mt-4 border-t border-b border-white/20 py-4">
                    <p className="font-sans text-lg text-white">
                    Sentrybase is a personal-intelligence platform for professional freelancers and businesses to work and collaborate as modern workflows demand.
                    </p>
                    <p className="font-sans text-lg text-white mt-4">
                    We source, annotate and organize our big data to mine opportunities instantly.
                    </p>
                </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-8 z-20">
              {/* Desktop View */}
              <div className="hidden md:flex items-center gap-4">
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button variant="link" className="text-white/80">Vision</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 bg-black/80 border-white/20 text-white backdrop-blur-sm">
                          <div className="space-y-2">
                              <h4 className="font-medium leading-none">Our Vision</h4>
                              <p className="text-sm text-white/80">
                                  To build a decentralized professional network where merit, skill, and collaboration are the primary currencies, powered by intelligent tools that eliminate friction and unlock true human potential.
                              </p>
                          </div>
                      </PopoverContent>
                  </Popover>
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button variant="link" className="text-white/80">Mission</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 bg-black/80 border-white/20 text-white backdrop-blur-sm">
                          <div className="space-y-2">
                              <h4 className="font-medium leading-none">Our Mission</h4>
                              <p className="text-sm text-white/80">
                                  To provide independent professionals and businesses with a secure, intelligent, and transparent platform to build high-performing teams and foster meaningful professional relationships.
                              </p>
                          </div>
                      </PopoverContent>
                  </Popover>
                   <Popover>
                      <PopoverTrigger asChild>
                          <Button variant="link" className="text-white/80">Solution</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 bg-black/80 border-white/20 text-white backdrop-blur-sm">
                          <div className="space-y-2">
                              <h4 className="font-medium leading-none">Our Solution</h4>
                              <p className="text-sm text-white/80">
                                  Sentrybase helps freelancers find consistent work, enables businesses to build effective teams, and secures the entire collaboration from contract to payment. We do not waste your time.
                              </p>
                          </div>
                      </PopoverContent>
                  </Popover>
              </div>

              {/* Mobile View */}
              <div className="md:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-transparent border-white/50 text-white hover:bg-white/10 hover:text-white">
                            <Ellipsis className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black/80 border-white/20 text-white">
                        <DropdownMenuItem asChild>
                             <Popover>
                                <PopoverTrigger className="w-full text-left">Vision</PopoverTrigger>
                                <PopoverContent className="w-80 bg-black border-white/20 text-white">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Our Vision</h4>
                                        <p className="text-sm text-white/80">To build a decentralized professional network...</p>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                             <Popover>
                                <PopoverTrigger className="w-full text-left">Mission</PopoverTrigger>
                                <PopoverContent className="w-80 bg-black border-white/20 text-white">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Our Mission</h4>
                                        <p className="text-sm text-white/80">To provide independent professionals and businesses...</p>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Popover>
                                <PopoverTrigger className="w-full text-left">Solution</PopoverTrigger>
                                <PopoverContent className="w-80 bg-black border-white/20 text-white">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Our Solution</h4>
                                        <p className="text-sm text-white/80">Sentrybase helps freelancers find consistent work...</p>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                            <LoadingLink href="/keynote">Product Demo</LoadingLink>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
          </div>
          <div className="absolute bottom-8 right-8 z-20 text-right font-headline text-xl md:text-2xl text-white/80">
            <p>there's more to earn</p>
            <p className="font-bold flex items-center justify-end text-white">
                <TerminalCursor className="mr-2 text-white" />
                we connect
            </p>
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="bg-white py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center bg-gray-100">
                <h3 className="font-headline text-3xl font-light tracking-tight text-blue-600">Hire Skills</h3>
                <Button asChild variant="link" className="p-0 mt-4 text-black h-auto justify-start">
                   <LoadingLink href="/skill-sync-net">
                    <span className="flex items-center">Find Talent <ArrowRight className="ml-2 h-4 w-4" /></span>
                   </LoadingLink>
                </Button>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center bg-black text-white">
                 <h3 className="font-headline text-3xl font-light tracking-tight text-green-400">Get Hired</h3>
                 <Button asChild variant="link" className="p-0 mt-4 text-white h-auto justify-start">
                   <LoadingLink href="/skill-sync-net">
                    <span className="flex items-center">Find Work <ArrowRight className="ml-2 h-4 w-4" /></span>
                   </LoadingLink>
                </Button>
              </div>
            </div>
             <div className="relative mt-4 flex overflow-hidden bg-black text-white font-mono text-sm py-4">
                <div className="flex animate-marquee whitespace-nowrap">
                    {trendingNiches.concat(trendingNiches).map((niche, index) => (
                        <div key={index} className="mx-4 flex items-center">
                            <span className="font-bold text-green-400">{niche.name.toUpperCase()}</span>
                            <span className="mx-2 text-white/50">//</span>
                            <span className="text-white/80">avg/hr {niche.rate}</span>
                        </div>
                    ))}
                </div>
                 <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap">
                    {trendingNiches.concat(trendingNiches).map((niche, index) => (
                        <div key={index} className="mx-4 flex items-center">
                            <span className="font-bold text-green-400">{niche.name.toUpperCase()}</span>
                            <span className="mx-2 text-white/50">//</span>
                            <span className="text-white/80">avg/hr {niche.rate}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <ProductDemoSection />

        {/* Features Section */}
        <section className="bg-white pt-20 pb-20 md:pt-20 sm:pb-32">
          <div className="container mx-auto px-4">
            <div>
              <h2 className="font-headline text-3xl font-light tracking-tight sm:text-5xl">A Smarter Way to Network</h2>
              <div className="mt-4 h-[1px] w-20 bg-black" />
              <p className="mt-6 max-w-2xl text-lg text-black/60">
                Our intelligent tools are designed to surface opportunities and connections you won't find anywhere else.
              </p>
              <p className="mt-6 max-w-2xl text-lg text-black/60">
                1.5billion freelancers worldwide yet only 1000 join to get a front row seat...equality in the making
              </p>
            </div>
            <div className="mt-16 max-w-3xl mx-auto">
              <Accordion 
                type="single" 
                collapsible 
                className="w-full"
                value={activeAccordionItem ?? ""}
                onValueChange={setActiveAccordionItem}
               >
                {features.map((feature, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    onMouseEnter={() => setActiveAccordionItem(`item-${index}`)}
                  >
                    <AccordionTrigger className="text-lg font-medium hover:no-underline">
                      <div className="flex items-center gap-4">
                        {React.cloneElement(feature.icon, { className: "h-6 w-6 text-black", strokeWidth: 1})}
                        {feature.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div className="pl-10 space-y-4">
                        <p className="text-base text-black/60">{feature.description}</p>
                        <Button asChild variant="link" className="p-0 text-black">
                           <LoadingLink href={feature.link}>
                            <span className="flex items-center">Explore {feature.title} <ArrowRight className="ml-2 h-4 w-4" /></span>
                           </LoadingLink>
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-white py-8 border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2">
             <Kanban className="size-6 text-black" />
             <span className="font-logo text-xl tracking-tighter text-black">Sentrybase</span>
          </div>
           <div className="flex gap-6 mt-4 md:mt-0">
             <LoadingLink href="#vision" className="text-sm text-black/60 hover:text-black">Vision</LoadingLink>
             <LoadingLink href="#mission" className="text-sm text-black/60 hover:text-black">Mission</LoadingLink>
             <LoadingLink href="#solution" className="text-sm text-black/60 hover:text-black">Solution</LoadingLink>
             <LoadingLink href="/billing" className="text-sm text-black/60 hover:text-black">Billing</LoadingLink>
             <LoadingLink href="/faq" className="text-sm text-black/60 hover:text-black">FAQ</LoadingLink>
          </div>
          <p className="text-sm text-black/60 mt-4 md:mt-0">&copy; {new Date().getFullYear()} Sentrybase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
