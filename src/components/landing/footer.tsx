'use client';

import React from 'react';
import { Sparkles, Share2, Link2, Activity } from 'lucide-react';

import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="footer-smart-bg pt-40 pb-20 px-4 overflow-hidden">
            <div className="footer-glow"></div>
            <div className="analytics-grid-overlay"></div>
            <div className="growth-path-shade"></div>

            <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none select-none">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 400">
                    <path d="M0 350C100 320 200 380 300 300C400 220 500 250 600 150C700 50 850 100 1000 20" stroke="url(#lineGradient)" strokeWidth="4" fill="none" />
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1000" y2="0">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-20 mb-24">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-3 mb-10 cursor-pointer group">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 group-hover:rotate-6 transition-transform"><Sparkles className="text-white w-6 h-6" /></div>
                            <div className="flex flex-col -space-y-1"><span className="text-3xl font-black tracking-tighter text-slate-900 leading-none">Affvance</span></div>
                        </Link>
                        <p className="text-slate-600 mb-10 max-w-sm font-semibold leading-relaxed">The high-performance AI content engine for digital publishers seeking explosive growth and ranking dominance. Build, Rank, and scale your content empire organically with precision backend engineering.</p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-md"><Share2 className="w-4 h-4" /></div>
                            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-md"><Link2 className="w-4 h-4" /></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 mb-10 uppercase tracking-[0.2em] text-[10px] opacity-40">Solutions</h4>
                        <ul className="space-y-5 text-slate-600 text-sm font-bold">
                            <li><Link href="/#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</Link></li>
                            <li><Link href="/#use-cases" className="hover:text-indigo-600 transition-colors">Use Cases</Link></li>
                            <li><Link href="/#pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 mb-10 uppercase tracking-[0.2em] text-[10px] opacity-40">Company</h4>
                        <ul className="space-y-5 text-slate-600 text-sm font-bold">
                            <li><Link href="/about" className="hover:text-indigo-600 transition-colors">About</Link></li>
                            <li><Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 mb-10 uppercase tracking-[0.2em] text-[10px] opacity-40">Legal</h4>
                        <ul className="space-y-5 text-slate-600 text-sm font-bold cursor-pointer">
                            <li className="hover:text-indigo-600 transition-colors"><Link href="/terms">Terms</Link></li>
                            <li className="hover:text-indigo-600 transition-colors"><Link href="/privacy">Privacy</Link></li>
                            <li className="hover:text-indigo-600 transition-colors"><Link href="/refunds">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-10 border-t border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">© {new Date().getFullYear()} Affvance • Intelligent Growth Analytics • All Rights Reserved</span>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                        <Activity className="w-4 h-4 animate-pulse" /> Dashboard Nodes Operating at 100%
                    </div>
                </div>
            </div>
        </footer>
    );
};
