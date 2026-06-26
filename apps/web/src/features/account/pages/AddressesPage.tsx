import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressApi } from '@/lib/marketplaceApi';
import type { Address } from '@nileshop/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="page-container py-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Addresses</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'Add address'}</Button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); create.mutate(); }}
          className="rounded-xl border border-border p-4 mb-4 space-y-3"
        >
          {(['label', 'full_name', 'phone', 'address_line_1', 'city', 'country'] as const).map((field) => (
            <div key={field}>
              <Label className="capitalize">{field.replace('_', ' ')}</Label>
              <Input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
            Set as default
          </label>
          <Button type="submit" disabled={create.isPending}>Save address</Button>
        </form>
      )}

      {isLoading ? (
        <div className="h-24 rounded-lg bg-muted animate-pulse" />
      ) : addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved addresses.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr: Address) => (
            <div key={addr.id} className="rounded-lg border border-border p-4 flex justify-between gap-3">
              <div>
                <p className="font-medium text-sm">{addr.label} {addr.is_default && <span className="text-primary text-xs">(Default)</span>}</p>
                <p className="text-sm text-muted-foreground mt-1">{addr.full_name} · {addr.phone}</p>
                <p className="text-sm">{addr.address_line_1}, {addr.city}, {addr.country}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => remove.mutate(addr.id)}>Delete</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
