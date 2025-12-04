
'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ContractBlueprintPage() {
    const router = useRouter();

    const sections = {
        "Part 1: The Foundation (Non-Negotiables for Every Contract)": [
            {
                title: "1. The Parties",
                content: "Full legal names and contact information for both the freelancer (or their business entity) and the client."
            },
            {
                title: "2. Scope of Work (SOW)",
                content: "This is the most critical section. Describe in clear, specific language exactly what work will be performed. Equally important, define what is not included.\nGood: \"Design of a 5-page responsive website: Home, About, Services, Portfolio, and Contact. Includes mobile layout and basic on-page SEO setup.\"\nBad: \"Build a new website.\""
            },
            {
                title: "3. Deliverables",
                content: "List the tangible items the client will receive. Be specific about file formats and quantities.\nGood: \"Three (3) initial logo concepts in JPG format, one (1) refined concept in vector (.AI, .EPS) format, and a brand style guide PDF.\""
            },
            {
                title: "4. Timeline & Milestones",
                content: "State the project start date, final delivery date, and any key review milestones (e.g., \"First draft delivered by Oct 25th,\" \"Final feedback due by Oct 28th\")."
            },
            {
                title: "5. Fee & Payment Schedule",
                content: "The total project cost and the exact payment terms.\nStandard: \"Total Project Fee: $5,000. Payment schedule: 50% ($2,500) due upon signing to begin work. 50% ($2,500) due upon final delivery of all assets.\""
            },
            {
                title: "6. Termination Clause (Kill Fee)",
                content: "What happens if the project needs to be cancelled? This protects both parties.\nExample: \"Either party may terminate this agreement with 7 days' written notice. In the event of termination by the Client, the Freelancer will be paid for all work completed up to the termination date, plus a termination fee equal to 25% of the remaining project balance.\""
            },
            {
                title: "7. Signatures",
                content: "Both parties must sign and date the agreement to make it official."
            }
        ],
        "Part 2: The Freelancer's Defensive Line": [
            {
                title: "1. Revision Limits",
                content: "\"This contract includes two (2) rounds of revisions on the initial deliverable. Additional revisions will be billed at my hourly rate of $X.\""
            },
            {
                title: "2. Client Responsibilities",
                content: "\"The Client is responsible for providing all necessary text, images, and feedback by the dates outlined in the timeline. Delays in Client deliverables will result in a corresponding delay of the final project delivery date.\""
            },
            {
                title: "3. Ownership of Intellectual Property (IP)",
                content: "This is your leverage. \"Ownership of the final deliverables and all intellectual property rights will transfer to the Client only upon receipt of the final payment in full. Until paid in full, the Freelancer retains a license to use the work for promotional purposes.\""
            },
            {
                title: "4. Additional Expenses",
                content: "\"Any out-of-pocket expenses, such as stock photography or specialized fonts, will be pre-approved by the Client and billed at cost.\""
            }
        ],
        "Part 3: The Business's Assurance": [
            {
                title: "1. Confidentiality",
                content: "\"The Freelancer agrees not to disclose any confidential or proprietary information belonging to the Client to any third party.\""
            },
            {
                title: "2. Indemnification",
                content: "\"The Freelancer indemnifies and holds harmless the Client from any and all claims, damages, or expenses arising from the Freelancer's use of third-party copyrighted materials without proper licensing.\" (This protects you if they use a stolen photo)."
            },
            {
                title: "3. Source Files",
                content: "Clarify ownership of the original, editable files. \"Upon final payment, the Freelancer will provide the final deliverables. The original, editable source files (e.g., .PSD, .AI) are available for an additional fee of $X.\""
            },
            {
                title: "4. Portfolio Rights",
                content: "\"The Client grants the Freelancer a non-exclusive, worldwide, perpetual license to display the final work in the Freelancer's professional portfolio and other marketing materials.\""
            }
        ]
    };

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-3xl">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">The SentryBase Contract Blueprint</h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Building Agreements on Trust
                    </p>
                </header>
                
                <div className="prose prose-lg dark:prose-invert mx-auto">
                    <p className="lead">
                        A great contract answers every question before it's asked. It aligns expectations and ensures both you and your collaborator are focused on the same goal: a successful project.
                    </p>
                    
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
