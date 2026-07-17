import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, Compass, ShieldCheck, Star, Tag, Truck, Wallet } from 'lucide-react';
import { catalogApi } from '@/lib/marketplaceApi';
import { resolveCategoryIcon } from '@/lib/categoryIcon';

const CATEGORY_TIPS: Record<string, string> = {
  electronics: 'Check the warranty length, confirm the specs match what you need, and compare wattage for appliances.',
  phones: 'Compare storage and RAM for your budget, and check whether the seller includes a charger and warranty.',
  laptops: 'Match RAM and storage to your workload, and check the screen size against how portable you need it.',
  fashion: 'Check the size chart in the listing, review the fabric, and read recent buyer photos before ordering.',
  'home & garden': 'Measure your space first, and check material and care instructions before you buy.',
  'health & beauty': 'Check expiry dates and ingredient lists, and prefer sellers with verified customer reviews.',
  sports: 'Match gear to your skill level, and check size guides carefully for anything you wear.',
  'food & grocery': 'Check expiry dates and storage instructions, and look at delivery time for perishables.',
};

const GENERAL_TIPS = [
  {
    icon: Star,
    title: 'Check ratings and reviews',
    description: 'Products with more reviews and higher ratings are a good signal of consistent quality.',
  },
  {
    icon: ShieldCheck,
    title: 'Buy from verified vendors',
    description: 'Look for vendor details on the product page — store name, location, and response time.',
  },
  {
    icon: Wallet,
    title: 'Compare prices before buying',
    description: 'Use filters to sort by price and check a few similar listings before you commit.',
  },
  {
    icon: Truck,
    title: 'Confirm delivery details',
    description: 'Check estimated delivery time and location coverage before checking out.',
  },
];

function defaultTip(name: string) {
  return `Compare a few options within ${name.toLowerCase()}, check seller ratings, and read the product description carefully before buying.`;
}

export function GuidePage() {
  const { data } = useQuery({ queryKey: ['categories'], queryFn: catalogApi.categories });
  const categories = data?.data ?? [];

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/10">
        <div className="page-container py-16 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <Compass className="h-3.5 w-3.5" />
              NileShop Buying Guide
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Shop smarter with a few <span className="text-primary">quick tips</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Not sure what to look for? Here&apos;s what to check before you buy, by category.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="page-container py-14">
        <h2 className="text-2xl font-bold tracking-tight">Choosing by category</h2>
        <p className="mt-1 text-muted-foreground">Pick a category to see what matters most when buying.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = resolveCategoryIcon(category.icon);
            const tip = CATEGORY_TIPS[category.name.toLowerCase()] ?? defaultTip(category.name);

            return (
              <Link
                key={category.id}
                to={`/products?category_id=${category.id}`}
                className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{tip}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Shop {category.name}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-secondary/40 py-14">
        <div className="page-container">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Tag className="h-5 w-5 text-accent" />
            General shopping tips
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {GENERAL_TIPS.map((tip) => (
              <div key={tip.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <tip.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-semibold">{tip.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
