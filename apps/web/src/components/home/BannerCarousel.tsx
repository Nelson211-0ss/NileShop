import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '@nileshop/types';
import { cn } from '@/lib/utils';

const AUTO_ADVANCE_MS = 5500;

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = (index + banners.length) % banners.length;
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const id = setInterval(() => scrollToIndex(active + 1), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused, banners.length]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActive(index);
  };

  if (banners.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden bg-muted"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((banner) => {
          const content = (
            <div className="relative h-[160px] w-full sm:h-[220px] lg:h-[280px]">
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://picsum.photos/seed/banner-${banner.id}/1600/500`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="page-container absolute inset-0 flex items-end pb-8 sm:items-center sm:pb-0">
                <h2 className="max-w-lg text-2xl font-bold text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
                  {banner.title}
                </h2>
              </div>
            </div>
          );

          if (!banner.link) {
            return (
              <div key={banner.id} className="shrink-0 basis-full snap-center">
                {content}
              </div>
            );
          }

          if (banner.link.startsWith('http')) {
            return (
              <a key={banner.id} href={banner.link} className="block shrink-0 basis-full snap-center">
                {content}
              </a>
            );
          }

          return (
            <Link key={banner.id} to={banner.link} className="block shrink-0 basis-full snap-center">
              {content}
            </Link>
          );
        })}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            onClick={() => scrollToIndex(active - 1)}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm transition-colors hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            onClick={() => scrollToIndex(active + 1)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm transition-colors hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Go to banner ${index + 1}`}
                onClick={() => scrollToIndex(index)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  index === active ? 'w-6 bg-white' : 'w-1.5 bg-white/60',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
