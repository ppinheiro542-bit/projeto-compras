import { APP_VERSION } from '@/lib/version';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">{children}</div>
      <footer className="mt-8 text-xs font-mono text-muted-foreground">{APP_VERSION}</footer>
    </div>
  );
}
