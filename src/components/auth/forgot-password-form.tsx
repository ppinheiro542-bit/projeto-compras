'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPassword } from '@/lib/actions/auth';

export function ForgotPasswordForm() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    start(async () => {
      const result = await forgotPassword(formData);
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
        toast.error(result.error);
      } else if (result?.success) {
        setMessage({ type: 'success', text: result.success });
        toast.success(result.success);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {message && (
        <p
          className={
            message.type === 'error' ? 'text-sm text-destructive' : 'text-sm text-emerald-600'
          }
        >
          {message.text}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Enviando...' : 'Enviar link de recuperação'}
      </Button>
    </form>
  );
}
