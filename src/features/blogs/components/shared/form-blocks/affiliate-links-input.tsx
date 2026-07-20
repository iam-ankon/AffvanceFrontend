'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getAffiliateLinkFieldError,
  isValidAffiliateLink
} from '@/lib/utils/affiliate-link-validation';
import { useState } from 'react';
import { toast } from 'sonner';

interface AffiliateLinksInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  mode?: 'single' | 'multi';
  placeholder?: string;
  affiliatePlatform?: string;
  error?: string | null;
}

export default function AffiliateLinksInput({
  value,
  onChange,
  className = '',
  mode = 'multi',
  placeholder = 'Amazon / any of your affiliate link',
  affiliatePlatform = 'amazon',
  error = null
}: AffiliateLinksInputProps) {
  const [newLink, setNewLink] = useState('');

  // value is now always string[]
  const linksArray = value || [];
  const isSingleMode = mode === 'single';

  const linkHasError = (link: string) =>
    Boolean((link || '').trim()) && !isValidAffiliateLink(link, affiliatePlatform);

  const getLinkErrorMessage = (link: string) =>
    getAffiliateLinkFieldError(link, affiliatePlatform);

  const addAffiliateLink = () => {
    const trimmed = newLink.trim();
    if (!trimmed) {
      return;
    }
    const fieldError = getLinkErrorMessage(trimmed);
    if (fieldError) {
      toast.error(fieldError);
      return;
    }
    if (isSingleMode) {
      onChange([trimmed]);
    } else {
      onChange([...linksArray, trimmed]);
    }
    setNewLink('');
  };

  const removeAffiliateLink = (index: number) => {
    if (isSingleMode) return;

    const newLinks = [...linksArray];
    newLinks.splice(index, 1);
    onChange(newLinks);
  };

  const updateLink = (index: number, newValue: string) => {
    if (isSingleMode) {
      onChange([newValue]);
    } else {
      const newLinks = [...linksArray];
      newLinks[index] = newValue;
      onChange(newLinks);
    }
  };

  if (isSingleMode) {
    const singleValue = value.length > 0 ? value[0] : '';
    const fieldError = error || getLinkErrorMessage(singleValue);

    return (
      <div className={className}>
        <Input
          value={singleValue}
          onChange={(e) => onChange([e.target.value])}
          placeholder={placeholder}
          type="text"
          aria-invalid={Boolean(fieldError)}
          className={cn(fieldError && 'border-destructive focus-visible:ring-destructive')}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {linksArray.map((link, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={link}
              onChange={(e) => updateLink(index, e.target.value)}
              placeholder={placeholder}
              type="text"
              aria-invalid={linkHasError(link)}
              className={cn(linkHasError(link) && 'border-destructive focus-visible:ring-destructive')}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeAffiliateLink(index)}
            >
              ×
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder={placeholder}
            type="text"
            onKeyDown={(e) => e.key === 'Enter' && addAffiliateLink()}
          />
          <Button type="button" onClick={addAffiliateLink}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
