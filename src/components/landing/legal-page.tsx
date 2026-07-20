'use client';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const LegalPage = ({ title, content, onBack }: { title: string, content: string, onBack?: () => void }) => (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-white animate-in fade-in duration-500">
        <div className="max-w-4xl mx-auto">
            {onBack ? (
                <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-bold mb-12 group hover:gap-3 transition-all">
                    <ArrowRight className="w-5 h-5 rotate-180" /> Back to Center
                </button>
            ) : (
                <Link href="/" className="flex items-center gap-2 text-indigo-600 font-bold mb-12 group hover:gap-3 transition-all">
                    <ArrowRight className="w-5 h-5 rotate-180" /> Back to Center
                </Link>
            )}
            <div className="bg-slate-50 rounded-[3rem] p-12 md:p-20 border border-slate-100 shadow-sm">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-10 tracking-tighter leading-none">{title}</h1>
                <div className="prose prose-indigo max-w-none space-y-8 text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">{content}</div>
            </div>
        </div>
    </div>
);
