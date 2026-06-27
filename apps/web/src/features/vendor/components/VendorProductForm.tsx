import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { catalogApi } from '@/lib/marketplaceApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploadField, type UploadedImage } from '@/components/vendor/ImageUploadField';
import { extractApiError } from '@/lib/apiErrors';

export interface ProductFormState {
  name: string;
  category_id: string;
  short_description: string;
  description: string;
  sku: string;
  price: string;
  compare_price: string;
  stock: string;
  status: 'draft' | 'published';
}

export const emptyProductForm: ProductFormState = {
  name: '',
  category_id: '',
  short_description: '',
  description: '',
  sku: '',
  price: '',
  compare_price: '',
  stock: '0',
  status: 'draft',
};

interface VendorProductFormProps {
  initial?: ProductFormState;
  initialImages?: UploadedImage[];
  submitLabel: string;
  onSubmit: (data: Record<string, unknown>) => Promise<unknown>;
}

export function VendorProductForm({
  initial,
  initialImages = [],
  submitLabel,
  onSubmit,
}: VendorProductFormProps) {
  const navigate = useNavigate();
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: catalogApi.categories });
  const [form, setForm] = useState<ProductFormState>(initial ?? emptyProductForm);
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      onSubmit({
        name: form.name,
        category_id: form.category_id ? Number(form.category_id) : null,
        short_description: form.short_description || null,
        description: form.description || null,
        sku: form.sku || null,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        stock: Number(form.stock),
        status: form.status,
        image_paths: images.map((img) => img.path),
      }),
    onSuccess: () => navigate('/vendor'),
    onError: (err) => setSaveError(extractApiError(err, 'Failed to save product.')),
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSaveError(null);
        save.mutate();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price (SSP)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="compare_price">Compare price</Label>
          <Input
            id="compare_price"
            type="number"
            min="0"
            step="0.01"
            value={form.compare_price}
            onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="flex h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
          >
            <option value="">Select category</option>
            {categories?.data?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
            className="flex h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="short_description">Short description</Label>
          <Input
            id="short_description"
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="flex w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Product photos</Label>
          <div className="mt-2">
            <ImageUploadField value={images} onChange={setImages} max={10} />
          </div>
        </div>
      </div>

      {saveError && <p className="text-sm text-destructive">{saveError}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate('/vendor')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
