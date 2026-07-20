'use client';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { type ReactNode } from 'react';

export default function NuqsProvider({ children }: { children: ReactNode }) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
