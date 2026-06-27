import { useQuery } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';
import { walletApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';

export function WalletPage() {
  const { data, isLoading } = useQuery({ queryKey: ['wallet'], queryFn: walletApi.get });
  const wallet = data?.data;

  return (
    <>
      <PageHeader
        title="Wallet"
        description="View your balance and use it for faster checkout."
      />

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      ) : wallet ? (
        <>
          <StatCard
            label="Available balance"
            value={formatCurrency(wallet.balance, wallet.currency)}
            icon={Wallet}
            className="mb-6"
          />
          <Card className="rounded-xl shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Your wallet balance is applied automatically when you choose wallet payment at checkout.
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={Wallet}
          title="Wallet unavailable"
          description="We could not load your wallet right now. Please try again later."
        />
      )}
    </>
  );
}
