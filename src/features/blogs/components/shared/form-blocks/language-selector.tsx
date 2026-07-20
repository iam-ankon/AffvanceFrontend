'use client';

import { uniqueLanguages } from '@/app/data/languages';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import React, { useCallback } from 'react';

interface LanguageSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
}

function LanguageSelectorComponent({ value = 'en', onChange }: LanguageSelectorProps) {
  // Directly use the value prop instead of internal state
  // This makes it a controlled component
  const handleChange = useCallback(
    (newValue: string) => {
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] overflow-y-auto">
        {uniqueLanguages.map((lang) => (
          <SelectItem key={`lang-${lang.code}`} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Memoize the component to prevent unnecessary re-renders
const LanguageSelector = React.memo(LanguageSelectorComponent);
export default LanguageSelector;
