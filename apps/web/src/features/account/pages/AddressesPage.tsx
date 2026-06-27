import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { addressApi } from '@/lib/marketplaceApi';
import type { Address } from '@nileshop/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState, ListRow, ListShell } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const emptyForm = {
  label: 'Home',
  full_name: '',
  phone: '',
  address_line_1: '',
  city: 'Juba',
  country: 'South Sudan',
  is_default: false,
};

export function AddressesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['addresses'], queryFn: addressApi.list });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const create = useMutation({
    mutationFn: () => addressApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowForm(false);
      setForm(emptyForm);
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => addressApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const addresses = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Addresses"
        description="Save delivery addresses for faster checkout."
        actions={
          <Button size="sm" variant="ghost" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : 'Add address'}
          </Button>
        }
      />

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
          className="mb-8 space-y-3"
        >
          {(['label', 'full_name', 'phone', 'address_line_1', 'city', 'country'] as const).map((field) => (
            <div key={field}>
              <Label className="capitalize">{field.replace('_', ' ')}</Label>
              <Input
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
              />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
            />
            Set as default
          </label>
          <Button type="submit" disabled={create.isPending}>
            Save address
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add an address to speed up checkout."
          action={
            <Button size="sm" onClick={() => setShowForm(true)}>
              Add address
            </Button>
          }
        />
      ) : (
        <ListShell>
          {addresses.map((addr: Address) => (
            <ListRow key={addr.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{addr.label}</p>
                    {addr.is_default && <StatusBadge status="default" />}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {addr.full_name} · {addr.phone}
                  </p>
                  <p className="text-sm">
                    {addr.address_line_1}, {addr.city}, {addr.country}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(addr.id)}>
                  Delete
                </Button>
              </div>
            </ListRow>
          ))}
        </ListShell>
      )}
    </>
  );
}
