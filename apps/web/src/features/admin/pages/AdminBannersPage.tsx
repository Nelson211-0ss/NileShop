import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import type { Banner } from '@nileshop/types';
import { adminApi, uploadApi } from '@/lib/marketplaceApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';

type BannerFormState = {
  title: string;
  image: string;
  link: string;
  position: string;
  sort_order: number;
  is_active: boolean;
};

const EMPTY_FORM: BannerFormState = {
  title: '',
  image: '',
  link: '',
  position: 'home',
  sort_order: 0,
  is_active: true,
};

export function AdminBannersPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-banners'], queryFn: adminApi.banners.list });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerFormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  const banners = data?.data ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-banners'] });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing ? adminApi.banners.update(editing.id, form) : adminApi.banners.create(form),
    onSuccess: () => {
      invalidate();
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.banners.delete(id),
    onSuccess: invalidate,
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      image: banner.image,
      link: banner.link ?? '',
      position: banner.position,
      sort_order: banner.sort_order,
      is_active: banner.is_active,
    });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('images[]', file);
      const res = await uploadApi.images(formData);
      const uploaded = res.data?.[0];
      if (uploaded) setForm((f) => ({ ...f, image: uploaded.url }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Banners"
        description="Manage the promotional banners shown on the storefront."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New banner
          </Button>
        }
      />

      <DashboardSection title={`${banners.length} banners`}>
        {banners.length === 0 ? (
          <EmptyState icon={ImageIcon} title="No banners yet" action={<Button size="sm" onClick={openCreate}>Add banner</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Banner</th>
                  <th className="pb-3 font-medium">Position</th>
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Active</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {banners.map((banner) => (
                  <tr key={banner.id}>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => openEdit(banner)}
                        className="flex items-center gap-3 text-left"
                      >
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="h-10 w-16 shrink-0 rounded-md border border-border object-cover"
                        />
                        <span className="font-medium">{banner.title}</span>
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{banner.position}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{banner.sort_order}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                          banner.is_active
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-border bg-muted text-muted-foreground'
                        }`}
                      >
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(banner.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit banner' : 'New banner'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Image</label>
              {form.image && (
                <img src={form.image} alt="" className="mb-2 h-24 w-full rounded-md border border-border object-cover" />
              )}
              <Input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Link</label>
              <Input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="/products" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Position</label>
                <Input value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Sort order</label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              Active
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!form.title || !form.image || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {editing ? 'Save changes' : 'Create banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
