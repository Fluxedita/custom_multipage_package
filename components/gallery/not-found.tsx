import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GalleryNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Content Not Found</h1>
      <p className="text-gray-600 mb-8">Sorry, the content you're looking for doesn't exist or has been removed.</p>
      <Button asChild>
        <Link href="/gallery">Return to Gallery</Link>
      </Button>
    </div>
  )
}
