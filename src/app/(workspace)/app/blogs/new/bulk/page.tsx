'use client';

import { ArticleStructureType, getTemplateSections } from '@/app/data/templates';
import { useArticleTemplates } from '@/lib/hooks/use-article-templates';
import CreditDropdown from '@/components/credit-dropdown';
import DynamicBreadcrumb from '@/components/dynamic-breadcrumbs';
import { BrandSeoSection } from '@/components/form/brand-seo-section';
import { type BriefData, BriefSection } from '@/components/form/brief-section';
import { type CommerceData, CommerceSection } from '@/components/form/commerse-section';
import { type KeywordData, KeywordSection } from '@/components/form/keyword-section';
import { type MediaData, MediaSection } from '@/components/form/media-section';
import MultiPublishingManager, { PublishingConfig } from '@/features/blogs/components/shared/form-blocks/multi-publishing-manager';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Button } from '@/components/ui/button';
import { useCreateContentRequest, useGenerateContent } from '@/lib/hooks/use-content-requests';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import SubscriptionAlert, { useSubscriptionStatus } from '@/features/subscriptions/components/subscription-alert';
import { useCreditStore } from '@/lib/stores/credit-store';
import { getAffiliateLinkValidationMessage, isAffiliateCommerceBlocked } from '@/lib/utils/affiliate-link-validation';

export default function Page() {
  const router = useRouter();
  const {
    isBlocked,
    noSubscription,
    creditValue: aiCredits,
    isLoading: isLoadingCredits
  } = useSubscriptionStatus(100);
  const [briefData, setBriefData] = useState<BriefData>({
    titleHint: '',
    topic: '',
    goals: '',
    audience: '',
    structureType: 'blog' as ArticleStructureType,
    wordCount: 'medium',
    language: 'english',
    schedule: 'now',
    scheduledDate: undefined
  });

  const [brandSeoData, setBrandSeoData] = useState({
    tone: 'informative',
    styleNotes: '',
    bannedTerms: '',
    focusKeywords: '',
    searchIntent: 'informational',
    internalLinks: '',
    externalLinks: ''
  });

  const [commerceData, setCommerceData] = useState<CommerceData>({
    affiliatePlatform: 'amazon',
    affiliateLinks: [],
    affiliateId: '',
    region: 'us',
    ftcDisclosure: true,
    imageMode: 'auto',
    videoUrl: '',
    autoYoutube: false,
    sameAffiliateLinkForAll: false
  });

  const [keywordData, setKeywordData] = useState<KeywordData>({
    keywords: []
  });

  const [mediaData, setMediaData] = useState<MediaData>({
    featuredImageUrl: '',
    additionalImageUrls: [],
    videoUrls: [],
    useAffvanceSuggestedPhotos: true
  });

  const [publishingConfigs, setPublishingConfigs] = useState<PublishingConfig[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { templates, isLoading: isLoadingTemplates } = useArticleTemplates();
  const [sections, setSections] = useState<string[]>(
    getTemplateSections(briefData.structureType, templates)
  );

  const lastStructureTypeRef = useRef<ArticleStructureType | null>(null);

  // Update sections when templates load or structureType changes
  useEffect(() => {
    if (!isLoadingTemplates && templates) {
      if (lastStructureTypeRef.current !== briefData.structureType) {
        setSections(getTemplateSections(briefData.structureType, templates));
        lastStructureTypeRef.current = briefData.structureType;
      }
    }
  }, [briefData.structureType, templates, isLoadingTemplates]);

  const handleGenerate = () => {
    if (isBlocked) {
      const message = noSubscription
        ? 'You need an active subscription to generate articles. Subscribe to a plan to continue.'
        : 'You have 0 AI credits remaining. Add credits or upgrade your plan to continue.';
      const openUpgradeModal = useCreditStore.getState().openUpgradeModal;
      openUpgradeModal(message, aiCredits <= 0 ? 'ai' : null);
      return;
    }

    // Validate keywords
    if (!keywordData.keywords || keywordData.keywords.length === 0) {
      toast.error('Please select at least one keyword');
      return;
    }

    // Affiliate links must be a valid ASIN or URL when provided
    const affiliateLinkError = getAffiliateLinkValidationMessage(
      commerceData.affiliateLinks,
      commerceData.affiliatePlatform
    );
    if (affiliateLinkError) {
      toast.error(affiliateLinkError);
      return;
    }

    // Affiliate ID is required when an affiliate link is provided (Amazon)
    const hasAffiliateLinks = commerceData.affiliateLinks.some(
      (link) => (link || '').trim() !== ''
    );
    if (
      hasAffiliateLinks &&
      commerceData.affiliatePlatform === 'amazon' &&
      !commerceData.affiliateId.trim()
    ) {
      toast.error('Please enter your Affiliate ID — it is required when you add an affiliate link.');
      return;
    }

    // Build payload with all form data - matching autopilot structure
    const payload = {
      // From keywordData
      keywords: keywordData.keywords,
      // From briefData
      titleHint: briefData.titleHint,
      topic: briefData.topic,
      goals: briefData.goals,
      audience: briefData.audience,
      structureType: briefData.structureType,
      wordCount: briefData.wordCount,
      language: briefData.language,
      schedule: briefData.schedule,
      scheduledDate: briefData.scheduledDate,
      // From brandSeoData
      tone: brandSeoData.tone,
      styleNotes: brandSeoData.styleNotes,
      bannedTerms: brandSeoData.bannedTerms,
      focusKeywords: brandSeoData.focusKeywords,
      searchIntent: brandSeoData.searchIntent,
      internalLinks: brandSeoData.internalLinks,
      externalLinks: brandSeoData.externalLinks,
      // From commerceData
      affiliatePlatform: commerceData.affiliatePlatform,
      affiliateLinks: commerceData.affiliateLinks,
      affiliateId: commerceData.affiliateId,
      sameAffiliateLinkForAll:
        commerceData.affiliateLinks.length === 1
          ? commerceData.sameAffiliateLinkForAll === true
          : false,
      region: commerceData.region,
      ftcDisclosure: commerceData.ftcDisclosure,
      imageMode: commerceData.imageMode,
      videoUrl: commerceData.videoUrl,
      autoYoutube: commerceData.autoYoutube,
      // From mediaData - IMPORTANT: These must match autopilot field names
      featuredImageUrl: mediaData.featuredImageUrl,
      additionalImageUrls: mediaData.additionalImageUrls,
      videoUrls: mediaData.videoUrls,
      useAffvanceSuggestedPhotos: mediaData.useAffvanceSuggestedPhotos,
      // Sections
      sections,
      // Publishing configs
      publishingConfigs
    };

    createRequest(payload, {
      onSuccess: (response) => {
        const requestId = (response as { data?: { id?: string } })?.data?.id;
        if (!requestId) {
          toast.error('Batch request created but no request id was returned.');
          return;
        }

        generateContent(requestId, {
          onSuccess: () => {
            toast.success('Bulk generation started successfully!');
            setIsSubmitted(true);
            router.push('/app/blogs/requested');
          }
        });
      }
    });
  };

  const { mutate: createRequest, isPending: isCreating } = useCreateContentRequest('bulk');
  const { mutate: generateContent, isPending: isGenerating } = useGenerateContent();

  const handleBriefDataChange = (newBriefData: BriefData) => {
    setBriefData(newBriefData);
  };
  const isCommerceBlocked = isAffiliateCommerceBlocked(commerceData);

  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center gap-2">
          <CreditDropdown />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <DynamicBreadcrumb />
        <h1 className="mb-8 text-center text-3xl font-bold md:text-4xl">Bulk Article Generator</h1>
        <SubscriptionAlert threshold={100} className="mx-auto mb-6 max-w-4xl" />
        <div className="bg-gradient-secondary min-h-screen">
          {/* Main Content */}
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 gap-8">
              <KeywordSection data={keywordData} onChange={setKeywordData} maxSelections={200} />

              {/* Main Form Sections */}
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                <BriefSection
                  data={briefData}
                  onChange={handleBriefDataChange}
                  onSectionsChange={setSections}
                />
                <BrandSeoSection
                  data={brandSeoData}
                  onChange={setBrandSeoData}
                  structureType={briefData.structureType}
                />
                <CommerceSection
                  data={commerceData}
                  onChange={setCommerceData}
                  affiliateLinksLabel="Add Affiliate Links"
                  showSameLinkOption
                />
              </div>

              {/* Media Section */}
              <MediaSection data={mediaData} onChange={setMediaData} />

              {/* Publishing Section */}
              <div className="bg-card rounded-lg border p-6">
                <div className="mb-4">
                  <h3 className="text-foreground text-lg font-semibold">Publishing</h3>
                  <p className="text-muted-foreground text-sm">
                    Publish to multiple WordPress sites (optional)
                  </p>
                </div>
                <MultiPublishingManager
                  value={publishingConfigs}
                  onChange={setPublishingConfigs}
                />
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleGenerate}
                  size="lg"
                  className="min-w-[200px]"
                  disabled={isCreating || isGenerating || isSubmitted || isLoadingCredits || isBlocked || isCommerceBlocked}
                >
                  {isSubmitted ? 'Articles Generated' : 'Generate Articles'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Main >
    </>
  );
}
