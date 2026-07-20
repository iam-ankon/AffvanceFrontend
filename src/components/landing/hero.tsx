import React from 'react';
import {
    ArrowRight,
    ShieldCheck,
    Zap,
    MonitorCheck,
    Rocket,
    TrendingUp as TrendingIcon,
} from 'lucide-react';

const SmallSparkline = ({ color = "indigo" }: { color?: string }) => (
    <div className="flex items-end gap-1 h-8 px-2">
        {[30, 45, 35, 60, 50, 80, 70].map((h, i) => (
            <div
                key={i}
                className={`w-1 rounded-t-full bg-${color}-500/40`}
                style={{ height: `${h}%` }}
            ></div>
        ))}
    </div>
);

export const Hero = () => (
    <section className="relative pt-8 pb-32 px-4 overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
            <div className="text-left animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-50/50 backdrop-blur-sm border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-sm">
                    <Rocket className="w-4 h-4 animate-pulse" /> Precision Organic Growth Engine
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-[1.05] tracking-tighter">
                    Dominate Your <span className="gradient-text">Niche</span> <br />
                    With AI Content <br />
                    On Autopilot.
                </h1>
                <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed max-w-lg font-medium opacity-90">
                    The ultimate engine for publishers. Build quality, plagiarism-free keyword-targeted assets and sync directly with your <span className="text-indigo-600 font-bold">CMS</span> for maximum organic reach and ROI.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 mb-16">
                    <button className="px-10 py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-200 flex items-center justify-center gap-4 group">
                        Start for $1 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </button>
                    <div className="flex items-center gap-3 px-6 py-6 bg-white/70 backdrop-blur-md border border-slate-200 rounded-[1.5rem] shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Status</span>
                            <span className="text-lg font-black text-emerald-600">Active Ranking</span>
                        </div>
                        <SmallSparkline color="emerald" />
                    </div>
                </div>
            </div>
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-3xl relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-10 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <MonitorCheck className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-sm uppercase tracking-widest">Niche Command</h4>
                                <p className="text-indigo-400 text-[10px] font-bold">Integrated CMS Active</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Live Analysis</span>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl">
                            <p className="text-[10px] font-black uppercase opacity-60 mb-1">Monthly Organic Revenue Potential</p>
                            <p className="text-5xl font-black tracking-tighter">$42,850.00</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 text-white hover:bg-white/10 transition-colors">
                                <p className="text-[9px] font-black uppercase opacity-40 mb-2">Plagiarism Health</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black">0% Spin</span>
                                    <ShieldCheck className="w-6 h-6 text-indigo-500" />
                                </div>
                            </div>
                            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 text-white hover:bg-white/10 transition-colors">
                                <p className="text-[9px] font-black uppercase opacity-40 mb-2">Post Velocity</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black">Fast Mode</span>
                                    <Zap className="w-6 h-6 text-amber-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
                </div>
            </div>
        </div>
    </section>
);
