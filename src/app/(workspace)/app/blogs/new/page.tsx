'use client';

import CreditDropdown from '@/components/credit-dropdown';
import DynamicBreadcrumb from '@/components/dynamic-breadcrumbs';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState } from 'react';
import SubscriptionAlert from '@/features/subscriptions/components/subscription-alert';

const generators = [
  {
    title: 'One Click Single Article Generator',
    description: 'Generate a polished article instantly',
    href: '/app/blogs/new/autopilot',
    animation: '/animations/autopilot.lottie'
  },
  {
    title: 'Copilot Single Article Generator',
    description: 'AI-assisted writing & refinement',
    href: '/app/blogs/new/copilot',
    animation: '/animations/copilot.lottie'
  },
  {
    title: 'Bulk Article Generator',
    description: 'Generate multiple articles at once',
    href: '/app/blogs/new/bulk',
    animation: '/animations/bulk.lottie'
  }
];

export default function BlogPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const players = useRef<Record<number, { pause: () => void; play: () => void } | null>>({});

  const handleHover = (index: number | null) => {
    setHoveredIndex(index);

    // pause all animations first
    Object.values(players.current).forEach((player) => {
      if (player && typeof player.pause === 'function') {
        player.pause();
      }
    });

    // if hovered, play that one
    if (index !== null && players.current[index]) {
      const player = players.current[index];

      if (player && typeof player.play === 'function') {
        player.play();
      }
    }
  };

  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center gap-2">
          <CreditDropdown />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <DynamicBreadcrumb />

        <h1 className="mb-4 text-center text-3xl font-bold md:text-4xl">
          Choose Your Article Generator
        </h1>

        <div className="mx-auto mb-8 max-w-lg">
          <SubscriptionAlert threshold={100} />
        </div>

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {generators.map(({ title, description, href, animation }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => handleHover(index)}
              onMouseLeave={() => handleHover(null)}
            >
              <Link href={href} className="block">
                <Card className="group relative h-full cursor-pointer overflow-hidden border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-neutral-900/50">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 opacity-0 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20"
                    animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />

                  <CardHeader className="relative flex flex-col items-center justify-center pt-6">
                    <div className="mb-3 size-36">
                      <DotLottieReact
                        src={animation}
                        loop
                        autoplay={false}
                        dotLottieRefCallback={(instance) => {
                          if (instance) {
                            players.current[index] = instance;
                          }
                        }}
                      />
                    </div>
                    <CardTitle className="text-center text-base leading-tight font-medium text-neutral-900 dark:text-neutral-100">
                      {title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="relative flex flex-col items-center justify-center px-4 pb-6">
                    <CardDescription className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                      {description}
                    </CardDescription>
                  </CardContent>

                  <motion.div
                    className="absolute right-0 bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: hoveredIndex === index ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </Main>
    </>
  );
}
