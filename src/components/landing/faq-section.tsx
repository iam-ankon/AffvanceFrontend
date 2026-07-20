'use client';

import React, { useState } from 'react';
import { HelpCircle, MinusCircle, PlusCircle } from 'lucide-react';

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
            >
                <span className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{question}</span>
                {isOpen ? <MinusCircle className="w-6 h-6 text-indigo-600 shrink-0" /> : <PlusCircle className="w-6 h-6 text-slate-300 shrink-0" />}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                <p className="text-slate-600 font-medium leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

export const FAQSection = () => (
    <section className="py-32 px-4 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
                <div className="inline-block p-4 bg-indigo-600/10 rounded-3xl mb-6"><HelpCircle className="w-10 h-10 text-indigo-600" /></div>
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-none">Common Inquiries</h2>
                <p className="text-xl text-slate-600 font-medium">Everything you need to know about scaling your content empire.</p>
            </div>
            <div className="bg-slate-50/50 rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
                <AccordionItem
                    question="Is the content truly plagiarism-free?"
                    answer="Yes, our AI generates 100% original content from scratch based on real-time niche intelligence, bypassing standard plagiarism detectors with ease."
                />
                <AccordionItem
                    question="Can I connect my own WordPress site?"
                    answer="Absolutely. We offer direct CMS integration for WordPress, Blogger, and custom APIs for instant one-click publishing and scheduling."
                />
                <AccordionItem
                    question="What exactly are tokens used for?"
                    answer="Tokens represent the compute power used to scan niches and generate expert articles. One high-quality article typically consumes a set amount of tokens."
                />
                <AccordionItem
                    question="Do monthly tokens expire?"
                    answer="Monthly subscription tokens reset each billing cycle. However, Explorer Pass tokens are one-time use and never expire until consumed."
                />
                <AccordionItem
                    question="Is there a limit to how many sites I can add?"
                    answer="Depending on your chosen subscription tier (Growth or Agency), you can sync multiple domains for centralized bulk management and publishing."
                />
                <AccordionItem
                    question="How does the $1 Explorer Pass work?"
                    answer="It's a low-cost activation license that lets you test the Intelligence Lab and generate your first expert-level niche post before committing to a plan."
                />
            </div>
        </div>
    </section>
);
