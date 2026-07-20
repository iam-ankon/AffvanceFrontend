import React from 'react';
import { ChevronRight } from 'lucide-react';

export const BlogSection = () => (
    <section id="strategy" className="py-32 px-4 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div>
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-none">Organic Insights</h2>
                <p className="text-xl text-slate-600 font-medium">Expert strategies for dominating search and scaling revenue.</p>
            </div>
            <button className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">Explore Hub</button>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
            {[
                { title: "Winning with Micro-Niches", desc: "Scale from zero to 100k visitors using low-competition keywords.", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800", tag: "Case Study" },
                { title: "SEO in the Age of AI", desc: "Why human-quality is the only way to survive algorithm updates.", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800", tag: "Trends" },
                { title: "Bulk Publishing Mastery", desc: "Manage 50+ websites with ease and generate passive revenue.", img: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=800", tag: "Tips" }
            ].map((post, i) => (
                <div key={i} className="group cursor-pointer bg-white p-6 rounded-[2.5rem] border border-slate-200 hover:shadow-2xl transition-all duration-500">
                    <div className="relative h-56 rounded-3xl overflow-hidden mb-8 shadow-xl">
                        <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 left-4 bg-white/95 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-50 shadow-sm">{post.tag}</div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">{post.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium mb-8 line-clamp-2">{post.desc}</p>
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em]">Read Strategy <ChevronRight className="w-4 h-4" /></div>
                </div>
            ))}
        </div>
    </section>
);
