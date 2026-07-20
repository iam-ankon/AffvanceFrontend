'use client';

import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, MessageSquare, Twitter, Facebook, Linkedin, Instagram, Rocket, Sparkles } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
                <div className="text-center animate-in fade-in slide-in-from-top-4 duration-700 mb-20 flex flex-col items-center">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-50/50 backdrop-blur-sm border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
                        <Rocket className="w-4 h-4 animate-pulse" /> Always here to help
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tighter mb-6 relative">
                        Get in <span className="gradient-text">Touch</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl font-medium opacity-90 mx-auto">
                        Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    {/* Left side: Form */}
                    <div className="bg-white/70 backdrop-blur-md rounded-[2rem] border border-slate-200 p-8 md:p-10 shadow-2xl shadow-slate-200/50 relative">
                        {/* Decorative element */}
                        <div className="absolute -top-4 -right-4 bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 transform rotate-12">
                            <Sparkles className="w-6 h-6" />
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Send us a message</h2>

                        <form className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Your Name</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 z-10">
                                        <User className="w-5 h-5 text-indigo-400" strokeWidth={2.5} />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="John Doe"
                                        className="pl-12 bg-white/50 border-slate-200 rounded-2xl h-14 text-slate-900 font-medium placeholder:text-slate-400 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 w-full transition-all shadow-sm focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 z-10">
                                        <Mail className="w-5 h-5 text-indigo-400" strokeWidth={2.5} />
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="pl-12 bg-white/50 border-slate-200 rounded-2xl h-14 text-slate-900 font-medium placeholder:text-slate-400 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 w-full transition-all shadow-sm focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Message</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-4 z-10">
                                        <MessageSquare className="w-5 h-5 text-indigo-400" strokeWidth={2.5} />
                                    </div>
                                    <Textarea
                                        placeholder="How can we help you today?"
                                        className="pl-12 pt-4 bg-white/50 min-h-[160px] border-slate-200 rounded-3xl text-slate-900 font-medium placeholder:text-slate-400 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 resize-y w-full transition-all shadow-sm focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button className="w-full px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 group">
                                    Send Message <Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right side: Content */}
                    <div className="lg:pl-8 flex flex-col justify-center h-full space-y-12 pb-8">
                        {/* Chat Card */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-3xl relative overflow-hidden group">
                            <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-600/20 blur-[50px] rounded-full pointer-events-none"></div>

                            <h3 className="text-white font-black text-xl mb-4 tracking-tight">Chat with us</h3>
                            <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                                If you'd prefer to chat in real time with our support team, we're online Monday to Friday whatever your time zone.
                            </p>

                            <button className="px-6 py-4 bg-indigo-500/10 text-indigo-400 rounded-2xl font-black text-[15px] hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors border border-indigo-500/20 w-full flex items-center justify-center gap-2">
                                Start a conversation <MessageSquare className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Social Card */}
                        <div className="bg-white/70 backdrop-blur-md rounded-[2rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/30">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-6">Connect across platforms</h3>
                            <div className="flex gap-4">
                                <a href="#" className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl hover:bg-indigo-600 hover:text-white text-indigo-600 hover:rotate-6 hover:scale-110 transition-all flex items-center justify-center">
                                    <Twitter className="h-5 w-5 fill-current" />
                                </a>
                                <a href="#" className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl hover:bg-indigo-600 hover:text-white text-indigo-600 hover:-rotate-6 hover:scale-110 transition-all flex items-center justify-center">
                                    <Facebook className="h-5 w-5 fill-current border-none" />
                                </a>
                                <a href="#" className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl hover:bg-indigo-600 hover:text-white text-indigo-600 hover:rotate-6 hover:scale-110 transition-all flex items-center justify-center">
                                    <Linkedin className="h-5 w-5 fill-current" />
                                </a>
                                <a href="#" className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl hover:bg-indigo-600 hover:text-white text-indigo-600 hover:-rotate-6 hover:scale-110 transition-all flex items-center justify-center">
                                    <Instagram className="h-5 w-5" strokeWidth={2.5} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
