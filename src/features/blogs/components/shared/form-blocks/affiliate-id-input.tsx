'use client';

import { Input } from '@/components/ui/input';

interface AffiliateIdInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function AffiliateIdInput({
  value,
  onChange,
  className = '',
  placeholder = 'your-affiliate-id-20'
}: AffiliateIdInputProps) {
  return (
    <div className={className}>
      <Input
        id="affiliate-id"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
      <p className="text-muted-foreground mt-1 text-xs">
        Your Amazon Associates tracking ID (e.g., yourstore-20)
      </p>
    </div>
  );
}
