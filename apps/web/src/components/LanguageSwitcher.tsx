import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className={cn('gap-1.5 text-xs font-medium transition-transform hover:scale-105 active:scale-95', className)}
    >
      <Globe className="h-4 w-4" />
      {i18n.language === 'ar' ? 'EN' : 'عربي'}
    </Button>
  );
}
