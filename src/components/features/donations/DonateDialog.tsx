
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Feather, Loader2 } from "lucide-react";

export function DonateDialog() {
    const [donationAmount, setDonationAmount] = useState("15");
    const [isProcessing, setIsProcessing] = useState(false);
    const presetAmounts = ["5", "15", "50", "100"];
    const { toast } = useToast();

    const handlePresetClick = (amount: string) => {
        setDonationAmount(amount);
    };

    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configuration Error</DialogTitle>
                </DialogHeader>
                <p>PayPal client ID is not configured. Donations cannot be processed.</p>
            </DialogContent>
        )
    }

    return (
        <DialogContent className="max-w-md">
            <DialogHeader className="text-center items-center font-playfair">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                    <Feather className="h-7 w-7 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-bold">Support Sentrybase</DialogTitle>
                <DialogDescription className="mt-2 text-md text-muted-foreground">
                    Your contribution helps us build the best platform for professionals like you.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-4">
                {isProcessing ? (
                    <div className="flex flex-col items-center justify-center p-8">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p>Processing your donation...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {presetAmounts.map((amount) => (
                                <Button
                                    key={amount}
                                    variant={donationAmount === amount ? "default" : "outline"}
                                    className="h-14 text-lg"
                                    onClick={() => handlePresetClick(amount)}
                                >
                                    ${amount}
                                </Button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="custom-amount">Or enter a custom amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                    id="custom-amount"
                                    type="number"
                                    placeholder="25.00"
                                    className="pl-7 text-base"
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(e.target.value)}
                                />
                            </div>
                        </div>
                        <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, currency: "USD", intent: "capture" }}>
                            <PayPalButtons
                                style={{ layout: "vertical", label: "donate" }}
                                fundingSource="paypal"
                                createOrder={async (data, actions) => {
                                    return actions.order.create({
                                        intent: 'CAPTURE',
                                        purchase_units: [{
                                            description: `Donation to Sentrybase`,
                                            amount: {
                                                currency_code: "USD",
                                                value: donationAmount
                                            }
                                        }]
                                    });
                                }}
                                onApprove={async (data, actions) => {
                                    setIsProcessing(true);
                                    const order = await actions.order?.capture();
                                    console.log("Donation successful:", order);
                                    toast({
                                        title: "Thank You!",
                                        description: "Your donation has been received. We appreciate your support!",
                                    });
                                    setIsProcessing(false);
                                    return Promise.resolve();
                                }}
                                onError={(err) => {
                                    console.error("PayPal Error:", err);
                                    toast({
                                        variant: "destructive",
                                        title: "Donation Failed",
                                        description: "An error occurred during the donation process. Please try again."
                                    });
                                }}
                            />
                        </PayPalScriptProvider>
                    </>
                )}
            </div>
        </DialogContent>
    );
}
