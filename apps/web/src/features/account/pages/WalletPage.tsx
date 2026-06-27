import { useQuery } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';
import { walletApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { PageHeader } from '@/components/dashboard/PageHeader';

export function WalletPage() {
  const { data, isLoading } = useQuery({ queryKey: ['wallet'], queryFn: walletApi.get });
  const wallet = data?.data;

  return (
    <>
      <PageHeader title="Wallet" description="View your balance and use it for faster checkout." />

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
      ) : wallet ? (
        <div className="space-y-2">
          <p className="text-3xl font-semibold">{formatCurrency(wallet.balance, wallet.currency)}</p>
          <p className="text-sm text-muted-foreground">
            Applied automatically when you choose wallet payment at checkout.
          </p>
        </div>
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
