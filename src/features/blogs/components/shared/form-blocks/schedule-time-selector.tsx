'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ScheduleTimeSelectorProps {
  accountId?: string | null;
  scheduleMode?: 'now' | 'later';
  scheduledTime?: Date | null;
  onScheduleModeChange?: (mode: 'now' | 'later') => void;
  onScheduledTimeChange?: (time: Date | null) => void;
  className?: string;
}

export default function ScheduleTimeSelector({
  accountId = null,
  scheduleMode = 'now',
  scheduledTime = null,
  onScheduleModeChange,
  onScheduledTimeChange,
  className = ''
}: ScheduleTimeSelectorProps) {
  const [date, setDate] = useState<Date | undefined>(scheduledTime || undefined);
  const [time, setTime] = useState<string>(
    scheduledTime ? format(scheduledTime, 'HH:mm') : '12:00'
  );

  useEffect(() => {
    if (scheduleMode === 'later' && date) {
      const [hours, minutes] = time.split(':');
      const newDateTime = new Date(date);
      newDateTime.setHours(parseInt(hours), parseInt(minutes));
      if (onScheduledTimeChange) {
        onScheduledTimeChange(newDateTime);
      }
    } else if (scheduleMode === 'now') {
      if (onScheduledTimeChange) {
        onScheduledTimeChange(null);
      }
    }
  }, [date, time, scheduleMode]);

  const handleScheduleModeChange = (value: string) => {
    if (onScheduleModeChange) {
      onScheduleModeChange(value as 'now' | 'later');
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };

  if (!accountId) {
    return null;
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <Label>When to Publish</Label>
        <RadioGroup value={scheduleMode} onValueChange={handleScheduleModeChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="now" id="schedule-now" />
            <Label htmlFor="schedule-now" className="font-normal cursor-pointer">
              Publish immediately after generation
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="later" id="schedule-later" />
            <Label htmlFor="schedule-later" className="font-normal cursor-pointer">
              Schedule for later
            </Label>
          </div>
        </RadioGroup>

        {scheduleMode === 'later' && (
          <div className="space-y-3 pl-6 border-l-2 border-muted">
            <div className="space-y-2">
              <Label htmlFor="schedule-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="schedule-date"
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="schedule-time"
                  type="time"
                  value={time}
                  onChange={handleTimeChange}
                  className="pl-10"
                />
              </div>
            </div>

            {date && time && (
              <p className="text-sm text-muted-foreground">
                Will be published on {format(date, 'PPP')} at {time}
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {scheduleMode === 'now'
            ? 'Content will be published as soon as it\'s generated'
            : 'Content will be scheduled for publishing at the selected date and time'}
        </p>
      </div>
    </div>
  );
}
