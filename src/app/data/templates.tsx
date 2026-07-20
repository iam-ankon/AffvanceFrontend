'use client';

import { FileText, GitCompare, HelpCircle, ListChecks, ShoppingCart, Star } from 'lucide-react';
import type { ContentType } from '@/lib/api/content';

export interface ArticleSection {
  id: string;
  title: string;
  description?: string;
  required?: boolean;
  type?: 'heading' | 'content' | 'table' | 'list' | 'cta';
}

export interface ArticleTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  useCase: string;
  sections: string[];
}

export type ArticleStructureType =
  | 'blog'
  | 'product-reviews'
  | 'comparison'
  | 'how-to-guides'
  | 'listicles'
  | 'buying-guides';

// Mapping from API content type names to structure type keys
const CONTENT_TYPE_NAME_TO_KEY: Record<string, ArticleStructureType> = {
  'Standard Blog Post': 'blog',
  'Product Review': 'product-reviews',
  'Comparison Article': 'comparison',
  'How-to Guide': 'how-to-guides',
  'List Article (Top 10, Best Of)': 'listicles',
  'Buying Guide': 'buying-guides'
};

// Icon mapping for each structure type
const STRUCTURE_TYPE_ICONS: Record<ArticleStructureType, React.ReactNode> = {
  blog: <FileText className="h-3.5 w-3.5" />,
  'product-reviews': <Star className="h-3.5 w-3.5" />,
  comparison: <GitCompare className="h-3.5 w-3.5" />,
  'how-to-guides': <HelpCircle className="h-3.5 w-3.5" />,
  listicles: <ListChecks className="h-3.5 w-3.5" />,
  'buying-guides': <ShoppingCart className="h-3.5 w-3.5" />
};

// Sections mapping (still hardcoded as they're not in the API)
const STRUCTURE_TYPE_SECTIONS: Record<ArticleStructureType, string[]> = {
  blog: [
    'Title & Primary Keyword (H1)',
    'Featured Snippet Answer (40–60 words)',
    'Table of Contents (Anchor Links)',
    'Introduction (Problem + Promise)',
    'Search Intent Match (What & Why)',
    'Entity Overview & Definitions',
    'Key Benefits / Use Cases',
    'Step-by-Step / Process (if applicable)',
    'Pros & Cons / Trade-offs',
    'Comparison Snapshot (Table)',
    'Real Examples / Case Study',
    'Expert Tips & Common Pitfalls',
    'Data & Stats (Cited)',
    'Internal Links (Related Hubs/Spokes)',
    'External Authoritative Sources',
    'FAQs (People Also Ask)',
    'Summary / Key Takeaways',
    'CTA (Next Step / Lead Magnet)'
  ],
  'product-reviews': [
    'Title & Product Name (H1)',
    'Verdict at a Glance (Pros/Cons bullets)',
    "Who It's For / Not For",
    'Specs & Key Features (Table)',
    'Design & Build Quality',
    'Performance / Benchmarks',
    'Battery / Endurance / Maintenance',
    'In-the-Field Testing (Use Cases)',
    'Comparison with Alternatives (Table)',
    'Price & Value / Warranty',
    'Real User Feedback (Quotes / Ratings)',
    'Issues & Workarounds',
    'Affiliate Disclosure',
    'FAQs',
    'Bottom Line (Score)',
    'CTA (Where to Buy)'
  ],
  comparison: [
    'Title & Keyword (H1)',
    'Quick Compare Table (Key Specs)',
    'Methodology (How We Compared)',
    'Use-Case Fit (Best For…)',
    'Option A Overview + Pros/Cons',
    'Option B Overview + Pros/Cons',
    'Head-to-Head (A vs B) by Criteria',
    'Performance / Quality / Price',
    'Third Option or Tie-Breakers',
    'Recommendations (Scenarios)',
    'FAQs',
    'Conclusion (Winner & Why)',
    'CTA (Choose / Try / Buy)'
  ],
  'how-to-guides': [
    'Title & Outcome (H1)',
    'Featured Snippet Steps (0–5 summary)',
    'Prerequisites / Tools / Safety',
    'Step 1',
    'Step 2',
    'Step 3',
    'Step 4',
    'Step 5',
    'Troubleshooting / Pitfalls',
    'Tips & Best Practices',
    'Checklist / Template Download',
    'FAQs',
    'Conclusion (Result Recap)',
    'CTA (Next Tutorial / Resource)'
  ],
  listicles: [
    'Title & Primary Keyword (H1)',
    'Top Picks (Summary Table)',
    'How We Chose (Criteria)',
    'Pick #1 — Overview / Key Specs / Pros & Cons',
    'Pick #2 — Overview / Key Specs / Pros & Cons',
    'Pick #3 — Overview / Key Specs / Pros & Cons',
    'Pick #4 — Overview / Key Specs / Pros & Cons',
    'Pick #5 — Overview / Key Specs / Pros & Cons',
    'Honourable Mentions',
    'Comparison Table',
    "Buyer's Guide (What to Consider)",
    'FAQs',
    'Conclusion (Best For X)',
    'CTA (See Prices / View All)'
  ],
  'buying-guides': [
    'Title & Primary Keyword (H1)',
    'TL;DR Cheat Sheet',
    'What to Look For (Key Factors)',
    'Power / Size / Capacity (by Need)',
    'Compatibility & Ports',
    'Durability / Warranty / Safety',
    'Budget Tiers (Good / Better / Best)',
    'Top Picks by Scenario',
    'Mistakes to Avoid',
    'Comparison Table',
    'FAQs',
    'Conclusion (Recommended Picks)',
    'CTA (Shop / Compare)'
  ]
};

// Fallback templates (used when API data is not available)
const FALLBACK_TEMPLATES: Record<ArticleStructureType, ArticleTemplate> = {
  blog: {
    id: 'blog',
    name: 'Standard Blog Post',
    icon: STRUCTURE_TYPE_ICONS.blog,
    description: 'Comprehensive informational content for educational and awareness purposes',
    useCase: 'Educational content, thought leadership, SEO optimization, topical authority building',
    sections: STRUCTURE_TYPE_SECTIONS.blog
  },
  'product-reviews': {
    id: 'product-reviews',
    name: 'Product Review',
    icon: STRUCTURE_TYPE_ICONS['product-reviews'],
    description: 'Detailed product analysis with pros, cons, and buying recommendations',
    useCase: 'E-commerce product pages, affiliate marketing, consumer guidance, monetization',
    sections: STRUCTURE_TYPE_SECTIONS['product-reviews']
  },
  comparison: {
    id: 'comparison',
    name: 'Comparison Article',
    icon: STRUCTURE_TYPE_ICONS.comparison,
    description: 'Side-by-side analysis of multiple options to help readers make informed decisions',
    useCase: 'Product comparisons, service evaluations, alternative analysis, decision-making guides',
    sections: STRUCTURE_TYPE_SECTIONS.comparison
  },
  'how-to-guides': {
    id: 'how-to-guides',
    name: 'How-to Guide',
    icon: STRUCTURE_TYPE_ICONS['how-to-guides'],
    description: 'Step-by-step instructional content that teaches readers how to accomplish specific tasks',
    useCase: 'Tutorials, DIY guides, process documentation, skill-building content',
    sections: STRUCTURE_TYPE_SECTIONS['how-to-guides']
  },
  listicles: {
    id: 'listicles',
    name: 'List Article (Top 10, Best Of)',
    icon: STRUCTURE_TYPE_ICONS.listicles,
    description: 'Curated lists of items with rankings, reviews, and recommendations',
    useCase: 'Best-of lists, top 10 content, curated recommendations, viral content',
    sections: STRUCTURE_TYPE_SECTIONS.listicles
  },
  'buying-guides': {
    id: 'buying-guides',
    name: 'Buying Guide',
    icon: STRUCTURE_TYPE_ICONS['buying-guides'],
    description: 'Comprehensive guides to help readers make purchasing decisions with confidence',
    useCase: 'Purchase decision support, product category guides, shopping assistance, affiliate content',
    sections: STRUCTURE_TYPE_SECTIONS['buying-guides']
  }
};

/**
 * Converts API content types to ArticleTemplate format
 */
export function buildTemplatesFromApi(contentTypes: ContentType[]): Record<ArticleStructureType, ArticleTemplate> {
  const templates: Partial<Record<ArticleStructureType, ArticleTemplate>> = {};

  for (const contentType of contentTypes) {
    const structureType = CONTENT_TYPE_NAME_TO_KEY[contentType.name];
    if (structureType) {
      templates[structureType] = {
        id: structureType,
        name: contentType.name,
        icon: STRUCTURE_TYPE_ICONS[structureType],
        description: contentType.description,
        useCase: contentType.use_case,
        sections: STRUCTURE_TYPE_SECTIONS[structureType]
      };
    }
  }

  // Fill in any missing templates with fallback
  for (const key of Object.keys(FALLBACK_TEMPLATES) as ArticleStructureType[]) {
    if (!templates[key]) {
      templates[key] = FALLBACK_TEMPLATES[key];
    }
  }

  return templates as Record<ArticleStructureType, ArticleTemplate>;
}

/**
 * Get templates - uses API data if available, otherwise falls back to hardcoded
 */
export function getArticleTemplates(contentTypes?: ContentType[]): Record<ArticleStructureType, ArticleTemplate> {
  if (contentTypes && contentTypes.length > 0) {
    return buildTemplatesFromApi(contentTypes);
  }
  return FALLBACK_TEMPLATES;
}

// Export fallback templates for backward compatibility and initial render
export const ARTICLE_TEMPLATES = FALLBACK_TEMPLATES;

// Helper function to get template by structure type with full metadata
export const getTemplateByStructureType = (
  structureType: ArticleStructureType,
  templates: Record<ArticleStructureType, ArticleTemplate> = ARTICLE_TEMPLATES
): ArticleTemplate => {
  return templates[structureType] || templates.blog;
};

// Helper function to get just the sections (for backward compatibility)
export const getTemplateSections = (
  structureType: ArticleStructureType,
  templates: Record<ArticleStructureType, ArticleTemplate> = ARTICLE_TEMPLATES
): string[] => {
  return getTemplateByStructureType(structureType, templates).sections;
};

// Helper function to get all available template types
export const getAvailableTemplateTypes = (): ArticleStructureType[] => {
  return Object.keys(ARTICLE_TEMPLATES) as ArticleStructureType[];
};

// Helper function to get template metadata
export const getTemplateMetadata = (
  structureType: ArticleStructureType,
  templates: Record<ArticleStructureType, ArticleTemplate> = ARTICLE_TEMPLATES
) => {
  const template = getTemplateByStructureType(structureType, templates);
  return {
    name: template.name,
    description: template.description,
    useCase: template.useCase,
    sectionCount: template.sections.length
  };
};
