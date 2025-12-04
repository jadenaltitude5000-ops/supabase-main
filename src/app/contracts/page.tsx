
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  FileText,
  PlusCircle,
  Users,
  MoreVertical,
  Circle,
  Loader2,
  Copy,
  BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClientOnly } from '@/components/layout/client-only';
import { useUser, useSupabase } from '@/firebase';
import type { Contract } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type ContractWithPartyCount = Contract & { partyCount: number };

function CreateContractDialog({ onContractCreated }: { onContractCreated: () => void }) {
    const [title, setTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { user: authUser } = useUser();
    const supabase = useSupabase();
    const { toast } = useToast();

    const handleCreate = async () => {
        if (!title.trim() || !authUser || !supabase) return;

        setIsCreating(true);
        try {
            const { data: newContract, error: contractError } = await supabase
              .from('contracts')
              .insert({
                  title,
                  owner_id: authUser.id,
                  status: 'draft',
              })
              .select()
              .single();

            if (contractError) throw contractError;

            // Add to user's reverse mapping
            const { error: userContractError } = await supabase
              .from('user_contracts')
              .insert({
                  user_id: authUser.id,
                  contract_id: newContract.id,
                  role: 'owner',
              });
            
            if (userContractError) throw userContractError;


            toast({
                title: 'Contract Created',
                description: `"${title}" has been successfully created.`,
            });

            onContractCreated();
        } catch (error: any) {
            console.error("Error creating contract:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to create contract. Please try again.',
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Contract</DialogTitle>
                <DialogDescription>
                    Start a new professional agreement. You can invite collaborators later.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="contract-title">Contract Title</Label>
                <Input
                    id="contract-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Website Development Agreement"
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreate} disabled={isCreating || !title.trim()}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isCreating ? 'Creating...' : 'Create Contract'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

const contractTemplateText = `
[Project Name] Contract

Date: [Date]

1. Parties
This agreement is between:
Client: [Client Full Name / Company Name] ([Contact Info])
Freelancer: [Freelancer Full Name / Business Name] ([Contact Info])

2. Scope of Work
The Freelancer agrees to perform the following work:
[Detailed, specific description of the work to be done]

3. Deliverables
The Freelancer will provide the following tangible items:
[List of specific deliverables, including formats and quantities]

4. Timeline
Project Start: [Date]
Milestone 1: [Description] due by [Date]
Final Delivery: [Date]

5. Fee & Payment Schedule
Total Project Fee: $[Amount]
Payment Schedule:
[Percentage]% ($[Amount]) due upon signing to commence work.
[Percentage]% ($[Amount]) due upon final delivery.

6. Revisions
This contract includes [Number] rounds of revisions on each deliverable.

7. Ownership of IP
All rights and ownership of the final deliverables will transfer to the Client upon receipt of the final payment in full.

8. Termination
Either party may terminate with [Number] days' written notice. If terminated by the Client, the Freelancer will be paid for all work completed to date.

9. Signatures
By signing below, both parties agree to the terms outlined in this contract.

CLIENT:
Signature: _________________________
Name: [Client Name]
Date: _______________

FREELANCER:
Signature: _________________________
Name: [Freelancer Name]
Date: _______________
`.trim();


function ContractsPageInternal() {
  const { user: authUser, isUserLoading } = useUser();
  const supabase = useSupabase();
  const [contracts, setContracts] = useState<ContractWithPartyCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContracts = async () => {
      if (!authUser || !supabase) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      const { data: userContracts, error: userContractsError } = await supabase
        .from('user_contracts')
        .select('contract_id')
        .eq('user_id', authUser.id);
      
      if (userContractsError) {
          console.error(userContractsError);
          setIsLoading(false);
          return;
      }

      if (userContracts && userContracts.length > 0) {
        const contractIds = userContracts.map(c => c.contract_id);
        
        const { data: contractsData, error: contractsError } = await supabase
            .from('contracts')
            .select('*')
            .in('id', contractIds);

        if (contractsError) {
            console.error(contractsError);
            setIsLoading(false);
            return;
        }

        const contractsWithPartyCount: ContractWithPartyCount[] = await Promise.all(
          (contractsData || []).map(async (contract: Contract) => {
            const { count, error } = await supabase
              .from('contract_parties')
              .select('*', { count: 'exact', head: true })
              .eq('contract_id', contract.id);
            
            return { ...contract, partyCount: count || 0 };
          })
        );
        
        setContracts(contractsWithPartyCount);
        setIsLoading(false);
      } else {
        setContracts([]);
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [authUser, supabase]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'review':
        return <Badge variant="secondary">In Review</Badge>;
      case 'signed':
        return <Badge variant="default">Signed</Badge>;
      case 'archived':
        return <Badge variant="destructive">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredContracts = useMemo(() => {
    if (activeTab === 'all') return contracts;
    return contracts.filter(c => c.status === activeTab);
  }, [contracts, activeTab]);

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(contractTemplateText);
    toast({
        title: 'Template Copied',
        description: 'The simple contract template has been copied to your clipboard.',
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-light tracking-tight">
            Contracts
          </h1>
          <p className="mt-1 text-lg text-muted-foreground font-headline font-light">
            Create, manage, and collaborate on all your professional agreements.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Contract
                </Button>
            </DialogTrigger>
            <CreateContractDialog onContractCreated={() => setIsCreateDialogOpen(false)} />
        </Dialog>
      </header>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-5 text-muted-foreground">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="review">In Review</TabsTrigger>
          <TabsTrigger value="signed">Signed</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Your Contracts</CardTitle>
                <CardDescription>
                  An overview of all your current and past contracts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Parties</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading || isUserLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredContracts.length > 0 ? (
                      filteredContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">
                            {contract.title}
                          </TableCell>
                          <TableCell>{getStatusBadge(contract.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                               <Users className="h-4 w-4 text-muted-foreground" />
                               <span>{contract.partyCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {contract.updated_at ? new Date(contract.updated_at as string).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          No contracts found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="templates" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contract Templates</CardTitle>
                    <CardDescription>Use these templates as a starting point for your agreements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border bg-muted/50 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">SentryBase Simple Contract Template</h3>
                            <Button variant="outline" onClick={handleCopyTemplate}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Template
                            </Button>
                        </div>
                        <pre className="whitespace-pre-wrap text-sm font-mono bg-background p-4 rounded-md overflow-x-auto">
                            {contractTemplateText}
                        </pre>
                        <div className="mt-6 text-center">
                            <Link href="/contracts/blueprint">
                                <Button>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    View Contract Blueprint Guide
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ContractsPage() {
    return (
        <ClientOnly>
            <ContractsPageInternal />
        </ClientOnly>
    )
}
