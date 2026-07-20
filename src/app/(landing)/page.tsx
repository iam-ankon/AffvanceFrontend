'use client';

import React from 'react';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { SingleLineHeroTitle } from '@/components/landing/single-line-hero-title';
import { HowItWorks } from '@/components/landing/how-it-works';
import { UserTypesSection } from '@/components/landing/user-types';
import { FeaturesSection } from '@/components/landing/features-section';
import { NicheLab } from '@/components/landing/niche-lab';
import { Pricing } from '@/components/landing/pricing';
import { FAQSection } from '@/components/landing/faq-section';
import { BlogSection } from '@/components/landing/blog-section';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
      <Navbar />
      <SingleLineHeroTitle />
      <Hero />
      <HowItWorks />
      <UserTypesSection />
      <FeaturesSection />
      <NicheLab />
      <Pricing />
      <FAQSection />
      <BlogSection />
      <Footer />
    </div>
  );
}
