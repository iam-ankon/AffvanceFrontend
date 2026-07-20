import PublishingAccountSelector from '@/features/blogs/components/shared/form-blocks/publishing-account-selector';
import CategorySelector from '@/features/blogs/components/shared/form-blocks/category-selector';
import ScheduleTimeSelector from '@/features/blogs/components/shared/form-blocks/schedule-time-selector';

import { FormSection } from './form-section';

export interface PublishingData {
  publishingAccountId: string;
  categoryId: number | null;
  scheduleMode: 'now' | 'later';
  scheduledTime: Date | null;
}

interface PublishingSectionProps {
  data: PublishingData;
  onChange: (data: PublishingData) => void;
}

export function PublishingSection({ data, onChange }: PublishingSectionProps) {
  const updateField = <K extends keyof PublishingData>(field: K, value: PublishingData[K]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <FormSection
      title="Publishing"
      className="from-card to-muted/30 bg-gradient-to-br"
    >
      <PublishingAccountSelector
        value={data.publishingAccountId}
        onChange={(value) => updateField('publishingAccountId', value)}
      />
      <CategorySelector
        accountId={data.publishingAccountId || null}
        value={data.categoryId}
        onChange={(value) => updateField('categoryId', value)}
        required
      />
      <ScheduleTimeSelector
        accountId={data.publishingAccountId || null}
        scheduleMode={data.scheduleMode}
        scheduledTime={data.scheduledTime}
        onScheduleModeChange={(mode) => updateField('scheduleMode', mode)}
        onScheduledTimeChange={(time) => updateField('scheduledTime', time)}
      />
    </FormSection>
  );
}
