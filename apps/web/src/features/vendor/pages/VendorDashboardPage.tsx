import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { vendorApi } from '@/lib/marketplaceApi';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@nileshop/utils';

export function VendorDashboardPage() {
  const { data: store } = useQuery({ queryKey: ['vendor-store'], queryFn: vendorApi.myStore });
  const { data: products, refetch: refetchProducts } = useQuery({ queryKey: ['vendor-products'], queryFn: vendorApi.myProducts });
  const { data: orders } = useQuery({ queryKey: ['vendor-orders'], queryFn: vendorApi.myOrders });

  const vendor = store?.data;
  const productList = products?.data ?? [];

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await vendorApi.deleteProduct(id);
    refetchProducts();
  };

  return (
    <div className="page-container py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">Vendor Dashboard</h1>
          {vendor && (
            <p className="text-sm text-muted-foreground">{vendor.store_name} · {vendor.status}</p>
          )}
        </div>
        <Button asChild size="sm">
          <Link to="/vendor/products/new"><Plus className="h-4 w-4 mr-1" /> Add product</Link>
        </Button>
      </div>

      {vendor?.status === 'pending' && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          Your store is awaiting admin approval. You cannot add products until your store is approved.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Products</p>
          <p className="text-xl font-bold">{productList.length}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Orders</p>
          <p className="text-xl font-bold">{orders?.data?.length ?? 0}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Rating</p>
          <p className="text-xl font-bold">{vendor?.rating ?? 0} ⭐</p>
        </div>
      </div>

      <h2 className="font-semibold text-sm mb-3">Your Products</h2>
      {productList.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products yet.</p>
      ) : (
        <div className="space-y-3">
          {productList.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-2">
              <div className="h-14 w-14 shrink-0 rounded-md overflow-hidden bg-muted">
                {p.images?.[0] && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(p.price)} · Stock: {p.stock} · {p.status}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                  <Link to={`/vendor/products/${p.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-semibold text-sm mt-8 mb-3">Storefront preview</h2>
      <ProductGrid>
        {productList.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}
      </ProductGrid>
    </div>
  );
}
