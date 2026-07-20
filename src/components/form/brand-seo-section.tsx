import { ArticleStructureType } from '@/app/data/templates';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { FormGroup } from './form-group';
import { FormSection } from './form-section';

interface BrandSeoData {
  tone: string;
  styleNotes: string;
  bannedTerms: string;
  focusKeywords: string;
  searchIntent: string;
  internalLinks: string;
  externalLinks: string;
}

interface BrandSeoSectionProps {
  data: BrandSeoData;
  onChange: (data: BrandSeoData) => void;
  structureType: ArticleStructureType;
}

export function BrandSeoSection({ data, onChange, structureType }: BrandSeoSectionProps) {
  const updateField = (field: keyof BrandSeoData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <FormSection title="Brand & SEO" className="from-primary/5 to-primary/10 bg-gradient-to-br">
      <FormGroup label="Tone" tooltip="Choose voice personality (e.g., Informative, Persuasive).">
        <Select value={data.tone} onValueChange={(value) => updateField('tone', value)}>
          <SelectTrigger className="focus:shadow-soft transition-all duration-200">
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="informative">Informative</SelectItem>
            <SelectItem value="conversational">Conversational</SelectItem>
            <SelectItem value="authoritative">Authoritative</SelectItem>
            <SelectItem value="persuasive">Persuasive</SelectItem>
            <SelectItem value="solution-oriented">Solution-Oriented</SelectItem>
            <SelectItem value="formal">Formal/Professional</SelectItem>
          </SelectContent>
        </Select>
      </FormGroup>

      <FormGroup
        label="Style Notes"
        tooltip="House rules for consistency (e.g., short sentences, UK spelling)."
      >
        <Textarea
          placeholder="e.g., short sentences, UK spelling, avoid jargon"
          value={data.styleNotes}
          onChange={(e) => updateField('styleNotes', e.target.value)}
          rows={3}
          className="focus:shadow-soft resize-none transition-all duration-200"
        />
      </FormGroup>

      <FormGroup
        label="Banned Terms"
        tooltip="Words to avoid for compliance/tone (e.g., 'revolutionary')."
      >
        <Textarea
          placeholder="e.g., game-changer, revolutionary"
          value={data.bannedTerms}
          onChange={(e) => updateField('bannedTerms', e.target.value)}
          rows={3}
          className="focus:shadow-soft resize-none transition-all duration-200"
        />
      </FormGroup>

      <FormGroup
        label="Focus Keywords"
        tooltip="Primary and secondary keywords. Separate by commas to map intent clusters."
      >
        <Input
          placeholder="e.g., portable solar charger, usb-c solar charger"
          value={data.focusKeywords}
          onChange={(e) => updateField('focusKeywords', e.target.value)}
          className="focus:shadow-soft transition-all duration-200"
        />
      </FormGroup>

      <FormGroup
        label="Search Intent"
        tooltip="Match user intent for ranking: informational, transactional, or navigational."
      >
        <Select
          value={data.searchIntent}
          onValueChange={(value) => updateField('searchIntent', value)}
        >
          <SelectTrigger className="focus:shadow-soft transition-all duration-200">
            <SelectValue placeholder="Select search intent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="informational">Informational</SelectItem>
            <SelectItem value="transactional">Transactional</SelectItem>
            <SelectItem value="navigational">Navigational</SelectItem>
          </SelectContent>
        </Select>
      </FormGroup>

      <FormGroup
        label="Internal Links"
        tooltip="Link to relevant pages (hubs/spokes) to strengthen topical authority."
      >
        <Input
          placeholder="e.g., {slug:/solar-panels-guide}, {slug:/product-review}"
          value={data.internalLinks}
          onChange={(e) => updateField('internalLinks', e.target.value)}
          className="focus:shadow-soft transition-all duration-200"
        />
      </FormGroup>

      <FormGroup
        label="External Links"
        tooltip="Cite authoritative sources for E-E-A-T. Prefer stable, trusted domains."
      >
        <Input
          placeholder="e.g., https://energy.gov/..., https://example.com/specs.pdf"
          value={data.externalLinks}
          onChange={(e) => updateField('externalLinks', e.target.value)}
          className="focus:shadow-soft transition-all duration-200"
        />
      </FormGroup>
    </FormSection>
  );
}
