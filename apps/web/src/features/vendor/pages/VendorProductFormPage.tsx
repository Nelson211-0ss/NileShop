import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogApi, vendorApi } from '@/lib/marketplaceApi';
import { ImageUploadField, type UploadedImage } from '@/components/vendor/ImageUploadField';
import { VendorApprovalDialog } from '@/components/vendor/VendorApprovalDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function VendorProductFormPage({ productId }: { productId?: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(productId);

  const { data: store } = useQuery({ queryKey: ['vendor-store'], queryFn: vendorApi.myStore });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: catalogApi.categories });
  const { data: existing, isLoading } = useQuery({
    queryKey: ['vendor-product', productId],
    queryFn: () => vendorApi.getProduct(productId!),
    enabled: isEdit,
  });

  const vendor = store?.data;
  const isApproved = vendor?.status === 'approved';

  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    short_description: '',
    description: '',
    category_id: '',
    status: 'published',
  });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  useEffect(() => {
    if (!isEdit && vendor && vendor.status !== 'approved') {
      setShowApprovalDialog(true);
    }
  }, [vendor, isEdit]);

  useEffect(() => {
    if (!existing?.data) return;
    const p = existing.data;
    setForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      short_description: p.short_description ?? '',
      description: p.description ?? '',
      category_id: p.category?.id ? String(p.category.id) : '',
      status: p.status,
    });
    setImages((p.images ?? []).map((img) => ({ path: img.path, url: img.url })));
  }, [existing?.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        short_description: form.short_description || undefined,
        description: form.description || undefined,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        status: form.status,
        image_paths: images.map((img) => img.path),
      };
      if (isEdit && productId) {
        return vendorApi.updateProduct(productId, payload);
      }
      return vendorApi.createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      navigate('/vendor');
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (axiosErr.response?.data?.errors?.vendor?.length) {
        setShowApprovalDialog(true);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && !isApproved) {
      setShowApprovalDialog(true);
      return;
    }
    save.mutate();
  };

  if (isEdit && isLoading) {
    return <div className="page-container py-6"><div className="h-64 rounded-lg bg-muted animate-pulse" /></div>;
  }

  return (
    <div className="page-container py-6">
      <VendorApprovalDialog open={showApprovalDialog} onClose={() => setShowApprovalDialog(false)} />

      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-4">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border p-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Price (SSP)</Label>
              <Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">Select category</option>
              {categories?.data?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Short description</Label>
            <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              className="w-full min-h-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <Label>Product images</Label>
            <ImageUploadField value={images} onChange={setImages} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving...' : 'Save product'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/vendor')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
