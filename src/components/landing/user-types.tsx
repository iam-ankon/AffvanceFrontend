import React from 'react';
import { Users, Globe2, ShoppingBag, Briefcase, Layers, Megaphone, Award } from 'lucide-react';

export const UserTypesSection = () => (
    <section className="py-32 px-4 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
                <div className="inline-block p-4 bg-indigo-600/10 rounded-3xl mb-6"><Users className="w-10 h-10 text-indigo-600" /></div>
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-none">Who Is It For?</h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">Empowering professionals to build high-revenue content assets.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { icon: <Globe2 className="w-7 h-7" />, title: "Niche Publishers", benefit: "Build high-authority topical sites that dominate SERPs and maximize ad revenue." },
                    { icon: <ShoppingBag className="w-7 h-7" />, title: "Affiliate Marketers", benefit: "Generate high-converting product roundups and reviews at lightning scale." },
                    { icon: <Briefcase className="w-7 h-7" />, title: "SEO Agencies", benefit: "Deliver premium, SEO-optimized content to clients with zero manual overhead." },
                    { icon: <Layers className="w-7 h-7" />, title: "Portfolio Moguls", benefit: "Manage dozens of niche assets effortlessly with automated publishing loops." },
                    { icon: <Megaphone className="w-7 h-7" />, title: "Brand Strategists", benefit: "Maintain a constant flow of fresh, relevant content to boost organic brand reach." },
                    { icon: <Award className="w-7 h-7" />, title: "Content Arbitrageurs", benefit: "Maximize ROI by producing expert-level niche assets for just pennies on the dollar." }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-500 group">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">{item.icon}</div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{item.title}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">{item.benefit}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
