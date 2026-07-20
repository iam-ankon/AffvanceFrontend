import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image src="/images/logo.png" width={30} height={30} alt="brand logo" />
      <div className="overflow-hidden whitespace-nowrap transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
        <h3 className="font-bold">Affvance</h3>
        <p className="text-xs">Rank . Reach . Revenue</p>
      </div>
    </div>
  );
}
