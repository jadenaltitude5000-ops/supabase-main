
'use client';

import React, { useContext } from 'react';
import Link, { type LinkProps } from 'next/link';
import { LoadingContext } from '@/context/loading-context';

type LoadingLinkProps = LinkProps & {
    children: React.ReactNode;
    className?: string;
    loadingMessage?: string;
};

/**
 * A wrapper around the Next.js Link component that triggers a global loading indicator on click.
 */
export function LoadingLink({ children, className, loadingMessage, ...props }: LoadingLinkProps) {
    const { showLoader } = useContext(LoadingContext);

    const handleClick = () => {
        showLoader(loadingMessage || 'Performing...');
    };

    return (
        <Link className={className} {...props} onClick={handleClick}>
            <span className="flex items-center justify-center gap-2">{children}</span>
        </Link>
    );
}
