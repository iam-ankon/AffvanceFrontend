
'use client';

import React, { useState } from 'react';
import { Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const KeywordLabClient = () => {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleScan = () => {
        if (!keyword.trim()) return;
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <div className="flex flex-col gap-6 max-w-xl">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 to-emerald-500/20 rounded-[2rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-background border border-border rounded-[1.8rem] p-1.5 shadow-sm focus-within:ring-4 focus-within:ring-indigo-600/10 transition-all overflow-hidden">
                    <Input
                        type="text"
                        placeholder="Enter Niche (e.g. Pet Tech)"
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-lg h-14 pl-6"
                        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    />
                    <Button
                        size="lg"
                        className="px-8 bg-indigo-600 text-white rounded-[1.4rem] font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all h-14 shadow-lg shadow-indigo-600/20"
                        onClick={handleScan}
                        disabled={loading || !keyword.trim()}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Scanning...</span>
                            </div>
                        ) : 'Scan Lab'}
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-3 bg-muted/30 rounded-2xl w-fit border border-border/50">
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-75"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-150"></span>
                </div>
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Database className="w-3 h-3 text-indigo-600" />
                    {loading ? 'Analyzing Latent Search Intent...' : 'System Ready for Discovery'}
                </span>
            </div>
        </div>
    );
};
