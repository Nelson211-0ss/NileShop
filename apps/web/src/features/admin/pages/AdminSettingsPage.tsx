import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Settings as SettingsIcon } from 'lucide-react';
import { adminApi } from '@/lib/marketplaceApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';

export function AdminSettingsPage() {
  const { data } = useQuery({ queryKey: ['admin-settings'], queryFn: adminApi.settings });
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const groups = data?.data ?? {};

  useEffect(() => {
    const flat: Record<string, string> = {};
    for (const group of Object.values(groups)) {
      for (const [key, value] of Object.entries(group)) {
        flat[key] = value ?? '';
      }
    }
    setValues(flat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => adminApi.updateSettings(values),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const groupEntries = Object.entries(groups);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Site-wide configuration values."
        actions={
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        }
      />

      {groupEntries.length === 0 ? (
        <EmptyState icon={SettingsIcon} title="No settings configured" />
      ) : (
        <div className="space-y-6">
          {groupEntries.map(([groupName, group]) => (
            <Card key={groupName}>
              <CardHeader>
                <CardTitle className="text-base capitalize">{groupName.replace(/_/g, ' ')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(group).map((key) => (
                  <div key={key}>
                    <label className="mb-1.5 block text-sm font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <Input
                      value={values[key] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
