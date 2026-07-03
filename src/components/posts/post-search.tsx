'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PostSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue ?? '');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/dashboard/mural?q=${encodeURIComponent(q)}` : '/dashboard/mural');
  }

  function clear() {
    setValue('');
    router.push('/dashboard/mural');
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar publicações pela legenda..."
          className="pl-9"
        />
      </div>
      {defaultValue && (
        <Button type="button" variant="outline" onClick={clear}>
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      )}
      <Button type="submit">Buscar</Button>
    </form>
  );
}
