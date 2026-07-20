'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PostScheduleSelectorProps {
  value?: { type: 'now' | 'draft' | 'schedule'; date?: Date };
  onChange?: (value: { type: 'now' | 'draft' | 'schedule'; date?: Date }) => void;
}

export default function PostScheduleSelector({
  value = { type: 'now' },
  onChange
}: PostScheduleSelectorProps) {
  const [type, setType] = useState<'now' | 'draft' | 'schedule'>(value.type);
  const [date, setDate] = useState<Date | undefined>(value.date || new Date());
  const [time, setTime] = useState<string>(
    value.date ? format(value.date, 'HH:mm') : format(new Date(), 'HH:mm')
  );

  useEffect(() => {
    if (onChange) {
      if (type === 'schedule' && date) {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledDate = new Date(date);
        scheduledDate.setHours(hours, minutes, 0, 0);
        onChange({ type, date: scheduledDate });
      } else {
        onChange({ type });
      }
    }
  }, [type, date, time, onChange]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={type === 'now' ? 'default' : 'outline'}
          onClick={() => setType('now')}
        >
          Publish Now
        </Button>
        <Button
          type="button"
          variant={type === 'draft' ? 'default' : 'outline'}
          onClick={() => setType('draft')}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          variant={type === 'schedule' ? 'default' : 'outline'}
          onClick={() => setType('schedule')}
        >
          Schedule
        </Button>
      </div>

      {type === 'schedule' && (
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
            <Input type="time" className="pl-10" value={time} onChange={handleTimeChange} />
          </div>
        </div>
      )}
    </div>
  );
}
