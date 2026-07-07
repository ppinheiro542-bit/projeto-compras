import { Brand } from '@/components/layout/brand';
import { APP_VERSION } from '@/lib/version';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-muted/40 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Brand showTagline className="scale-110" />
        </div>
        {children}
      </div>
      <footer className="mt-8 text-xs font-mono text-muted-foreground">{APP_VERSION}</footer>
    </div>
  );
}
