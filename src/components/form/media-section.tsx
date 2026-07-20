import ImageUrlsInput from '@/features/blogs/components/shared/form-blocks/image-urls-input';
import VideoUrlsInput from '@/features/blogs/components/shared/form-blocks/video-urls-input';

import { FormSection } from './form-section';

export interface MediaData {
  featuredImageUrl: string;
  additionalImageUrls: string[];
  videoUrls: string[];
  useAffvanceSuggestedPhotos: boolean;
}

interface MediaSectionProps {
  data: MediaData;
  onChange: (data: MediaData) => void;
}

export function MediaSection({ data, onChange }: MediaSectionProps) {
  const updateField = <K extends keyof MediaData>(field: K, value: MediaData[K]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <FormSection
      title="Media"
      description="Select media from URL, upload to library, browse existing media, or search free images from the internet"
      className="from-card to-muted/30 bg-gradient-to-br"
    >
      <ImageUrlsInput
        featuredImage={data.featuredImageUrl}
        additionalImages={data.additionalImageUrls}
        useAffvanceSuggestedPhotos={data.useAffvanceSuggestedPhotos}
        onFeaturedImageChange={(value) => updateField('featuredImageUrl', value)}
        onAdditionalImagesChange={(value) => updateField('additionalImageUrls', value)}
        onUseAffvanceSuggestedPhotosChange={(value) =>
          updateField('useAffvanceSuggestedPhotos', value)
        }
      />
      <VideoUrlsInput
        value={data.videoUrls}
        onChange={(value) => updateField('videoUrls', value)}
      />
    </FormSection>
  );
}
