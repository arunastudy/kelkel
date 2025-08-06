'use client';

import ImageCarousel from '@/app/components/ImageCarousel';

interface MainCarouselProps {
  images: string[];
}

export default function MainCarousel({ images }: MainCarouselProps) {
  return (
    <div className="mt-8">
      <ImageCarousel images={images} />
    </div>
  );
}