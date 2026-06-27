import { MessagesPage } from '@/features/messages/pages/MessagesPage';

export function VendorMessagesPage() {
  return (
    <MessagesPage
      basePath="/vendor/messages"
      title="Customer messages"
      description="Reply to customers asking about your products."
      perspective="vendor"
    />
  );
}
