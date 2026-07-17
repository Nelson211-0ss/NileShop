import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, HelpCircle, Mail, MessageCircle, Phone, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_SECTIONS: { title: string; items: FaqItem[] }[] = [
  {
    title: 'Orders & shipping',
    items: [
      {
        question: 'How do I track my order?',
        answer:
          'Go to Orders in your account, open the order, and you’ll see its current status. You can also track an order without signing in from the order confirmation link.',
      },
      {
        question: 'How long does delivery take?',
        answer:
          'Delivery times depend on your vendor and location. Most orders in Juba arrive within 1–3 days; other areas may take longer. You’ll see an estimate at checkout.',
      },
      {
        question: 'Can I change my delivery address after ordering?',
        answer:
          'Contact support as soon as possible after placing your order. We can update the address if the order hasn’t been dispatched yet.',
      },
    ],
  },
  {
    title: 'Payments',
    items: [
      {
        question: 'What payment methods are accepted?',
        answer: 'NileShop accepts cash on delivery, mobile money, bank transfer, and card payments, depending on the vendor.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes. Card payments are processed through secure payment gateways — NileShop never stores your card details.',
      },
    ],
  },
  {
    title: 'Returns & refunds',
    items: [
      {
        question: 'What is the return policy?',
        answer:
          'Most products can be returned within 7 days of delivery if unused and in original packaging. Check the product page for any vendor-specific return terms.',
      },
      {
        question: 'How long do refunds take?',
        answer: 'Once a return is approved, refunds are processed to your NileShop wallet or original payment method within 3–5 business days.',
      },
    ],
  },
  {
    title: 'Selling on NileShop',
    items: [
      {
        question: 'How do I become a vendor?',
        answer: 'Create a vendor account from the Sell on NileShop page. Your store will go live once approved by our team, usually within 1–2 business days.',
      },
      {
        question: 'How do I get paid?',
        answer: 'Vendor earnings are added to your wallet after each delivered, paid order and can be withdrawn from your vendor dashboard.',
      },
    ],
  },
  {
    title: 'Account & security',
    items: [
      {
        question: 'I forgot my password. What do I do?',
        answer: 'Use the "Forgot password" link on the sign-in page to reset it by email.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Contact support and we’ll help you close your account. Note this is permanent and cannot be undone.',
      },
    ],
  },
];

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="font-medium text-foreground">{item.question}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="pt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HelpPage() {
  const [query, setQuery] = useState('');
  const user = useAppSelector((s) => s.auth.user);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_SECTIONS;

    return FAQ_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
      ),
    })).filter((section) => section.items.length > 0);
  }, [query]);

  const resultCount = filteredSections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/10">
        <div className="page-container py-16 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <HelpCircle className="h-3.5 w-3.5" />
              Help Center
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">How can we help?</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Search common questions about orders, payments, returns, and selling on NileShop.
            </p>
            <div className="relative mt-6 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a topic..."
                className="h-12 pl-10"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="page-container py-14">
        {query.trim() && (
          <p className="mb-4 text-sm text-muted-foreground">
            {resultCount} result{resultCount === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
          </p>
        )}

        {filteredSections.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No results. Try a different search, or contact support below.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredSections.map((section) => (
              <div key={section.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="font-display text-lg font-semibold">{section.title}</h2>
                <div className="mt-2">
                  {section.items.map((item) => (
                    <FaqAccordionItem key={item.question} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-secondary/40 py-14">
        <div className="page-container">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">Still need help?</h2>
              <p className="mt-1 text-muted-foreground">Our support team is happy to help with anything else.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href="mailto:support@nileshop.ss">
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
              <Button variant="outline" asChild>
                <Link to={user ? '/messages' : '/auth/login'}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
