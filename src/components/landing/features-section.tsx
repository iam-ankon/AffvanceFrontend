import React from 'react';
import { Network, Maximize, Layout, ShieldCheck, Link2, DollarSign } from 'lucide-react';

export const FeaturesSection = () => (
    <section id="use-cases" className="py-32 px-4 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">Use Cases</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">Professional tools designed for publishers who want to own their market.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[
                    { title: "Expert SEO Engine", icon: <Network className="w-8 h-8" />, desc: "AI that understands search intent to create content Google wants to show.", stat: "Page 1 Ready" },
                    { title: "Bulk Factory", icon: <Maximize className="w-8 h-8" />, desc: "Generate 100 articles in seconds. Perfect for scaling new sites or portfolios.", stat: "Scale at Will" },
                    { title: "Snippet Booster", icon: <Layout className="w-8 h-8" />, desc: "Structured to win Featured Snippets, giving you visibility at the top of Google.", stat: "Top 0 Winner" },
                    { title: "Originality Shield", icon: <ShieldCheck className="w-8 h-8" />, desc: "100% unique, plagiarism-free content. Safe from AI penalties and reviews.", stat: "100% Unique" },
                    { title: "Integrated CMS Sync", icon: <Link2 className="w-8 h-8" />, desc: "Auto-post directly to WordPress, Blogger, or custom APIs without manual work.", stat: "Auto-Publish" },
                    { title: "Profit Dashboard", icon: <DollarSign className="w-8 h-8" />, desc: "Track which keywords are driving the most value and growth for your business.", stat: "Track Growth" }
                ].map((item, i) => (
                    <div key={i} className="group p-10 rounded-[3rem] bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-slate-900 hover:text-white transition-all duration-500 hover:shadow-2xl">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 transition-all shadow-sm">{item.icon}</div>
                        <h3 className="text-2xl font-black leading-tight mb-4">{item.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-400 font-medium">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
