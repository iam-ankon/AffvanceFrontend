'use client';

import React, { useState } from 'react';
import { DollarSign, CheckCircle2, Flame, Zap, ShieldCheck } from 'lucide-react';

type BillingCycle = 'monthly' | 'yearly';

export const Pricing = () => {
    const [cycle, setCycle] = useState<BillingCycle>('monthly');
    const plans = [
        { name: "Pro", monthlyPrice: 29, originalPrice: 39, tokens: "250,000 Tokens", desc: "For solo bloggers.", features: ["500 Keywords", "SEO Quality Score", "CMS Sync", "Originality Shield", "Weekly Growth Report"], cta: "Try Pro", popular: false },
        { name: "Growth", monthlyPrice: 79, originalPrice: 99, tokens: "1 Million Tokens", desc: "For publishers.", features: ["1500 Keywords", "Bulk Content Mode", "Auto-Link Clusters", "Priority Search Node", "Keyword Lab Pro", "Snippet Pro"], cta: "Start Growth", popular: true },
        { name: "Agency", monthlyPrice: 199, originalPrice: 249, tokens: "3 Million Tokens", desc: "For power teams.", features: ["5000 Keywords", "Team Workspaces", "API Automation", "Expert Consult", "White-Label Hub", "Managed Loops"], cta: "Join Agency", popular: false }
    ];

    const calculateAnnualPrice = (p: number) => p * 10;
    const calculateYearlyMonthlyEquiv = (p: number) => Math.floor((p * 10) / 12);

    return (
        <section id="pricing" className="py-32 px-4 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block p-4 bg-emerald-500/10 rounded-3xl mb-6"><DollarSign className="w-10 h-10 text-emerald-600" /></div>
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-none">Revenue Subscription</h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">Predictable pricing to fuel your content empire and grow profits.</p>
                </div>
                <div className="flex justify-center items-center gap-6 mb-24">
                    <span className={`text-sm font-black uppercase tracking-widest transition-colors ${cycle === 'monthly' ? 'text-indigo-600' : 'text-slate-400'}`}>Monthly</span>
                    <button onClick={() => setCycle(cycle === 'monthly' ? 'yearly' : 'monthly')} className="w-16 h-8 bg-slate-200 rounded-full relative p-1 transition-colors hover:bg-slate-300">
                        <div className={`w-6 h-6 bg-indigo-600 rounded-full transition-transform duration-300 shadow-md ${cycle === 'yearly' ? 'translate-x-8' : 'translate-x-0'}`}></div>
                    </button>
                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-black uppercase tracking-widest transition-colors ${cycle === 'yearly' ? 'text-indigo-600' : 'text-slate-400'}`}>Yearly</span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-200 animate-pulse">2 Months Save!</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-end">
                    {plans.map((plan, i) => (
                        <div key={i} className={`relative pt-20 pb-14 px-8 rounded-[4rem] bg-white border ${plan.popular ? 'border-indigo-600 shadow-3xl shadow-indigo-100 ring-4 ring-indigo-500/5 z-10' : 'border-slate-200 shadow-xl'} flex flex-col transition-all hover:-translate-y-2 duration-500 min-h-[880px]`}>
                            {plan.popular && <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Most Popular</div>}
                            <div className="text-center mb-10">
                                <h3 className="text-3xl font-black mb-2">{plan.name}</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10 h-8">{plan.desc}</p>
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <span className="text-xl font-black text-slate-400">$</span>
                                        {cycle === 'monthly' && (
                                            <span className="text-3xl font-black text-slate-300 line-through mr-2 decoration-2 opacity-80">${plan.originalPrice}</span>
                                        )}
                                        <span className="text-7xl font-black text-slate-900 tracking-tighter leading-none">
                                            {cycle === 'monthly' ? plan.monthlyPrice : calculateAnnualPrice(plan.monthlyPrice)}
                                        </span>
                                    </div>

                                    {cycle === 'monthly' ? (
                                        <div className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-4">per month</div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 mb-4">
                                            <div className="text-indigo-600 font-black uppercase text-[10px] tracking-[0.2em]">Billed Yearly</div>
                                            <div className="text-slate-400 text-[11px] font-medium leading-none">(~ ${calculateYearlyMonthlyEquiv(plan.monthlyPrice)}/month)</div>
                                        </div>
                                    )}

                                    <div className="inline-block px-5 py-2 bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-widest rounded-xl border border-indigo-100">
                                        {plan.tokens}{cycle === 'yearly' ? '/Month' : ''}
                                    </div>
                                </div>
                            </div>
                            <ul className="space-y-5 mb-14 flex-1 border-t border-slate-50 pt-10">
                                {plan.features.map((f, j) => {
                                    const displayFeature = (j === 0 && cycle === 'yearly') ? `${f}/Month` : f;
                                    return (
                                        <li key={j} className="flex items-start gap-4 text-slate-600 text-[12px] font-bold leading-tight">
                                            <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" /> {displayFeature}
                                        </li>
                                    );
                                })}
                            </ul>
                            <button className={`w-full py-7 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200' : 'bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white'}`}>{plan.cta}</button>
                        </div>
                    ))}
                    <div className="relative p-10 rounded-[3.5rem] bg-slate-950 text-white border-2 border-indigo-500 shadow-[0_25px_60px_-15px_rgba(79,70,229,0.4)] flex flex-col transition-all hover:-translate-y-2 duration-500 overflow-hidden min-h-[750px] group lg:scale-95 origin-bottom">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500"><Flame className="w-24 h-24 text-indigo-400" /></div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="inline-block px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-8 self-start shadow-lg animate-bounce">Limited Pass</div>
                            <h3 className="text-4xl font-black mb-2 tracking-tighter leading-none">Explorer <br /> Pass</h3>
                            <p className="text-slate-400 text-[11px] font-bold mb-10 leading-relaxed uppercase tracking-[0.1em]">Instant Entry License</p>
                            <div className="flex flex-col items-center justify-center py-14 bg-white/5 rounded-[3rem] border border-white/10 mb-10 shadow-2xl relative group-hover:bg-white/10 transition-colors text-center">
                                <div className="flex items-baseline gap-1 justify-center">
                                    <span className="text-3xl font-black text-indigo-400">$</span>
                                    <span className="text-[10rem] font-black text-white tracking-tighter leading-none drop-shadow-2xl">1</span>
                                </div>
                                <div className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-4">per pass</div>
                                <div className="inline-block px-5 py-2 bg-indigo-500/20 text-indigo-200 text-[11px] font-black uppercase tracking-widest rounded-xl border border-white/10 mb-2">1500 Tokens</div>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">One-Time Activation</div>
                            </div>
                            <div className="space-y-6 mb-12 px-2 mt-4">
                                <div className="flex items-center gap-4"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /><span className="text-slate-200 text-xs font-bold leading-tight">20 Keywords Scan</span></div>
                                <div className="flex items-center gap-4"><Zap className="w-4 h-4 text-indigo-400 shrink-0" /><span className="text-slate-200 text-xs font-bold leading-tight">1st Expert Niche Post Ready</span></div>
                                <div className="flex items-center gap-4"><ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" /><span className="text-slate-200 text-xs font-bold leading-tight">Complete Lab Access</span></div>
                            </div>
                            <button className="w-full py-7 bg-white text-slate-900 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all shadow-2xl mt-auto">Get Pass for $1</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
