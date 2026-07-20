'use client';

import { uniqueRegions } from '@/app/data/regions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useState } from 'react';

interface RegionSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function RegionSelector({ value = 'us', onChange }: RegionSelectorProps) {
  const [selected, setSelected] = useState(value);

  const handleChange = (value: string) => {
    setSelected(value);
    if (onChange) onChange(value);
  };

  return (
    <Select value={selected} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a region" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] overflow-y-auto">
        {uniqueRegions.map((region) => (
          <SelectItem key={`region-${region.code}`} value={region.code}>
            {region.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
