import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Phone } from 'lucide-react';
import { conversationApi } from '@/lib/marketplaceApi';
import { useAppSelector } from '@/store/hooks';
import { extractApiError } from '@/lib/apiErrors';
import { cn } from '@/lib/utils';

interface VendorContactActionsProps {
  vendorId: number;
  vendorName: string;
  contactPhone?: string | null;
  productId?: number;
  messagesPath?: string;
  className?: string;
}

export function VendorContactActions({
  vendorId,
  vendorName,
  contactPhone,
  productId,
  messagesPath = '/messages',
  className,
}: VendorContactActionsProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [startingChat, setStartingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginRedirect = () => {
    navigate('/auth/login', { state: { from: { pathname: window.location.pathname } } });
  };

  const startChat = async () => {
    if (!isAuthenticated) {
      loginRedirect();
      return;
    }

    setStartingChat(true);
    setError(null);
    try {
      const res = await conversationApi.start({
        vendor_id: vendorId,
        product_id: productId,
      });
      const id = res.data?.id;
      if (id) {
        navigate(`${messagesPath}/${id}`);
      }
    } catch (err) {
      setError(extractApiError(err, 'Could not start chat.'));
    } finally {
      setStartingChat(false);
    }
  };

  const phone = contactPhone?.replace(/\s+/g, '');
  const linkClass =
    'inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex flex-wrap items-center gap-5">
        {phone ? (
          <a href={`tel:${phone}`} className={linkClass}>
            <Phone className="h-4 w-4" />
            Call {vendorName}
          </a>
        ) : (
          <span className={cn(linkClass, 'cursor-not-allowed opacity-50')} title="Vendor phone not available">
            <Phone className="h-4 w-4" />
            Call unavailable
          </span>
        )}
        <button type="button" onClick={startChat} disabled={startingChat} className={linkClass}>
          <MessageCircle className="h-4 w-4" />
          {startingChat ? 'Opening chat…' : 'Chat with vendor'}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
