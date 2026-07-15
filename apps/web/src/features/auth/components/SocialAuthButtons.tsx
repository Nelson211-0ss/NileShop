import type { SVGProps } from 'react';
import { API_URL } from '@/lib/api';

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.42-.22-2.05H12v3.72h6.53c-.13 1.06-.85 2.66-2.44 3.73l-.02.15 3.55 2.72.25.02c2.26-2.06 3.65-5.1 3.65-8.29z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.06 7.93-2.87l-3.78-2.9c-1.02.7-2.4 1.19-4.15 1.19-3.18 0-5.88-2.09-6.84-4.96l-.14.01-3.7 2.83-.05.13C3.28 21.3 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.16 14.46A7.24 7.24 0 0 1 4.75 12c0-.86.15-1.7.4-2.46l-.01-.16-3.75-2.87-.12.06A11.94 11.94 0 0 0 0 12c0 1.93.47 3.76 1.27 5.43l3.89-2.97z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c2.25 0 3.77.96 4.64 1.77l3.39-3.28C17.94 1.19 15.24 0 12 0 7.34 0 3.28 2.7 1.27 6.57l3.88 2.97C6.12 6.66 8.82 4.75 12 4.75z"
      />
    </svg>
  );
}

function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden {...props}>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

interface SocialAuthButtonsProps {
  className?: string;
}

export function SocialAuthButtons({ className }: SocialAuthButtonsProps) {
  const startOAuth = (provider: 'google' | 'apple') => {
    window.location.href = `${API_URL}/auth/${provider}/redirect`;
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => startOAuth('google')}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-muted/70 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <GoogleIcon />
          Google
        </button>
        <button
          type="button"
          onClick={() => startOAuth('apple')}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-muted/70 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <AppleIcon />
          Apple
        </button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Or continue with email
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
