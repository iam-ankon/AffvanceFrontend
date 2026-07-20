'use client';

import { InputTags } from '@/components/ui/input-tags';

interface KeywordInputProps {
  value: string[];
  onChange: (value: string[] | ((prev: string[]) => string[])) => void;
  placeholder?: string;
  className?: string;
}

export default function KeywordInput({
  value,
  onChange,
  placeholder = 'Enter keywords, comma separated...',
  className = ''
}: KeywordInputProps) {
  const handleChange = (newValue: string[] | ((prev: string[]) => string[])) => {
    if (typeof newValue === 'function') {
      // If it's a function (like from setState), call it with the current value
      onChange(newValue(value));
    } else {
      // If it's a direct value, use it as is
      onChange(newValue);
    }
  };

  return (
    <InputTags
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full ${className}`}
    />
  );
}
