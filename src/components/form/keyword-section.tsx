import KeywordCombobox, {
  type KeywordOption
} from '@/features/blogs/components/shared/form-blocks/keyword-combobox';

import { FormGroup } from './form-group';

export interface KeywordData {
  keywords: KeywordOption[];
}

interface KeywordSectionProps {
  data: KeywordData;
  onChange: (data: KeywordData) => void;
  maxSelections?: number;
}

export function KeywordSection({ data, onChange, maxSelections = 1 }: KeywordSectionProps) {
  const updateKeywords = (
    keywords: KeywordOption[] | ((prev: KeywordOption[]) => KeywordOption[])
  ) => {
    const newKeywords = typeof keywords === 'function' ? keywords(data.keywords) : keywords;
    onChange({ keywords: newKeywords });
  };

  return (
    <FormGroup
      label={maxSelections === 1 ? 'Select Keyword' : 'Select Keywords'}
      tooltip={
        maxSelections === 1
          ? 'Choose a single keyword to generate articles for. Pick keywords with high search volume and low difficulty for best results.'
          : `Select up to ${maxSelections} keywords. Pick keywords with high search volume and low difficulty for best results.`
      }
    >
      <KeywordCombobox
        value={data.keywords}
        onChange={updateKeywords}
        placeholder={
          maxSelections === 1
            ? 'Click here to choose a keyword or type your own...'
            : 'Click here to choose keywords or type your own...'
        }
        maxSelections={maxSelections}
      />
      <p className="text-muted-foreground mt-1 text-xs">
        💡 Tip: Choose keywords with high search volume and low difficulty for best results.
      </p>
    </FormGroup>
  );
}
