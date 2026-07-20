
import React from 'react';
import { ShoppingBag, Megaphone, Edit3, BookOpen, Store, Newspaper } from 'lucide-react';
import { PointerHighlight } from '@/components/ui/pointer-highlight';

export const NicheCommanders = () => (
    <section className="py-32 px-4 bg-foreground text-background overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
                <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none flex items-center justify-center gap-x-4 flex-wrap">
                    Built For
                    <PointerHighlight
                        rectangleClassName="border-indigo-600 border-2"
                        pointerClassName="text-indigo-600 fill-indigo-600"
                    >
                        <span className="text-indigo-600 px-4 py-2 block">Every Creator</span>
                    </PointerHighlight>
                </h2>
                <p className="text-xl text-background/60 max-w-3xl mx-auto font-medium">Join the elite circle of publishers dominating their markets globally.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: "Affiliate Marketers", type: "E-com & Reviews", desc: "Generate 'Best of' guides that convert. Review products with unique insights that satisfy E-E-A-T.", icon: <ShoppingBag className="w-6 h-6 text-emerald-400" /> },
                    { title: "Content Agencies", type: "Bulk Scaling", desc: "Scale your client output 10x without the overhead. Prove ROI in the first 30 days of use.", icon: <Megaphone className="w-6 h-6 text-indigo-600" /> },
                    { title: "Niche Bloggers", type: "Lifestyle & Hobby", desc: "Bypass writer's block forever. Generate unique stories based on low-competition keywords.", icon: <Edit3 className="w-6 h-6 text-rose-400" /> },
                    { title: "Course Creators", type: "Expert Authority", desc: "Turn expertise into thousands of educational pages. Build authority in your specific domain.", icon: <BookOpen className="w-6 h-6 text-amber-400" /> },
                    { title: "Store Owners", type: "Shopify & Amazon", desc: "Create informational content that leads customers straight to your checkout pages.", icon: <Store className="w-6 h-6 text-cyan-400" /> },
                    { title: "News Portals", type: "Viral & Trending", desc: "Publish timely niche articles at light speed. Own the news cycle for your industry.", icon: <Newspaper className="w-6 h-6 text-violet-400" /> }
                ].map((commander, i) => (
                    <div key={i} className="bg-background/5 border border-background/10 p-10 rounded-[2.5rem] hover:bg-background/10 transition-all group">
                        <div className="w-14 h-14 bg-background/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">{commander.icon}</div>
                        <h4 className="text-2xl font-black mb-1">{commander.title}</h4>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6">{commander.type}</p>
                        <p className="text-background/60 text-sm leading-relaxed font-medium">{commander.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
