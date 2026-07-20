'use client';

import React, { useState } from 'react';
import { Database, TrendingUp as TrendingIcon } from 'lucide-react';

const GrowthChart = () => (
    <div className="w-full bg-background border border-slate-800 rounded-[3rem] p-10 shadow-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full"></div>
        <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Live Opportunity Matrix</span>
                <h4 className="text-2xl font-black text-white">Ranking Velocity Hub</h4>
            </div>
            <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <TrendingIcon className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 text-[10px] font-black">Score: 94/100</span>
                </div>
            </div>
        </div>
        <div className="h-48 flex items-end gap-3 px-2 mb-10 relative z-10">
            {[45, 65, 55, 95, 85, 120, 140, 130, 160, 125, 175].map((h, i) => (
                <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-1000 hover:from-indigo-400 hover:to-white group relative"
                    style={{ height: `${(h / 175) * 100}%` }}
                ></div>
            ))}
        </div>
    </div>
);

export const NicheLab = () => {
    const [keyword, setKeyword] = useState('');
    const [loading, setLowing] = useState(false);
    return (
        <section id="keyword-lab" className="py-32 px-4 overflow-hidden relative bg-background">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-widest mb-6">Discovery Engine</div>
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">Niche <span className="text-indigo-600">Intelligence Lab</span></h2>
                    <p className="text-xl text-slate-600 mb-12 font-medium leading-relaxed">Discover low-competition keywords in seconds. Our Lab identifies gaps in search engine results for any publisher to dominate.</p>
                    <div className="flex flex-col gap-4 max-w-md">
                        <div className="relative">
                            <input type="text" placeholder="Enter Niche (e.g. Pet Tech)" value={keyword} onChange={e => setKeyword(e.target.value)} className="w-full bg-white border border-slate-200 pl-8 pr-32 py-6 rounded-[2rem] text-xl font-medium focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
                            <button className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all" onClick={() => { setLowing(true); setTimeout(() => setLowing(false), 2000); }}>{loading ? 'Scanning...' : 'Scan Lab'}</button>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-black uppercase tracking-widest ml-6">
                            <Database className="w-3 h-3 text-emerald-500" /> Scanning Search Indices...
                        </div>
                    </div>
                </div>
                <GrowthChart />
            </div>
        </section>
    );
};
