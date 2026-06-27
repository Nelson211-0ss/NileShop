import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { conversationApi } from '@/lib/marketplaceApi';
import { ChatThread } from '@/components/chat/ChatThread';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { cn } from '@/lib/utils';

interface MessagesPageProps {
  basePath?: string;
  title?: string;
  description?: string;
  perspective?: 'customer' | 'vendor';
}

export function MessagesPage({
  basePath = '/messages',
  title = 'Messages',
  description = 'Chat with vendors about products and orders.',
  perspective = 'customer',
}: MessagesPageProps) {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const activeId = id ? Number(id) : null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['conversations', perspective],
    queryFn: () =>
      perspective === 'vendor' ? conversationApi.vendorList() : conversationApi.list('customer'),
    refetchInterval: 10000,
  });

  const conversations = Array.isArray(data?.data) ? data.data : [];
  const active = conversations.find((c) => c.id === activeId);

  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Conversations</p>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading…</p>
            ) : isError ? (
              <p className="p-4 text-sm text-destructive">Could not load conversations. Try signing in again.</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                {perspective === 'vendor'
                  ? 'No customer messages yet. When buyers contact you from a product page, conversations will appear here.'
                  : 'No conversations yet. Start one from a product page using "Chat with vendor".'}
              </p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => navigate(`${basePath}/${conversation.id}`)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/40',
                    activeId === conversation.id && 'bg-primary/5',
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{conversation.peer_name}</p>
                      {conversation.unread_count > 0 && (
                        <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    {conversation.product && (
                      <p className="truncate text-xs text-muted-foreground">{conversation.product.name}</p>
                    )}
                    {conversation.last_message && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {conversation.last_message.body}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div>
          {activeId && active ? (
            <ChatThread
              conversationId={active.id}
              peerName={active.peer_name ?? 'Conversation'}
              productName={active.product?.name}
            />
          ) : activeId ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              Conversation not found.
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 text-center">
              <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Choose a chat from the list, or{' '}
                <Link to="/products" className="text-primary hover:underline">
                  browse products
                </Link>{' '}
                to message a vendor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
