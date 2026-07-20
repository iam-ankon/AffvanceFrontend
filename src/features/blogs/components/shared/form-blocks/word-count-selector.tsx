'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FileText, FileType2 } from 'lucide-react';
import { useState } from 'react';

interface WordCountOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  min: number;
  max: number;
}

interface WordCountSelectorProps {
  value?: { min: number; max: number };
  onChange?: (value: { min: number; max: number }) => void;
  className?: string;
}

const wordCountOptions: WordCountOption[] = [
  {
    value: 'small',
    label: 'Small',
    description: '800-1200 words',
    icon: <FileText className="h-3.5 w-3.5" />,
    color: 'from-blue-500 to-blue-600',
    min: 800,
    max: 1200
  },
  {
    value: 'medium',
    label: 'Medium',
    description: '1200-1800 words',
    icon: <FileText className="h-4 w-4" />,
    color: 'from-purple-500 to-pink-600',
    min: 1200,
    max: 1800
  },
  {
    value: 'large',
    label: 'Large',
    description: '1800-2500 words',
    icon: <FileType2 className="h-4.5 w-4.5" />,
    color: 'from-amber-500 to-orange-600',
    min: 1800,
    max: 2500
  }
];

export default function WordCountSelector({
  value = { min: 1200, max: 1800 },
  onChange,
  className
}: WordCountSelectorProps) {
  const [selected, setSelected] = useState(value);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const handleClick = (option: WordCountOption) => {
    const newValue = { min: option.min, max: option.max };
    setSelected(newValue);
    if (onChange) onChange(newValue);
    setTooltip(option.label);
    setTimeout(() => setTooltip(null), 1500);
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {wordCountOptions.map((option) => (
        <div key={option.value} className="group relative">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant={
                selected.min === option.min && selected.max === option.max ? 'default' : 'outline'
              }
              size="sm"
              className={cn(
                'h-8 rounded-md px-3 text-xs font-medium transition-colors',
                'flex items-center gap-2',
                selected.min === option.min && selected.max === option.max
                  ? option.color
                  : 'bg-background',
                selected.min === option.min &&
                  selected.max === option.max &&
                  'border-transparent text-white',
                'hover:bg-primary/10 hover:text-primary',
                'focus-visible:ring-ring focus-visible:ring-2',
                'relative overflow-hidden'
              )}
              onClick={() => handleClick(option)}
              onMouseEnter={() => setTooltip(option.label)}
              onMouseLeave={() => setTooltip(null)}
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded',
                  selected.min === option.min && selected.max === option.max
                    ? 'bg-white/20'
                    : 'bg-gradient-to-br ' + option.color + ' text-white'
                )}
              >
                {option.icon}
              </div>
              <span className="truncate">{option.label}</span>
            </Button>
          </motion.div>

          {tooltip === option.label && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-foreground text-background absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded px-2 py-1 text-xs whitespace-nowrap"
            >
              {option.label}: {option.description}
              <div className="bg-foreground absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"></div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
