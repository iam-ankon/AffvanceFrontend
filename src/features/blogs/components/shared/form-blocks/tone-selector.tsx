'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Briefcase, MessageSquare, Smile, Zap } from 'lucide-react';
import { useState } from 'react';

interface ToneOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface ToneSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const toneOptions: ToneOption[] = [
  {
    value: 'naturally-engaging',
    label: 'Engaging',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'bg-gradient-to-br from-blue-500 to-indigo-600'
  },
  {
    value: 'professional',
    label: 'Professional',
    icon: <Briefcase className="h-4 w-4" />,
    color: 'bg-gradient-to-br from-purple-500 to-pink-600'
  },
  {
    value: 'casual',
    label: 'Casual',
    icon: <Smile className="h-4 w-4" />,
    color: 'bg-gradient-to-br from-green-500 to-teal-600'
  },
  {
    value: 'friendly',
    label: 'Friendly',
    icon: <Zap className="h-4 w-4" />,
    color: 'bg-gradient-to-br from-yellow-500 to-orange-600'
  }
];

export default function ToneSelector({ value = '', onChange, className }: ToneSelectorProps) {
  const [selected, setSelected] = useState(value);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const handleClick = (option: string, label: string) => {
    setSelected(option);
    if (onChange) onChange(option);
    setTooltip(label);
    setTimeout(() => setTooltip(null), 1500);
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {toneOptions.map((option) => (
        <div key={option.value} className="group relative">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant={selected === option.value ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-8 rounded-md px-3 text-xs font-medium transition-colors',
                'flex items-center gap-2',
                selected === option.value ? option.color : 'bg-background',
                selected === option.value && 'border-transparent text-white',
                'hover:bg-primary/10 hover:text-primary',
                'focus-visible:ring-ring focus-visible:ring-2',
                'relative overflow-hidden'
              )}
              onClick={() => handleClick(option.value, option.label)}
              onMouseEnter={() => setTooltip(option.label)}
              onMouseLeave={() => setTooltip(null)}
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded',
                  selected === option.value ? 'bg-white/20' : option.color + ' text-white'
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
              {option.label} tone
              <div className="bg-foreground absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"></div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
