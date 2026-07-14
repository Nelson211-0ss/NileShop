import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@nileshop/types';
import { ProductCard } from '@/components/product/ProductCard';

export function ProductCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-carousel-item]');
    const step = (card?.offsetWidth ?? 200) + 10;
    track.scrollBy({ left: direction * step * 2, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <div className="group/carousel relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-carousel-item
            className="w-[42vw] shrink-0 snap-start sm:w-[190px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollByCards(-1)}
        className="absolute -left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground opacity-0 shadow-sm transition-opacity group-hover/carousel:opacity-100 sm:flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollByCards(1)}
        className="absolute -right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground opacity-0 shadow-sm transition-opacity group-hover/carousel:opacity-100 sm:flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
