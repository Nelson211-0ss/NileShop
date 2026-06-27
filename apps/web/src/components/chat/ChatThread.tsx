import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import type { ChatMessage } from '@nileshop/types';
import { conversationApi } from '@/lib/marketplaceApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { extractApiError } from '@/lib/apiErrors';
import { cn } from '@/lib/utils';

interface ChatThreadProps {
  conversationId: number;
  peerName: string;
  productName?: string | null;
}

export function ChatThread({ conversationId, peerName, productName }: ChatThreadProps) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => conversationApi.get(conversationId),
    refetchInterval: 4000,
  });

  const messages = data?.data?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, conversationId]);

  const send = useMutation({
    mutationFn: (body: string) => conversationApi.send(conversationId, body),
    onSuccess: () => {
      setDraft('');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-conversations'] });
    },
    onError: (err) => setError(extractApiError(err, 'Failed to send message.')),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || send.isPending) return;
    send.mutate(body);
  };

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <p className="font-semibold">{peerName}</p>
        {productName && <p className="text-xs text-muted-foreground">About: {productName}</p>}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet. Say hello to start the conversation.</p>
        ) : (
          messages.map((message: ChatMessage) => (
            <div
              key={message.id}
              className={cn('flex', message.is_mine ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                  message.is_mine
                    ? 'rounded-br-md bg-primary text-primary-foreground'
                    : 'rounded-bl-md bg-muted text-foreground',
                )}
              >
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <p
                  className={cn(
                    'mt-1 text-[10px]',
                    message.is_mine ? 'text-primary-foreground/70' : 'text-muted-foreground',
                  )}
                >
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-3">
        {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your message…"
            maxLength={2000}
            disabled={send.isPending}
          />
          <Button type="submit" size="icon" disabled={!draft.trim() || send.isPending} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
