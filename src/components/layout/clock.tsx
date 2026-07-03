'use client';

import { useEffect, useState } from 'react';

export function Clock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('pt-BR', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono tabular-nums text-xs text-muted-foreground">
      {time || '--:--:--'}
    </span>
  );
}
