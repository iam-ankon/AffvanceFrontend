'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';


export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Use Cases', href: '#use-cases' },
        { name: 'Pricing', href: '#pricing' },
    ];

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled || isOpen ? 'bg-white/95 backdrop-blur-xl py-4 border-b border-slate-100 shadow-sm' : 'bg-transparent py-8'}`}>
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                <Link href="/" onClick={() => { window.scrollTo(0, 0); setIsOpen(false); }} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200 transition-transform group-hover:rotate-6">
                        <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <div className="flex flex-col -space-y-1">
                        <span className="text-3xl font-black tracking-tighter text-slate-900 leading-none">Affvance</span>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.25em]">Rank. Reach. Revenue</span>
                    </div>
                </Link>
                <div className="hidden lg:flex items-center gap-8">
                    {navLinks.map(link => (
                        <Link key={link.name} href={link.href} className="text-slate-600 hover:text-indigo-600 font-bold text-sm uppercase tracking-tight transition-colors">{link.name}</Link>
                    ))}
                    <div className="flex items-center bg-indigo-600 px-7 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-xl shadow-indigo-100/30">
                        <Link href="/app" className="hover:text-indigo-200 transition-colors">Login</Link>
                        <span className="mx-3 opacity-30">|</span>
                        <Link href="/app/keyword-lab" className="hover:text-indigo-200 transition-colors">Enter Lab · $1</Link>
                    </div>
                </div>
                <button className="lg:hidden text-slate-900 z-50" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-slate-100 overflow-hidden"
                    >
                        <div className="flex flex-col gap-6 p-8">
                            {navLinks.map(link => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-slate-900 hover:text-indigo-600 font-black text-xl uppercase tracking-tight transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
                                <Link
                                    href="/app"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 bg-slate-100 text-slate-900 rounded-xl font-black text-center uppercase tracking-widest text-sm hover:bg-slate-200 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/app/keyword-lab"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-center uppercase tracking-widest text-sm shadow-lg shadow-indigo-100/30 hover:bg-indigo-700 transition-colors"
                                >
                                    Enter Lab · $1
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
