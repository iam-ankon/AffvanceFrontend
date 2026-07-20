
'use client';

import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
    q: string;
    a: string;
}

export const FAQClient = ({ items }: { items: FAQItem[] }) => {
    return (
        <Accordion type="single" collapsible className="w-full space-y-4">
            {items.map((item, i) => (
                <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border-b border-border transition-all hover:bg-muted/30 px-6 rounded-2xl"
                >
                    <AccordionTrigger className="text-xl md:text-2xl font-black text-foreground hover:text-indigo-600 transition-colors py-8 hover:no-underline">
                        {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-lg leading-relaxed font-medium pb-8 animate-in slide-in-from-top-2">
                        {item.a}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};
