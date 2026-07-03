import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse o sistema com suas credenciais.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        <div className="flex flex-col gap-2 text-center text-sm">
          <Link href="/forgot-password" className="text-muted-foreground hover:underline">
            Esqueceu sua senha?
          </Link>
          <span className="text-muted-foreground">
            Não possui conta?{' '}
            <Link href="/register" className="font-medium text-foreground underline">
              Cadastre-se
            </Link>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
