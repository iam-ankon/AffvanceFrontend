'use client';

import { useArticleTemplates } from '@/lib/hooks/use-article-templates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface StructureTypeSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function StructureTypeSelector({
  value = 'blog',
  onChange,
  className
}: StructureTypeSelectorProps) {
  const { templates, isLoading } = useArticleTemplates();
  const [selected, setSelected] = useState(value);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const handleClick = (option: string, label: string) => {
    setSelected(option);
    if (onChange) onChange(option);
    setTooltip(label);
    setTimeout(() => setTooltip(null), 1500);
  };

  if (isLoading) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        <div className="text-sm text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {Object.values(templates).map((option) => (
        <div key={option.id} className="group relative">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant={selected === option.id ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-8 rounded-md px-3 text-xs font-medium transition-colors',
                'flex items-center gap-2',
                selected === option.id ? 'bg-primary' : 'bg-background',
                selected === option.id && 'border-transparent text-white',
                'hover:bg-primary/10 hover:text-primary',
                'focus-visible:ring-ring focus-visible:ring-2',
                'relative min-w-[80px] overflow-hidden'
              )}
              onClick={() => handleClick(option.id, option.name)}
              onMouseEnter={() => setTooltip(option.name)}
              onMouseLeave={() => setTooltip(null)}
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded',
                  selected === option.id
                    ? 'bg-white/20'
                    : 'bg-gradient-to-br ' + option.icon + ' text-primary'
                )}
              >
                {option.icon}
              </div>
              <span className="truncate">{option.name}</span>
            </Button>
          </motion.div>

          {tooltip === option.name && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-foreground text-background absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded px-2 py-1 text-xs whitespace-nowrap"
            >
              {option.sections.map((section, index) => (
                <span className="block" key={index}>
                  {section}
                </span>
              ))}
              <div className="bg-foreground absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"></div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
