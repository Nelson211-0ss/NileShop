import { ProductBrowseSection } from '@/components/catalog/ProductBrowseSection';

export function ProductsPage() {
  return (
    <div className="page-container py-6 lg:py-8">
      <ProductBrowseSection sectionTitle="All products" />
    </div>
  );
}
