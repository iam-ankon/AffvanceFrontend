'use client';

import { ArticleStructureType, getTemplateSections } from '@/app/data/templates';
import { useArticleTemplates } from '@/lib/hooks/use-article-templates';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useCreateContentRequest, useGenerateContent } from '@/lib/hooks/use-content-requests';
import { useCallback, useState, useEffect } from 'react';
import { useCreditStore } from '@/lib/stores/credit-store';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import SubscriptionAlert, { useSubscriptionStatus } from '@/features/subscriptions/components/subscription-alert';
import {
  getAffiliateLinkPlaceholder,
  getAffiliateLinkValidationMessage,
  isAffiliateCommerceBlocked
} from '@/lib/utils/affiliate-link-validation';

import AffiliateIdInput from '../../../../../features/blogs/components/shared/form-blocks/affiliate-id-input';
import AffiliateLinksInput from '../../../../../features/blogs/components/shared/form-blocks/affiliate-links-input';
import KeywordCombobox, {
  KeywordOption
} from '../../../../../features/blogs/components/shared/form-blocks/keyword-combobox';
import LanguageSelector from '../../../../../features/blogs/components/shared/form-blocks/language-selector';
import RegionSelector from '../../../../../features/blogs/components/shared/form-blocks/region-selector';
import StructureTypeSelector from '../../../../../features/blogs/components/shared/form-blocks/structure-type-selector';
import ToneSelector from '../../../../../features/blogs/components/shared/form-blocks/tone-selector';
import WordCountSelector from '../../../../../features/blogs/components/shared/form-blocks/word-count-selector';
import ImageUrlsInput from '../../../../../features/blogs/components/shared/form-blocks/image-urls-input';
import VideoUrlsInput from '../../../../../features/blogs/components/shared/form-blocks/video-urls-input';
import MultiPublishingManager, { PublishingConfig } from '../../../../../features/blogs/components/shared/form-blocks/multi-publishing-manager';
import { useRouter } from 'next/navigation';

interface FormData {
  keywords: KeywordOption[];
  tone: string;
  structureType: ArticleStructureType;
  sections: string[];
  wordCount: { min: number; max: number };
  language: string;
  region: string;
  affiliatePlatform: string;
  affiliateLinks: string[];
  affiliateId: string;
  featuredImageUrl: string;
  additionalImageUrls: string[];
  videoUrls: string[];
  useAffvanceSuggestedPhotos: boolean;
  publishingConfigs: PublishingConfig[];
}

interface AutopilotFormProps {
  onGenerate?: (data: FormData) => void;
  initialData?: Partial<FormData>;
  isGenerating?: boolean;
}

type CreateContentResponse = {
  data?: {
    id?: string;
  };
};

export default function AutopilotForm({
  onGenerate,
  initialData = {},
  isGenerating = false
}: AutopilotFormProps) {
  const router = useRouter();
  const {
    isBlocked,
    noSubscription,
    creditValue: aiCredits,
    isLoading: isLoadingCredits
  } = useSubscriptionStatus(100);
  const { templates, isLoading: isLoadingTemplates } = useArticleTemplates();
  const defaultStructureType = (initialData.structureType || 'blog') as ArticleStructureType;
  const [formData, setFormData] = useState<FormData>({
    keywords: initialData.keywords || [],
    tone: initialData.tone || 'Professional',
    structureType: defaultStructureType,
    sections: initialData.sections || getTemplateSections(defaultStructureType, templates),
    wordCount: initialData.wordCount || { min: 1200, max: 1800 },
    language: initialData.language || 'en',
    region: initialData.region || 'us',
    affiliatePlatform: initialData.affiliatePlatform || 'amazon',
    affiliateLinks: initialData.affiliateLinks || [],
    affiliateId: initialData.affiliateId || '',
    featuredImageUrl: initialData.featuredImageUrl || '',
    additionalImageUrls: initialData.additionalImageUrls || [],
    videoUrls: initialData.videoUrls || [],
    useAffvanceSuggestedPhotos: initialData.useAffvanceSuggestedPhotos ?? true,
    publishingConfigs: (initialData.publishingConfigs || []).map(config => ({
      ...config,
      categoryName: config.categoryName || null
    }))
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = useCallback(
    (
      field: keyof FormData,
      value:
        | string
        | string[]
        | boolean
        | KeywordOption[]
        | PublishingConfig[]
        | { min: number; max: number }
        | ((prev: string[]) => string[])
        | ((prev: KeywordOption[]) => KeywordOption[])
        | { target: { value: string | string[] } }
    ) => {
      // Handle the case where value is a function (like from KeywordCombobox)
      if (typeof value === 'function') {
        setFormData((prev) => {
          const currentValue = prev[field];
          // Check if we're dealing with keywords (KeywordOption[])
          if (field === 'keywords' && Array.isArray(currentValue)) {
            // We need to cast value to the specific function type because TS can't infer which function signature matches which field
            const keywordUpdater = value as (prev: KeywordOption[]) => KeywordOption[];
            return {
              ...prev,
              [field]: keywordUpdater(currentValue as KeywordOption[])
            };
          }
          // Fallback for string arrays (if any other field uses function updates)
          if (Array.isArray(currentValue)) {
            const stringUpdater = value as (prev: string[]) => string[];
            return {
              ...prev,
              [field]: stringUpdater(currentValue as string[])
            };
          }
          return prev;
        });
        return;
      }

      // Handle the case where value is an object with target (like from form inputs)
      const newValue =
        typeof value === 'object' && value !== null && 'target' in value
          ? value.target.value
          : value;

      setFormData((prev) => {
        // Only update if the value has actually changed
        if (JSON.stringify(prev[field]) === JSON.stringify(newValue)) return prev;

        const updatedFormData: FormData = {
          ...prev,
          [field]: newValue as FormData[keyof FormData]
        };

        // If structureType changed, automatically update sections
        if (field === 'structureType' && !isLoadingTemplates) {
          updatedFormData.sections = getTemplateSections(newValue as ArticleStructureType, templates);
        }

        return updatedFormData;
      });
    },
    [templates, isLoadingTemplates]
  );

  const { mutate: createRequest, isPending: isCreating } =
    useCreateContentRequest<FormData>('one_click');
  const { mutate: generateContent, isPending: isGeneratingContent } = useGenerateContent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      const message = noSubscription
        ? 'You need an active subscription to generate articles. Subscribe to a plan to continue.'
        : 'You have 0 AI credits remaining. Add credits or upgrade your plan to continue.';
      const openUpgradeModal = useCreditStore.getState().openUpgradeModal;
      openUpgradeModal(message, aiCredits <= 0 ? 'ai' : null);
      return;
    }

    // Affiliate links must be a valid ASIN or URL when provided
    const affiliateLinkError = getAffiliateLinkValidationMessage(
      formData.affiliateLinks,
      formData.affiliatePlatform
    );
    if (affiliateLinkError) {
      alert(affiliateLinkError);
      return;
    }

    // Affiliate ID is required when an affiliate link is provided (Amazon)
    const hasAffiliateLinks = formData.affiliateLinks.some(
      (link) => (link || '').trim() !== ''
    );
    if (
      hasAffiliateLinks &&
      formData.affiliatePlatform === 'amazon' &&
      !formData.affiliateId.trim()
    ) {
      alert('Please enter your Affiliate ID — it is required when you add an affiliate link.');
      return;
    }

    // Validate that if publishing destinations are configured, each must have a category
    if (formData.publishingConfigs.length > 0) {
      const invalidConfigs = formData.publishingConfigs.filter(
        (config) => !config.accountId || !config.categoryId
      );

      if (invalidConfigs.length > 0) {
        // Find the first invalid config to show error
        const firstInvalid = invalidConfigs[0];
        if (!firstInvalid.accountId) {
          alert('Please select a publishing account for all destinations.');
          return;
        }
        if (!firstInvalid.categoryId) {
          alert('Please select a category for all publishing destinations. Category is required.');
          return;
        }
      }
    }

    createRequest(formData, {
      onSuccess: (response) => {
        // The response structure matches the one provided by the user
        // data.id is the ID we need
        const requestId = (response as CreateContentResponse)?.data?.id;

        if (requestId) {
          generateContent(requestId, {
            onSuccess: () => {
              // Publishing is handled automatically by backend via _auto_schedule_publications
              // The publishingConfigs in formData are sent to backend and used to create
              // ScheduledPublication records during content generation

              if (onGenerate) onGenerate(formData);
              setIsSubmitted(true);
              router.push('/app/blogs/requested');
            }
          });
        } else {
          // Fallback if ID is missing (shouldn't happen based on API spec)
          if (onGenerate) onGenerate(formData);
        }
      }
    });
  };

  const affiliateIdRequired =
    formData.affiliatePlatform === 'amazon' &&
    formData.affiliateLinks.some((link) => (link || '').trim() !== '');
  const affiliateLinkError = getAffiliateLinkValidationMessage(
    formData.affiliateLinks,
    formData.affiliatePlatform
  );
  const isCommerceBlocked = isAffiliateCommerceBlocked(formData);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SubscriptionAlert threshold={100} />
      {/* Content Details Section */}
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-4">
          <h3 className="text-foreground text-lg font-semibold">Content Details</h3>
          <p className="text-muted-foreground text-sm">
            Configure your article&apos;s core content settings
          </p>
        </div>
        <div className="space-y-8">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Add Keyword <span className="text-muted-foreground">(select or type one)</span>
            </label>
            <KeywordCombobox
              value={formData.keywords}
              onChange={(value) => handleChange('keywords', value)}
              placeholder="Click here to choose keywords or type your own keyword"
              maxSelections={1} // Allow up to 5 keywords - set to 1 for single selection
              showKeywordLab={false}
            />
            <p className="text-muted-foreground mt-1 text-xs">
              💡 Tip: Choose keywords with high search volume and low difficulty for best results.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Tone / Style <span className="text-muted-foreground">(select any one)</span>
            </label>
            <ToneSelector value={formData.tone} onChange={(value) => handleChange('tone', value)} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Structure Type <span className="text-muted-foreground">(select any one)</span>
            </label>
            <StructureTypeSelector
              value={formData.structureType}
              onChange={(value) => handleChange('structureType', value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Word Count <span className="text-muted-foreground">(select any one)</span>
            </label>
            <WordCountSelector
              value={formData.wordCount}
              onChange={(value) => handleChange('wordCount', value)}
            />
          </div>
        </div>
      </div>

      {/* Language & Region Section */}
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-4">
          <h3 className="text-foreground text-lg font-semibold">Language & Region</h3>
          <p className="text-muted-foreground text-sm">
            Set your target audience language and location
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Language</label>
            <LanguageSelector
              value={formData.language}
              onChange={useCallback(
                (value: string) => handleChange('language', value),
                [handleChange]
              )}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Target Region</label>
            <RegionSelector
              value={formData.region}
              onChange={useCallback(
                (value: string) => handleChange('region', value),
                [handleChange]
              )}
            />
          </div>
        </div>
      </div>

      {/* Commerce & Compliance Section */}
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-4">
          <h3 className="text-foreground text-lg font-semibold">Commerce & Compliance</h3>
          <p className="text-muted-foreground text-sm">
            Configure affiliate links and compliance settings
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">Choose Platform</label>
            <Select
              value={formData.affiliatePlatform}
              onValueChange={(value) => handleChange('affiliatePlatform', value)}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amazon">Amazon affiliate</SelectItem>
                <SelectItem value="other">Any other affiliate link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Add Affiliate Link
            </label>
            <AffiliateLinksInput
              value={formData.affiliateLinks}
              onChange={(value) => handleChange('affiliateLinks', value)}
              mode="single"
              affiliatePlatform={formData.affiliatePlatform}
              placeholder={getAffiliateLinkPlaceholder(formData.affiliatePlatform)}
              error={affiliateLinkError}
            />
            {affiliateLinkError && (
              <p className="text-destructive mt-1 text-xs">{affiliateLinkError}</p>
            )}
          </div>
          {formData.affiliatePlatform === 'amazon' && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Affiliate ID
                {affiliateIdRequired && <span className="text-destructive ml-0.5">*</span>}
              </label>
              <AffiliateIdInput
                value={formData.affiliateId}
                onChange={(value) => handleChange('affiliateId', value)}
                placeholder="Enter your affiliate ID"
              />
              {affiliateIdRequired && !formData.affiliateId.trim() && (
                <p className="text-destructive mt-1 text-xs">
                  Affiliate ID is required when you add an affiliate link.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Section */}
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-4">
          <h3 className="text-foreground text-lg font-semibold">Media</h3>
          <p className="text-muted-foreground text-sm">
            Media should be selected either from the url or by uploading
          </p>
        </div>
        <div className="space-y-4">
          <ImageUrlsInput
            featuredImage={formData.featuredImageUrl}
            additionalImages={formData.additionalImageUrls}
            useAffvanceSuggestedPhotos={formData.useAffvanceSuggestedPhotos}
            onFeaturedImageChange={(value) => handleChange('featuredImageUrl', value)}
            onAdditionalImagesChange={(value) => handleChange('additionalImageUrls', value)}
            onUseAffvanceSuggestedPhotosChange={(value) =>
              handleChange('useAffvanceSuggestedPhotos', value)
            }
          />
          <VideoUrlsInput
            value={formData.videoUrls}
            onChange={(value) => handleChange('videoUrls', value)}
          />
        </div>
      </div>

      {/* Publishing Section */}
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-4">
          <h3 className="text-foreground text-lg font-semibold">Publishing</h3>
          <p className="text-muted-foreground text-sm">
            Publish to multiple WordPress sites (optional)
          </p>
        </div>
        <MultiPublishingManager
          value={formData.publishingConfigs}
          onChange={(value) => handleChange('publishingConfigs', value)}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={
            isGenerating ||
            isCreating ||
            isGeneratingContent ||
            isSubmitted ||
            isLoadingCredits ||
            isBlocked ||
            isCommerceBlocked
          }
        >
          {isSubmitted ? 'Article Generated' : 'Generate Article'}
        </Button>
      </div>
    </form>
  );
}
