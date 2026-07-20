import { ArticleStructureType, getTemplateSections } from '@/app/data/templates';
import { useArticleTemplates } from '@/lib/hooks/use-article-templates';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DatePicker } from './date-picker';
import { FormGroup } from './form-group';
import { FormSection } from './form-section';
import { SectionTemplates } from './section-templates';

export interface BriefData {
  titleHint: string;
  topic: string;
  goals: string;
  audience: string;
  structureType: ArticleStructureType;
  wordCount: string;
  language: string;
  schedule: string;
  scheduledDate?: Date;
}

interface BriefSectionProps {
  data: BriefData;
  onChange: (data: BriefData) => void;
  onSectionsChange?: (sections: string[]) => void;
}

export function BriefSection({ data, onChange, onSectionsChange }: BriefSectionProps) {
  const { templates, isLoading } = useArticleTemplates();
  const [sections, setSections] = useState<string[]>(
    getTemplateSections(data.structureType, templates)
  );

  // Use a ref to store the latest callback to avoid stale closures
  const onSectionsChangeRef = useRef(onSectionsChange);

  useEffect(() => {
    onSectionsChangeRef.current = onSectionsChange;
  }, [onSectionsChange]);

  // Track the last structure type to only reset sections when it actually changes
  const lastStructureTypeRef = useRef<ArticleStructureType | null>(null);

  // Update sections when templates load or structureType changes
  useEffect(() => {
    if (!isLoading && templates) {
      if (lastStructureTypeRef.current !== data.structureType) {
        const newSections = getTemplateSections(data.structureType, templates);
        setSections(newSections);
        lastStructureTypeRef.current = data.structureType;
      }
    }
  }, [data.structureType, templates, isLoading]);

  const updateField = <K extends keyof BriefData>(field: K, value: BriefData[K]) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
  };

  const handleSectionsChange = useCallback(
    (newSections: string[]) => {
      setSections(newSections);
      if (onSectionsChangeRef.current) {
        onSectionsChangeRef.current(newSections);
      }
    },
    [] // No dependencies - we use ref to get latest callback
  );

  return (
    <FormSection title="Brief" className="from-card to-muted/30 bg-gradient-to-br">
      <FormGroup
        label="Title Hint"
        tooltip="Seed a compelling, keyword-aligned working title to guide SEO and tone."
      >
        <Input
          placeholder="e.g., Portable solar chargers: complete guide"
          value={data.titleHint}
          onChange={(e) => updateField('titleHint', e.target.value)}
          className="focus:shadow-soft transition-all duration-200"
        />
      </FormGroup>

      <FormGroup
        label="Topic"
        tooltip="Primary subject for the draft. Keep narrow for better topical focus."
      >
        <Input
          placeholder="e.g., Portable solar charger"
          value={data.topic}
          onChange={(e) => updateField('topic', e.target.value)}
          className="focus:shadow-soft transition-all duration-200"
        />
      </FormGroup>

      <FormGroup
        label="Goals"
        tooltip="Define outcomes (e.g., educate, capture affiliate clicks) so copy prioritizes them."
      >
        <Textarea
          placeholder="e.g., educate, capture affiliate clicks"
          value={data.goals}
          onChange={(e) => updateField('goals', e.target.value)}
          rows={3}
          className="focus:shadow-soft resize-none transition-all duration-200"
        />
      </FormGroup>

      <FormGroup
        label="Audience"
        tooltip="Who you're writing for. Sets reading level, examples, and CTAs."
      >
        <Input
          placeholder="e.g., Outdoor campers, beginners"
          value={data.audience}
          onChange={(e) => updateField('audience', e.target.value)}
          className="focus:shadow-soft transition-all duration-200"
        />
      </FormGroup>

      <FormGroup
        label="Structure Type"
        tooltip="Pick the format. The sections below will update to a best-practice outline."
      >
        <Select
          value={data.structureType}
          onValueChange={(value) => updateField('structureType', value as ArticleStructureType)}
          disabled={isLoading}
        >
          <SelectTrigger className="focus:shadow-soft transition-all duration-200">
            <SelectValue placeholder={isLoading ? "Loading templates..." : "Select structure type"} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(templates).map(([key, template]) => (
              <SelectItem key={key} value={key}>
                <div className="flex flex-col">
                  <span>{template.name}</span>
                  {/* <span className="text-xs text-muted-foreground">
                    {template.description}
                  </span> */}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormGroup>

      <FormGroup
        label="Sections (auto from Structure Type)"
        tooltip="Prebuilt outline tailored to structure for rich snippets and comprehensive coverage."
      >
        <SectionTemplates
          structureType={data.structureType}
          onSectionsChange={handleSectionsChange}
          initialSections={sections}
        />
      </FormGroup>

      <FormGroup
        label="Word Count"
        tooltip="Target depth. Longer drafts can cover entities thoroughly—great for E-E-A-T."
      >
        <Select value={data.wordCount} onValueChange={(value) => updateField('wordCount', value)}>
          <SelectTrigger className="focus:shadow-soft transition-all duration-200">
            <SelectValue placeholder="Select word count" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small (800-1200)</SelectItem>
            <SelectItem value="medium">Medium (1200-1800)</SelectItem>
            <SelectItem value="large">Large (1800-2500)</SelectItem>
          </SelectContent>
        </Select>
      </FormGroup>

      <FormGroup
        label="Content Language"
        tooltip="Draft language. Localizes grammar, idioms, and examples."
      >
        <Select value={data.language} onValueChange={(value) => updateField('language', value)}>
          <SelectTrigger className="focus:shadow-soft transition-all duration-200">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="french">French</SelectItem>
            <SelectItem value="spanish">Spanish</SelectItem>
            <SelectItem value="german">German</SelectItem>
            <SelectItem value="bangla">Bangla</SelectItem>
          </SelectContent>
        </Select>
      </FormGroup>
    </FormSection>
  );
}
