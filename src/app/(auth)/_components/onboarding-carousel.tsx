'use client';

import { Carousel, CarouselContent, CarouselDots, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

export function OnboardingCarousel() {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
          stopOnInteraction: false
        })
      ]}
      opts={{ loop: true }}
    >
      <CarouselContent className="-ml-0">
        {Array.from({ length: 3 }).map((_, index) => (
          <CarouselItem key={index} className="pl-0">
            <div className="relative h-svh w-full p-0">
              <Image
                src="/images/carousel/1.jpg"
                fill
                alt={`Onboarding slide`}
                className="object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselDots className="bottom-7" />
    </Carousel>
  );
}
