'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchParamsProviderProps {
  children: (searchParams: ReturnType<typeof useSearchParams>) => React.ReactNode;
}

export default function SearchParamsProvider({ children }: SearchParamsProviderProps) {
  const searchParams = useSearchParams();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children(searchParams)}
    </Suspense>
  );
} 