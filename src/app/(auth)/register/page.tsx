import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Preencha os dados abaixo para se cadastrar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          Já possui conta?{' '}
          <Link href="/login" className="font-medium text-foreground underline">
            Faça login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
