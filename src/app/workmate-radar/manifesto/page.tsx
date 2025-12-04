
'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WorkmateRadarManifestoPage() {
    const router = useRouter();

    const sections = {
        "Part 1: For Freelancers - Finding Your Counterpart": [
            {
                title: "1. Define Your Mission. Set Your Radar Frequency.",
                content: "Before you scan, know why you're scanning. What is your primary goal?\nCollaboration: \"I'm a front-end developer looking for a UI/UX designer who specializes in SaaS to form a dedicated project team.\"\nReferrals: \"I'm a copywriter who frequently gets requests for video production. I'm looking for a videographer to send referrals to (and receive them from).\"\nSpecialization: \"I'm a generalist marketer and need a reliable SEO specialist to subcontract specific tasks to.\""
            },
            {
                title: "2. Broadcast Your Signal. Optimize Your Profile for Allies.",
                content: "Your profile is what the Radar scans. Make sure it clearly states not just what you do, but who you want to partner with.\nAdd a \"Seeking\" section to your bio: \"Currently seeking to partner with talented illustrators for children's book projects.\"\nList complementary skills: Explicitly mention the skills of your ideal partner. This helps the algorithm find you.\nShowcase past collaborations: If you've worked with other freelancers, feature that project and tag them. It proves you're a good teammate."
            },
            {
                title: "3. Target Your Scan. Use Filters with Precision.",
                content: "Don't just scan for \"developers.\" Use the Radar's filters to find the right developer.\nFilter by Skill: React + Node.js\nFilter by Industry/Niche: Fintech + Healthcare\nFilter by Goal: Use the \"Looking for Collaboration\" or \"Open to Referrals\" filters.\nThe more specific your scan, the higher the quality of your matches."
            },
            {
                title: "4. The Alliance Outreach. Make the First Connection Count.",
                content: "When the Radar finds a match, your outreach message is critical. Be direct, respectful, and value-driven.\nBad: \"Hi, saw we were a match. Wanna collab sometime?\"\nGood: \"Hi [Name], Workmate Radar flagged us as a potential match. I'm a front-end dev who builds dashboards for logistics companies, and I saw your portfolio has some brilliant UI/UX work in that space. I'm looking for a design partner to team up with on future proposals. Would you be open to a brief 15-minute chat next week to see if our styles align?\""
            }
        ],
        "Part 2: For Businesses - Finding Your Strategic Partner": [
            {
                title: "1. Clarify Your Strategic Objective. Know Your Partnership Type.",
                content: "What kind of business relationship are you trying to build?\nWhite-Label/Service Provider: \"We are a marketing agency looking for a reliable, white-label web development partner to serve our clients.\"\nCo-Marketing/Joint Venture: \"We are a CRM for real estate agents. We're looking for a non-competing business (e.g., a transaction management software) that targets the same audience for a co-hosted webinar.\"\nSupply Chain: \"We manufacture high-end audio equipment and are seeking a supplier for custom-branded components.\""
            },
            {
                title: "2. Tune Your Company Profile. Attract the Right Partners.",
                content: "Your business profile must signal who you are and who you want to partner with.\nCreate a \"Partnerships\" section: \"We actively seek B2B partnerships with e-commerce platforms and digital agencies.\"\nDefine your Ideal Client Profile (ICP): Clearly state who your customers are. This helps other businesses see if there's audience overlap.\nHighlight your capacity: Mention if you have the ability to handle white-label work or if you are looking to expand into new markets."
            },
            {
                title: "3. Scan for Synergy, Not Just Services.",
                content: "The most powerful partnerships are built on shared values and audience alignment. Use the Radar filters to find this synergy.\nFilter by Target Audience: SMBs in the construction industry\nFilter by Company Size/Stage: Seed-stage startups or Established Enterprise\nFilter by Partnership Goal: Use the \"Seeking Co-Marketing\" or \"Open to White-Label\" filters."
            },
            {
                title: "4. The Partnership Proposal. Be Professional and Direct.",
                content: "When you reach out to a potential business partner, frame it as a strategic opportunity.\nBad: \"We see you're in the tech space. Let's work together.\"\nGood: \"Hi [Contact Name], SentryBase's Workmate Radar identified our companies as a potential strategic fit. My company, [Your Company], provides inventory management software for breweries, and I see you offer accounting services for the same niche. I believe a formal partnership where we offer bundled services could be highly valuable for both of us. Are you the right person to explore this with?\""
            }
        ],
        "Part 3: Universal Rules - Making the Connection": [
             {
                title: "1. The First Message is a Handshake, Not a Contract.",
                content: "Focus on building rapport and finding common ground. State your intent clearly but don't go straight for a hard sell."
            },
            {
                title: "2. Propose a Clear, Low-Commitment Next Step.",
                content: "A 15-minute virtual coffee or a brief exploratory call is perfect. It respects everyone's time and allows you to quickly gauge if there's a real fit."
            },
            {
                title: "3. Be Transparent About Your Goals.",
                content: "Don't hide your intentions. If you're looking for referral partners, say so. If you need a white-label service, be upfront. Trust is the currency of partnership."
            },
            {
                title: "4. If It's Not a Fit, Disconnect Gracefully.",
                content: "SentryBase is a professional ecosystem. A simple, \"Thanks for your time, but I don't think we're aligned on this specific goal. I'll be sure to keep you in mind for the future,\" is all it takes."
            }
        ]
    };

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-3xl">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">The Workmate Radar Code</h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        How to Build Your Alliance
                    </p>
                </header>
                
                <div className="prose prose-lg dark:prose-invert mx-auto">
                     {Object.entries(sections).map(([sectionTitle, items]) => (
                        <div key={sectionTitle} className="mt-8">
                            <h2 className="text-3xl font-bold border-b pb-2 mb-4">{sectionTitle}</h2>
                            <div className="space-y-6">
                                {items.map((item, index) => (
                                    <div key={index}>
                                        <h3 className="text-xl font-semibold">{item.title}</h3>
                                        <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{item.content}</p>
                                    </div>
                                ))}
                            </div>
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
