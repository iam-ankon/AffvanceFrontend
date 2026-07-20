import React from 'react';
import { Target, SearchCode, Cpu, Gauge, CalendarDays, Globe } from 'lucide-react';

export const HowItWorks = () => (
    <section id="how-it-works" className="bg-background py-32 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
                <div className="inline-block p-4 bg-indigo-600/10 rounded-3xl mb-6"><Target className="w-10 h-10 text-indigo-600" /></div>
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-none">How It Works</h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">Your step-by-step path from keyword discovery to revenue generation.</p>
            </div>
            <div className="relative grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 z-10">
                {[
                    { step: "01", title: "Find Niche", desc: "Search niche keywords with low competition for high ranking content that dominates SERPs.", icon: <SearchCode className="w-6 h-6" />, color: "indigo" },
                    { step: "02", title: "Auto-Write", desc: "Create content single, co-pilot or bulk on one click with precision AI trained for any niche.", icon: <Cpu className="w-6 h-6" />, color: "emerald" },
                    { step: "03", title: "SEO Review", desc: "Check content rating and SEO optimization scores before you post to ensure maximum authority.", icon: <Gauge className="w-6 h-6" />, color: "rose" },
                    { step: "04", title: "Schedule", desc: "Use published day or time for following days or instant publish content directly to your site.", icon: <CalendarDays className="w-6 h-6" />, color: "amber" },
                    { step: "05", title: "Scale & Analytics", desc: "Review detailed analytics of content performance and niche growth to optimize for revenue.", icon: <Globe className="w-6 h-6" />, color: "violet" }
                ].map((item, i) => (
                    <div key={i} className="group h-full">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-xl group-hover:-translate-y-3 transition-all duration-500 h-full flex flex-col">
                            <div className={`w-14 h-14 bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>{item.icon}</div>
                            <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight">{item.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
