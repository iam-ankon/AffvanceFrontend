import React from 'react';
import { TrendingUp as TrendingIcon } from 'lucide-react';
import { KeywordLabClient } from './keyword-lab-client';

const GrowthChart = () => (
    <div className="w-full bg-backgrould border border-slate-800 rounded-[3rem] p-10 shadow-3xl relative overflow-hidden group">
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

export const KeywordLab = () => {
    return (
        <section id="keyword-lab" className="py-32 px-4 overflow-hidden relative bg-background">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-widest mb-6">Discovery Engine</div>
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">Niche <span className="text-indigo-600">Intelligence Lab</span></h2>
                    <p className="text-xl text-slate-600 mb-12 font-medium leading-relaxed">Discover low-competition keywords in seconds. Our Lab identifies gaps in search engine results for any publisher to dominate.</p>
                    {/* <KeywordLabClient /> */}
                </div>
                <GrowthChart />
            </div>
        </section>
    );
};
