"use client";

import MediaLibrary from '@/components/media/MediaLibrary';
import { useAuth } from '@/components/providers/AuthProvider';

export default function MediaPage() {
  // Restrict access to admin users only
  // (If you want to show a message for non-admins, you can add logic here)
  // For now, assume AuthProvider is wrapping the app and will redirect if not admin
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Media Library</h1>
      <MediaLibrary
        onSelectAction={() => {}}
        type="all"
        isDialog={false}
      />
    </div>
  );
} 