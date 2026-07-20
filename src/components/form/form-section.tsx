import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <Card className={cn('shadow-medium h-fit border-0', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-lg font-semibold">{title}</CardTitle>
        {description && (
          <p className="mt-1 text-center text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
