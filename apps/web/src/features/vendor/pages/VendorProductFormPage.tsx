import { vendorApi } from '@/lib/marketplaceApi';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { VendorProductForm } from '@/features/vendor/components/VendorProductForm';

export function VendorProductFormPage() {
  return (
    <>
      <PageHeader title="Add product" description="Create a new product listing for your store." />
      <VendorProductForm submitLabel="Create product" onSubmit={vendorApi.createProduct} />
    </>
  );
}
