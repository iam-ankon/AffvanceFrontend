import { cn } from '@/lib/utils';

// import { TooltipInfo } from './TooltipInfo';

interface FormGroupProps {
  label: string;
  tooltip?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormGroup({ label, tooltip, required, children, className }: FormGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center">
        <label className="text-foreground text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        {/* {tooltip && <TooltipInfo content={tooltip} />} */}
      </div>
      {children}
    </div>
  );
}
