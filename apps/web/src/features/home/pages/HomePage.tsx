import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Star } from 'lucide-react';
import { homeApi } from '@/lib/marketplaceApi';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid';
import { ProductBrowseSection } from '@/components/catalog/ProductBrowseSection';
import { Button } from '@/components/ui/button';

export function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ['home'], queryFn: homeApi.get });

  const home = data?.data;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/10">
        <div className="page-container py-16 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Shop smarter across <span className="text-primary">South Sudan</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Thousands of products from trusted vendors. Prices in SSP. Fast delivery in Juba.
            </p>
            <div className="mt-6 flex gap-3">
              <Button size="lg" asChild>
                <Link to="/#browse">Browse products</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth/vendor-register">Sell on NileShop</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Browse + filters */}
      <div className="page-container py-10 lg:py-12">
        <ProductBrowseSection sectionTitle="Shop all products" showViewAllLink />
      </div>

      {/* Flash Sale */}
      {home?.flash_sale && (
        <section className="bg-accent/10 py-10">
          <div className="page-container">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold">
                  <Clock className="h-6 w-6 text-accent" />
                  {home.flash_sale.name}
                </h2>
                <p className="text-sm text-muted-foreground">Limited time deals</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/products?sort=total_sales&direction=desc">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ProductGrid>
              {home.flash_sale.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ProductGrid>
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="page-container py-12">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
          <Star className="h-6 w-6 text-primary" /> Featured Products
        </h2>
        {isLoading ? (
          <ProductGridSkeleton count={6} />
        ) : (
          <ProductGrid>
            {home?.featured_products?.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        )}
      </section>

      {/* Best Sellers */}
      <section className="page-container pb-12">
        <h2 className="mb-6 text-2xl font-bold">Best Sellers</h2>
        <ProductGrid>
          {home?.best_sellers?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ProductGrid>
      </section>
    </div>
  );
}
