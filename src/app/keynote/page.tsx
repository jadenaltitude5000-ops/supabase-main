
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, FileText, Send, Users, User, Briefcase, PlayCircle, Code, Brush, BarChart2, DollarSign, Wrench, Search, Check, Kanban, ArrowRight, Square, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const slides = [
  {
    title: 'The Sentrybase Vision',
    description: 'A professional network where merit, skill, and collaboration are the primary currencies, powered by intelligent tools that eliminate friction and unlock human potential.',
    visual: () => (
       <div className="w-full h-full flex items-center justify-center p-8 bg-black rounded-lg">
          <div className="relative flex items-center justify-center w-64 h-64">
            <div
                className="absolute inset-0 origin-center animate-spin"
                style={{
                    animationDuration: '10s',
                    background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(74, 222, 128, 0.05) 60%, rgba(74, 222, 128, 0.1) 70%, transparent 71%)',
                    maskImage: 'conic-gradient(from 0deg, transparent 0%, black 5%, black 20%, transparent 25%)',
                    animationTimingFunction: 'linear',
                }}
            />
            <div className="absolute inset-0 rounded-full border border-amber-400/10" />
            <Kanban className="h-16 w-16 text-amber-400" strokeWidth={1} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-1"><Code className="h-8 w-8 text-amber-400" strokeWidth={1} /></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-2"><Brush className="h-8 w-8 text-amber-400" strokeWidth={1} /></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-3"><BarChart2 className="h-8 w-8 text-amber-400" strokeWidth={1} /></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-4"><User className="h-8 w-8 text-amber-400" strokeWidth={1} /></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-5"><DollarSign className="h-8 w-8 text-amber-400" strokeWidth={1} /></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-6"><Wrench className="h-8 w-8 text-amber-400" strokeWidth={1} /></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-7"><Users className="h-8 w-8 text-amber-400" strokeWidth={1} /></div>
          </div>
       </div>
    ),
  },
  {
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
                className="w-full h-full flex items-center justify-center p-4 bg-black rounded-lg font-mono text-amber-400"
            >
                <div className="w-full h-full border border-amber-400/20 p-4 space-y-4">
                    <motion.div variants={itemVariants} className="flex justify-between items-center text-xs text-amber-400/70">
                        <span>// SENTRYBASE RADAR //</span>
                        <span>STATUS: <span className="text-green-400">ONLINE</span></span>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2">
                        <span className="text-green-400">$</span>
                        <p>SCAN FOR "LEAD PRODUCT DESIGNER"</p>
                        <div className="w-2 h-4 bg-amber-400 animate-pulse ml-1" />
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
                                 <p className="text-xs text-amber-400/60">{match.skills}</p>
                             </motion.div>
                         ))}
                    </div>
                </div>
            </motion.div>
        );
    },
  },
  {
    title: 'Skill Sync Net: Find Your Next Project',
    description: "Our system scans the market for projects that perfectly match your skills, eliminating manual searches. For businesses, it pinpoints the most suitable talent for your needs.",
    visual: () => (
      <div className="w-full h-full flex items-center justify-center p-8 bg-black rounded-lg">
        <div className="flex w-full max-w-lg items-start justify-center gap-4">
            <AnimatedProfileCard />
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
            >
                <Search className="h-12 w-12 text-amber-400 shrink-0 animate-pulse mt-12" style={{ animationDuration: '2s' }} />
            </motion.div>
            <AnimatedProjectMatchCard />
        </div>
      </div>
    ),
  },
   {
    title: 'Secure Contracts: Built on Trust',
    description: "Create, manage, and sign professional agreements directly on the platform. Our system ensures clarity and security for both parties.",
    visual: () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, amount: 0.5 });
        const cardVariants = {
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.6, 0.01, -0.05, 0.95] } }
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
            className="w-full h-full flex items-center justify-center p-8 bg-black rounded-lg">
              <Card className="w-full max-w-sm bg-black border-amber-400/20 text-amber-400 font-mono">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><FileText className="h-6 w-6"/> Project Agreement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-amber-400/70">
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
                    <p className="text-xs text-amber-400/50">Status: Pending Signature</p>
                    <Button disabled variant="outline" className="bg-black border-amber-400/30 text-amber-400/50">Sign Contract</Button>
                </CardFooter>
              </Card>
          </motion.div>
        );
    },
  },
];


function AnimatedNumber({ value }: { value: number }) {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });
    const [displayValue, setDisplayValue] = useState(0);
  
    useEffect(() => {
        if (isInView) {
            const controls = animate(0, value, {
                duration: 1,
                onUpdate: (latest) => setDisplayValue(Math.round(latest))
            });
            return () => controls.stop();
        }
    }, [isInView, value]);
  
    return <motion.span ref={ref}>{displayValue.toLocaleString()}</motion.span>;
}

function AnimatedProfileCard() {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    const skills = [
        { icon: <ArrowRight className="h-4 w-4 text-amber-400/50" />, text: "React & Next.js" },
        { icon: <ArrowRight className="h-4 w-4 text-amber-400/50" />, text: "UI/UX Design" },
        { icon: <ArrowRight className="h-4 w-4 text-amber-400/50" />, text: "Marketing Analytics" },
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
             <Card className="w-full transform -rotate-3 transition-all duration-300 hover:rotate-0 hover:scale-105 h-full bg-black border-amber-400/20 text-amber-400 font-mono">
                <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center gap-2"><User className="h-5 w-5" /> Your Profile</CardTitle>
                    <p className="text-xs text-amber-400/60 pt-1">The system analyzes your strongest skills.</p>
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
            <Card className="w-full transform rotate-3 transition-all duration-300 hover:rotate-0 hover:scale-105 h-full bg-black border-amber-400/20 text-amber-400 font-mono">
                <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-5 w-5" /> Project Match</CardTitle>
                     <p className="text-xs text-amber-400/60 pt-1">
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
                     <p className="text-sm text-amber-400/80">Budget: <span className="font-semibold text-amber-400">$<AnimatedNumber value={budget} /></span></p>
                     <p className="text-sm text-amber-400/80">Timeline: <span className="font-semibold text-amber-400">6 Weeks</span></p>
                     <div className="space-y-1">
                        <p className="text-xs font-semibold">Match Score: {isInView ? <AnimatedNumber value={matchScore} /> : 0}%</p>
                        <div className="w-full bg-amber-400/20 rounded-full h-2 overflow-hidden">
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

export default function KeynotePage() {
    const router = useRouter();
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)
    const [count, setCount] = React.useState(0)
   
    useEffect(() => {
        if (!api) return
    
        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap())
    
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    const currentSlide = slides[current];

    return (
        <div className="bg-black text-amber-400 min-h-screen flex flex-col font-mono">
            <header className="p-4 flex justify-between items-center border-b border-amber-400/20 flex-shrink-0">
                 <Button variant="ghost" onClick={() => router.back()} className="text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10">
                    &lt; Back
                </Button>
                <div className="flex items-center gap-2 text-green-400 text-xs">
                    <span>SYS_STATUS:</span>
                    <span className="animate-pulse">ONLINE</span>
                </div>
                <div className="w-24 text-right text-xs">
                    <span>SENTRYBASE_v1.0</span>
                </div>
            </header>
            
             <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1.2fr,1.5fr] items-start p-4 lg:p-8 gap-8">
                <div className="w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="border border-amber-400/20 p-4"
                        >
                            <h2 className="text-2xl lg:text-3xl text-green-400">
                                <span className="text-amber-400/70">// </span>{currentSlide.title}
                            </h2>
                            <p className="mt-4 text-base text-amber-400/80 leading-relaxed">
                                {currentSlide.description}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="w-full h-full flex flex-col justify-start">
                    <div className="w-full max-w-4xl mx-auto border border-amber-400/20 flex flex-col">
                        <div className="bg-black/50 p-2 flex items-center justify-between border-b border-amber-400/20 flex-shrink-0">
                            <div className="flex items-center gap-1.5">
                                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            </div>
                            <p className="text-xs text-amber-400/60">/DATA_VISUALIZATION_STREAM_0{current+1}</p>
                            <div className="flex items-center gap-1.5">
                                <Square className="h-3 w-3 text-amber-400/50" />
                                <Square className="h-3 w-3 text-amber-400/50" />
                                <X className="h-3 w-3 text-amber-400/50" />
                            </div>
                        </div>
                        <div className="flex-1 relative overflow-hidden">
                            <Carousel 
                                setApi={setApi} 
                                className="w-full h-full"
                                plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
                            >
                                <CarouselContent>
                                    {slides.map((slide, index) => (
                                        <CarouselItem key={index} className="h-full">
                                            <div className="p-1 h-full">
                                                <div className="flex items-center justify-center p-2 h-full">
                                                    <slide.visual />
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="p-4 flex flex-col items-center gap-2 border-t border-amber-400/20 flex-shrink-0">
                 <p className="text-center text-xs text-amber-400/60">
                    STREAM {current + 1} OF {count} // STATUS: ACTIVE
                </p>
                <div className="flex gap-2 w-full max-w-xl">
                    {Array.from({ length: count }).map((_, index) => (
                        <div key={index} className="flex-1 h-1 bg-amber-400/20">
                            <div 
                                className={cn(
                                    "h-full bg-amber-400 transition-all duration-500 ease-linear",
                                    index < current ? 'w-full' : 'w-0',
                                    index === current && 'w-full'
                                )}
                                style={{ transitionDuration: index === current ? '5000ms' : '300ms' }}
                            />
                        </div>
                    ))}
                </div>
            </footer>
        </div>
    );
}

    




