'use client';

import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface PaddleContextValue {
  paddle: Paddle | null;
  isReady: boolean;
}

const PaddleContext = createContext<PaddleContextValue>({
  paddle: null,
  isReady: false,
});

export function PaddleProvider({ children }: { children: React.ReactNode }) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;

    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
      ? 'production'
      : 'sandbox';

    initializePaddle({
      token,
      environment: environment as 'sandbox' | 'production',
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
        setIsReady(true);
      }
    });
  }, []);

  return (
    <PaddleContext.Provider value={{ paddle, isReady }}>
      {children}
    </PaddleContext.Provider>
  );
}

export function usePaddle() {
  return useContext(PaddleContext);
}
