
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This page is now deprecated as the donation UI has been moved to a modal dialog on the billing page.
// This component redirects to the billing page to avoid a broken link.
export default function DonatePage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/billing');
    }, [router]);

  return null;
}
