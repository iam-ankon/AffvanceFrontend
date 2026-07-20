'use client';

import { LegalPage } from '@/components/landing/legal-page';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const aboutContent = `The future of digital execution belongs to intelligent systems built for measurable growth. Affvance exists to lead that movement.

We design advanced AI automation platforms and professional AI agents that transform how creators, entrepreneurs, and online businesses operate. Our mission is to eliminate complexity, increase efficiency, and convert digital effort into scalable revenue opportunities.

At the core of our innovation is AI driven content generation engineered for structured, search optimized performance. Our system is designed to produce high quality, SEO focused content that aligns with ranking principles and supports stronger visibility in search engines. By combining intelligent formatting, keyword structuring, and strategic content flow, our platform helps users build authority, improve discoverability, and increase organic traffic that converts into revenue.

Affvance is built by experts in AI systems, SaaS architecture, and IT consultancy who understand that technology must deliver outcomes, not just output. Every feature is developed with precision, security, and performance optimization to ensure our users gain long term competitive advantage.

Our professional AI agents operate as digital growth partners. They streamline execution, enhance strategic planning, and support niche focused monetization models with consistency and scalability.

We are not just developing applications. We are creating intelligent infrastructure for the next generation of digital entrepreneurs.

Affvance stands for performance, visibility, and sustainable growth powered by artificial intelligence.`;

export default function AboutPage() {
    return (
        <div className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
            <Navbar />
            <LegalPage title="About Affvance" content={aboutContent} />
            <Footer />
        </div>
    );
}
