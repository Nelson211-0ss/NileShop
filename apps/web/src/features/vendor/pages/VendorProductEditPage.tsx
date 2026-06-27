import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '@/lib/marketplaceApi';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { VendorProductForm, type ProductFormState } from '@/features/vendor/components/VendorProductForm';

export function VendorProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-product', productId],
    queryFn: () => vendorApi.getProduct(productId),
    enabled: Number.isFinite(productId),
  });

  const product = data?.data;

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  }

  if (!product) {
    return <p className="text-sm text-muted-foreground">Product not found.</p>;
  }

  const initial: ProductFormState = {
    name: product.name,
    category_id: product.category?.id ? String(product.category.id) : '',
    short_description: product.short_description ?? '',
    description: product.description ?? '',
    sku: product.sku ?? '',
    price: String(product.price),
    compare_price: product.compare_price ? String(product.compare_price) : '',
    stock: String(product.stock),
    status: product.status === 'published' ? 'published' : 'draft',
  };

  return (
    <>
      <PageHeader title="Edit product" description={product.name} />
      <VendorProductForm
        initial={initial}
        imagePaths={product.images?.map((img) => img.path) ?? []}
        submitLabel="Save changes"
        onSubmit={(payload) => vendorApi.updateProduct(productId, payload)}
      />
    </>
  );
}
