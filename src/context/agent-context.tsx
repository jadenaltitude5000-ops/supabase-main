
"use client";

import React, { createContext, useState, ReactNode } from 'react';

interface FeedFilter {
    niche: string;
}

interface AgentContextType {
    feedFilter: FeedFilter | null;
    setFeedFilter: (filter: FeedFilter | null) => void;
    clearFeedFilter: () => void;
}

export const AgentContext = createContext<AgentContextType>({
    feedFilter: null,
    setFeedFilter: () => {},
    clearFeedFilter: () => {},
});

export const AgentProvider = ({ children }: { children: ReactNode }) => {
    const [feedFilter, setFeedFilter] = useState<FeedFilter | null>(null);
    
    const clearFeedFilter = () => {
        setFeedFilter(null);
    }

    return (
        <AgentContext.Provider value={{ feedFilter, setFeedFilter, clearFeedFilter }}>
            {children}
        </AgentContext.Provider>
    );
};
