import { Suspense } from 'react';
import { MembersPageClient } from './MembersPageClient';

export default function MembersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MembersPageClient />
    </Suspense>
  );
}
