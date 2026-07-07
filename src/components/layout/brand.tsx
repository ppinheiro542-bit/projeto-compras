import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/version';

/** Marca do sistema (ícone + nome), reutilizada na sidebar, login e cabeçalhos. */
export function Brand({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ShoppingCart className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="font-semibold tracking-tight">{APP_NAME}</div>
        {showTagline && (
          <div className="text-xs text-muted-foreground">Sistema de Gestão de Compras</div>
        )}
      </div>
    </div>
  );
}
