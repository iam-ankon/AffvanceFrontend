import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import AffiliateLinksInput from '@/features/blogs/components/shared/form-blocks/affiliate-links-input';
import {
  getAffiliateLinkPlaceholder,
  getAffiliateLinkValidationMessage
} from '@/lib/utils/affiliate-link-validation';
import { Info } from 'lucide-react';

import { FormGroup } from './form-group';
import { FormSection } from './form-section';

export interface CommerceData {
  affiliatePlatform: string;
  affiliateLinks: string[];
  affiliateId: string;
  region: string;
  ftcDisclosure: boolean;
  imageMode: string;
  videoUrl: string;
  autoYoutube: boolean;
  sameAffiliateLinkForAll?: boolean;
}

interface CommerceSectionProps {
  data: CommerceData;
  onChange: (data: CommerceData) => void;
  affiliateLinksLabel?: string;
  affiliateLinksMode?: 'single' | 'multi';
  showSameLinkOption?: boolean;
}

export function CommerceSection({
  data,
  onChange,
  affiliateLinksLabel = 'Add Affiliate Links',
  affiliateLinksMode = 'multi',
  showSameLinkOption = false
}: CommerceSectionProps) {
  const updateField = <K extends keyof CommerceData>(field: K, value: CommerceData[K]) => {
    onChange({ ...data, [field]: value });
  };

  const linkCount = data.affiliateLinks.length;
  const sameForAll = data.sameAffiliateLinkForAll === true;
  const hasAffiliateLinks = data.affiliateLinks.some((link) => (link || '').trim() !== '');
  const affiliateIdRequired = hasAffiliateLinks && data.affiliatePlatform === 'amazon';
  const affiliateIdMissing = affiliateIdRequired && !data.affiliateId.trim();
  const affiliateLinkError = getAffiliateLinkValidationMessage(
    data.affiliateLinks,
    data.affiliatePlatform
  );

  const affiliateTip =
    linkCount === 1
      ? sameForAll
        ? 'This affiliate link will be added to every article generated in this batch.'
        : 'This affiliate link will be added to your first generated article only. Tick the box above to add it to every article instead.'
      : `Your ${linkCount} affiliate links are matched to articles in order — link 1 goes to article 1, link 2 to article 2, and so on. If you generate more articles than links, the sequence repeats from the first link.`;

  return (
    <FormSection
      title="Commerce & Compliance"
      className="from-accent/20 to-accent/5 bg-gradient-to-br"
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-foreground text-sm font-medium">Choose Platform</label>
        <Select
          value={data.affiliatePlatform}
          onValueChange={(value) => updateField('affiliatePlatform', value)}
        >
          <SelectTrigger className="focus:shadow-soft w-56 transition-all duration-200">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="amazon">Amazon affiliate</SelectItem>
            <SelectItem value="other">Any other affiliate link</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <FormGroup
        label={affiliateLinksLabel}
        tooltip="Paste an Amazon URL or ASIN to enable contextual product mentions and CTAs."
      >
        <AffiliateLinksInput
          value={data.affiliateLinks}
          onChange={(value) => updateField('affiliateLinks', value)}
          mode={affiliateLinksMode}
          affiliatePlatform={data.affiliatePlatform}
          placeholder={getAffiliateLinkPlaceholder(data.affiliatePlatform)}
          error={affiliateLinkError}
        />
        {affiliateLinkError && (
          <p className="text-destructive text-xs">{affiliateLinkError}</p>
        )}
        {showSameLinkOption && data.affiliateLinks.length === 1 && (
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="same-affiliate-link-for-all"
              checked={data.sameAffiliateLinkForAll === true}
              onCheckedChange={(checked) =>
                updateField('sameAffiliateLinkForAll', checked === true)
              }
            />
            <label
              htmlFor="same-affiliate-link-for-all"
              className="text-sm cursor-pointer"
            >
              Add the same link in every content?
            </label>
          </div>
        )}
        {showSameLinkOption && linkCount >= 1 && (
          <div className="text-muted-foreground border-primary/20 bg-primary/5 mt-2 flex items-start gap-2 rounded-md border p-3 text-xs leading-relaxed">
            <Info className="text-primary mt-0.5 h-4 w-4 shrink-0" />
            <p>{affiliateTip}</p>
          </div>
        )}
      </FormGroup>

      {data.affiliatePlatform === 'amazon' && (
        <FormGroup
          label="Affiliate ID"
          tooltip="Your tracking ID (e.g., Amazon Associates tag) for compliant attribution."
          required={affiliateIdRequired}
        >
          <Input
            placeholder="e.g., yourtag-20"
            value={data.affiliateId}
            onChange={(e) => updateField('affiliateId', e.target.value)}
            aria-invalid={affiliateIdMissing}
            className="focus:shadow-soft transition-all duration-200"
          />
          {affiliateIdMissing && (
            <p className="text-destructive text-xs">
              Affiliate ID is required when you add an affiliate link.
            </p>
          )}
        </FormGroup>
      )}

      <FormGroup
        label="Region"
        tooltip="Target geography to localize spellings, units, prices, and legal notes."
      >
        <Select value={data.region} onValueChange={(value) => updateField('region', value)}>
          <SelectTrigger className="focus:shadow-soft transition-all duration-200">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States (US)</SelectItem>
            <SelectItem value="uk">United Kingdom (UK)</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="au">Australia</SelectItem>
            <SelectItem value="in">India</SelectItem>
            <SelectItem value="de">Germany</SelectItem>
            <SelectItem value="fr">France</SelectItem>
            <SelectItem value="br">Brazil</SelectItem>
            <SelectItem value="jp">Japan</SelectItem>
            <SelectItem value="kr">South Korea</SelectItem>
            <SelectItem value="ae">United Arab Emirates (UAE)</SelectItem>
            <SelectItem value="sg">Singapore</SelectItem>
            <SelectItem value="za">South Africa</SelectItem>
            <SelectItem value="mx">Mexico</SelectItem>
            <SelectItem value="bd">Bangladesh</SelectItem>
            <SelectItem value="id">Indonesia</SelectItem>
            <SelectItem value="ph">Philippines</SelectItem>
            <SelectItem value="ng">Nigeria</SelectItem>
            <SelectItem value="it">Italy</SelectItem>
            <SelectItem value="my">Malaysia</SelectItem>
          </SelectContent>
        </Select>
      </FormGroup>

      <FormGroup
        label="FTC/ASA Disclosure"
        tooltip="Show an affiliate disclosure to meet FTC/ASA rules. Recommended above the fold."
      >
        <div className="flex items-center space-x-2">
          <Checkbox
            id="ftc-disclosure"
            checked={data.ftcDisclosure}
            onCheckedChange={(checked) => updateField('ftcDisclosure', checked === true)}
          />
          <label htmlFor="ftc-disclosure" className="text-sm">
            Required above the fold
          </label>
        </div>
      </FormGroup>

      {/* <FormGroup
        label="Image Mode"
        tooltip="Choose how images are sourced: auto stock, manual upload, or curated web images."
      >
        <Select value={data.imageMode} onValueChange={(value) => updateField('imageMode', value)}>
          <SelectTrigger className="focus:shadow-soft transition-all duration-200">
            <SelectValue placeholder="Select image mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto (Unsplash/stock)</SelectItem>
            <SelectItem value="manual">Manual (Upload from desktop)</SelectItem>
            <SelectItem value="web">Select from free internet image</SelectItem>
          </SelectContent>
        </Select>
      </FormGroup>

      <FormGroup
        label="Video Mode"
        tooltip="Paste a YouTube URL or enable auto-suggest to enrich time-on-page and UX."
      >
        <Input
          placeholder="YouTube video URL (optional)"
          value={data.videoUrl}
          onChange={(e) => updateField('videoUrl', e.target.value)}
          className="focus:shadow-soft transition-all duration-200"
        />
        <div className="mt-2 flex items-center space-x-2">
          <Checkbox
            id="auto-youtube"
            checked={data.autoYoutube}
            onCheckedChange={(checked) => updateField('autoYoutube', checked === true)}
          />
          <label htmlFor="auto-youtube" className="text-sm">
            Use automated related YouTube source
          </label>
        </div>
      </FormGroup> */}
    </FormSection>
  );
}
