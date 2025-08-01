"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import Image from "next/image"

interface SampleImagesProps {
  onSelect: (url: string) => void
  type?: "profile" | "background" | "gallery"
}

export default function SampleImages({ onSelect, type = "gallery" }: SampleImagesProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sampleImages = {
    profile: [
      {
        url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        alt: "Professional headshot of a woman with red hair",
      },
      {
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        alt: "Portrait of a woman with colorful background",
      },
      {
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
        alt: "Casual portrait of a woman smiling",
      },
    ],
    background: [
      {
        url: "https://images.unsplash.com/photo-1516542076529-1ea3854896f2",
        alt: "Photography equipment on a desk",
      },
      {
        url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
        alt: "Camera lens close-up",
      },
      {
        url: "https://images.unsplash.com/photo-1500051638674-ff996a0ec29e",
        alt: "Photography studio setup",
      },
    ],
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1469594292607-7bd90f8d3ba4",
        alt: "Scenic mountain landscape",
      },
      {
        url: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843",
        alt: "Lake with mountains in background",
      },
      {
        url: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c",
        alt: "Sunset over water",
      },
      {
        url: "https://images.unsplash.com/photo-1611042553484-d61f84d22784",
        alt: "Fashion photography",
      },
      {
        url: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21",
        alt: "Fashion model in studio",
      },
      {
        url: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
        alt: "Street fashion photography",
      },
    ],
  }

  const images = sampleImages[type]

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        Browse Sample Images
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Sample Image</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-md overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  onSelect(image.url)
                  setIsOpen(false)
                }}
              >
                <Image src={image.url || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
