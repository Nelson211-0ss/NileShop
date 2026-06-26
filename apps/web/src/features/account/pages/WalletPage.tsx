import { useQuery } from '@tanstack/react-query';
import { walletApi } from '@/lib/marketplaceApi';
import { formatCurrency } from '@nileshop/utils';

export function WalletPage() {
  const { data, isLoading } = useQuery({ queryKey: ['wallet'], queryFn: walletApi.get });
  const wallet = data?.data;

  return (
    <div className="page-container py-6 max-w-lg">
      <h1 className="text-xl font-bold mb-4">My Wallet</h1>
      {isLoading ? (
        <div className="h-32 rounded-lg bg-muted animate-pulse" />
      ) : wallet ? (
        <div className="rounded-xl border border-border p-6 bg-primary/5">
          <p className="text-sm text-muted-foreground">Available balance</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(wallet.balance, wallet.currency)}</p>
          <p className="text-xs text-muted-foreground mt-4">Use your wallet balance at checkout for instant payment.</p>
        </div>
      ) : (
        <p className="text-muted-foreground">Wallet unavailable.</p>
      )}
    </div>
  );
}
