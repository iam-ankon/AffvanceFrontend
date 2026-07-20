'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import PublishingAccountSelector from './publishing-account-selector';
import CategorySelector from './category-selector';
import ScheduleTimeSelector from './schedule-time-selector';

export interface PublishingConfig {
  accountId: string;
  categoryId: number | null;
  categoryName: string | null;
  scheduleMode: 'now' | 'later';
  scheduledTime: Date | null;
}

interface MultiPublishingManagerProps {
  value: PublishingConfig[];
  onChange: (value: PublishingConfig[]) => void;
  className?: string;
}

export default function MultiPublishingManager({
  value = [],
  onChange,
  className = ''
}: MultiPublishingManagerProps) {
  const addPublishingConfig = () => {
    onChange([
      ...value,
      {
        accountId: '',
        categoryId: null,
        categoryName: null,
        scheduleMode: 'now',
        scheduledTime: null
      }
    ]);
  };

  const removePublishingConfig = (index: number) => {
    const newConfigs = value.filter((_, i) => i !== index);
    onChange(newConfigs);
  };

  const updatePublishingConfig = (index: number, field: keyof PublishingConfig, newValue: PublishingConfig[keyof PublishingConfig]) => {
    const newConfigs = [...value];
    newConfigs[index] = {
      ...newConfigs[index],
      [field]: newValue
    };
    onChange(newConfigs);
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Publishing Destinations (Optional)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPublishingConfig}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Destination
          </Button>
        </div>

        {value.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">
              No publishing destinations added yet
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPublishingConfig}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Destination
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {value.map((config, index) => (
              <Card key={index} className="p-4 space-y-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Destination {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePublishingConfig(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <PublishingAccountSelector
                  value={config.accountId}
                  onChange={(value) => updatePublishingConfig(index, 'accountId', value)}
                  disabledAccountIds={value.filter((_, i) => i !== index).map(c => c.accountId)}
                />

                <CategorySelector
                  accountId={config.accountId || null}
                  value={config.categoryId}
                  onChange={(categoryId, categoryName) => {
                    const newConfigs = [...value];
                    newConfigs[index] = {
                      ...newConfigs[index],
                      categoryId,
                      categoryName: categoryName ?? null
                    };
                    onChange(newConfigs);
                  }}
                  required
                />

                <ScheduleTimeSelector
                  accountId={config.accountId || null}
                  scheduleMode={config.scheduleMode}
                  scheduledTime={config.scheduledTime}
                  onScheduleModeChange={(mode) => updatePublishingConfig(index, 'scheduleMode', mode)}
                  onScheduledTimeChange={(time) => updatePublishingConfig(index, 'scheduledTime', time)}
                />
              </Card>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          You can publish this blog to multiple WordPress sites. Each destination can have its own category and schedule.
        </p>
      </div>
    </div>
  );
}
