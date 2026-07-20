import Logo from '@/components/logo';

import { OnboardingCarousel } from '../_components/onboarding-carousel';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="bg-muted relative hidden h-svh flex-col text-white lg:flex dark:border-e">
        <div className="absolute top-6 left-6 z-20 flex items-center text-lg font-medium">
          <Logo className="text-black" />
        </div>
        <div className="h-full flex-1">
          <OnboardingCarousel />
        </div>
      </div>
      <div className="lg:p-8">{children}</div>
    </div>
  );
}
