import { Button } from '@/components/ui/button';

const APPROVAL_MESSAGE = 'Your store must be approved by an admin before you can add products. You will be notified once your store is approved.';

export function VendorApprovalDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vendor-approval-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
      >
        <h2 id="vendor-approval-title" className="text-lg font-bold">Store approval required</h2>
        <p className="mt-3 text-sm text-muted-foreground">{APPROVAL_MESSAGE}</p>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>OK</Button>
        </div>
      </div>
    </div>
  );
}

export const VENDOR_APPROVAL_MESSAGE = APPROVAL_MESSAGE;
