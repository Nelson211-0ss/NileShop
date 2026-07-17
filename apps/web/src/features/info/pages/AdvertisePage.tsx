import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Layout, Mail, Megaphone, Phone, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AD_FORMATS = [
  {
    icon: Layout,
    title: 'Homepage banners',
    description:
      'A rotating banner slot at the very top of NileShop — the first thing every shopper sees when they land on the homepage.',
  },
  {
    icon: Sparkles,
    title: 'Featured placement',
    description:
      'Get your products surfaced in the Featured Products and Flash Deals sections shown to shoppers across the site.',
  },
  {
    icon: Search,
    title: 'Sponsored search results',
    description:
      'Appear at the top of relevant product searches so shoppers see you first when they’re ready to buy.',
  },
];

const STEPS = [
  {
    title: 'Tell us about your campaign',
    description: 'Reach out with the products or store you want to promote and your target audience.',
  },
  {
    title: 'We put together a package',
    description: 'Our team recommends the right mix of placements based on your budget and goals.',
  },
  {
    title: 'Your campaign goes live',
    description: 'We schedule your creative and start reporting on impressions, clicks, and sales.',
  },
];

export function AdvertisePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/10">
        <div className="page-container py-16 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <Megaphone className="h-3.5 w-3.5" />
              NileShop Advertising
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Put your products in front of <span className="text-primary">South Sudan&apos;s shoppers</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Homepage banners, featured placement, and sponsored search results — reach thousands of shoppers
              browsing NileShop every day.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="mailto:support@nileshop.ss?subject=Advertising%20on%20NileShop">Get in touch</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth/vendor-register">Sell on NileShop</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="page-container py-14">
        <h2 className="text-2xl font-bold tracking-tight">Ad formats</h2>
        <p className="mt-1 text-muted-foreground">Choose the placement that fits your campaign.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {AD_FORMATS.map((format) => (
            <div key={format.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <format.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{format.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{format.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-14">
        <div className="page-container">
          <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container py-14">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <BarChart3 className="h-5 w-5 text-accent" />
              Ready to grow your reach?
            </h2>
            <p className="mt-1 text-muted-foreground">Tell us about your campaign and we&apos;ll get back to you.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="mailto:support@nileshop.ss?subject=Advertising%20on%20NileShop">
                <Mail className="mr-2 h-4 w-4" />
                support@nileshop.ss
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="tel:+211900000000">
                <Phone className="mr-2 h-4 w-4" />
                +211 900 000 000
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
