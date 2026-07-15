import type { SalesReportPoint, TopProduct } from '@nileshop/types';

/** Placeholder trend used only when a dashboard has no real activity yet, so the chart isn't blank. */
export function dummySalesTrend(days = 14): SalesReportPoint[] {
  const points: SalesReportPoint[] = [];
  let base = 40000;

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    base += (Math.random() - 0.35) * 12000;
    base = Math.max(base, 8000);
    points.push({
      date: date.toISOString().slice(0, 10),
      revenue: Math.round(base),
      orders: Math.max(1, Math.round(base / 9000)),
    });
  }

  return points;
}

const DUMMY_PRODUCT_NAMES = ['Smart LED TV', 'Wireless Earbuds', 'Running Shoes', 'Office Chair', 'Blender'];

/** Placeholder top-products list used only when there's no real sales history yet. */
export function dummyTopProducts(): TopProduct[] {
  return DUMMY_PRODUCT_NAMES.map((name, i) => ({
    name,
    total_sales: 40 - i * 6,
    price: 25000 - i * 2000,
  }));
}
