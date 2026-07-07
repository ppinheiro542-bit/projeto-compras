import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AccountDisabled({ email }: { email: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-md">
        <CardHeader className="items-center text-center">
          <ShieldAlert className="mb-2 h-10 w-10 text-destructive" />
          <CardTitle>Conta desativada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            O acesso da conta <span className="font-medium text-foreground">{email}</span> foi
            desativado por um administrador. Entre em contato com o responsável para reativá-la.
          </p>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline" className="w-full">
              Sair
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
