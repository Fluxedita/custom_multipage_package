import { Suspense } from 'react';
import CustomPageClient from './CustomPageClient';

export default function CustomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomPageClient />
    </Suspense>
  );
}
