'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, generateSkeleton } from '@/lib/utils';
import Image from 'next/image';

interface UserAvatarProps {
  name?: string;
  avatar?: string;
  className?: string;
  variant?: 'circle' | 'square';
}

export function UserAvatar({ name, avatar, className, variant = 'circle' }: UserAvatarProps) {
  const rounded = variant === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <Avatar className={cn('h-8 w-8', rounded, className)}>
      {avatar ? (
        <AvatarImage src={avatar} alt={name || 'User'} />
      ) : (
        <AvatarFallback className={cn(rounded, 'overflow-hidden')}>
          <Image
            src="/images/user-placeholder.png"
            alt={name || 'User'}
            width={200}
            height={200}
            placeholder={`data:image/svg+xml;base64,${generateSkeleton(200, 200)}`}
            className={cn('object-cover', rounded)}
          />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
