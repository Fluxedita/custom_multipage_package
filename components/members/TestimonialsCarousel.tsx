"use client"

import { useEffect, useState, useRef } from "react"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Testimonial {
  id: number
  name: string
  text: string
  avatar: string
  initials: string
  rating: number
  tier: string
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [avatarsLoaded, setAvatarsLoaded] = useState<Record<number, boolean>>({})

  // Track which avatars have loaded successfully
  const handleAvatarLoad = (id: number) => {
    setAvatarsLoaded((prev) => ({
      ...prev,
      [id]: true,
    }))
  }

  // Handle avatar loading errors
  const handleAvatarError = (id: number) => {
    setAvatarsLoaded((prev) => ({
      ...prev,
      [id]: false,
    }))
  }

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const totalWidth = scrollContainer.scrollWidth
    const visibleWidth = scrollContainer.clientWidth

    // Only start auto-scrolling if there's content to scroll
    if (totalWidth <= visibleWidth) return

    const scrollInterval = setInterval(() => {
      setScrollPosition((prevPosition) => {
        const newPosition = prevPosition + 1

        // Reset to beginning when we've scrolled through all testimonials
        if (newPosition > totalWidth - visibleWidth) {
          return 0
        }

        return newPosition
      })
    }, 30) // Adjust speed as needed

    return () => clearInterval(scrollInterval)
  }, [])

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollPosition
    }
  }, [scrollPosition])

  // Pause scrolling when hovering over the carousel
  const handleMouseEnter = () => {
    // Clear any existing interval
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollBehavior = "auto"
    }
  }

  const handleMouseLeave = () => {
    // Resume smooth scrolling
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollBehavior = "smooth"
    }
  }

  return (
    <div className="relative w-full overflow-hidden py-6">
      {/* Gradient overlays for smooth fade effect */}
      <div className="absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white to-transparent"></div>
      <div className="absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent"></div>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="flex-shrink-0 w-80">
            <Card className="h-full border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-3 border-2 border-pink-100">
                    <AvatarImage
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      onLoad={() => handleAvatarLoad(testimonial.id)}
                      onError={() => handleAvatarError(testimonial.id)}
                      className="object-cover"
                    />
                    <AvatarFallback>{testimonial.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.tier} Member</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Duplicate the first few testimonials to create a seamless loop effect */}
        {testimonials.slice(0, 3).map((testimonial) => (
          <div key={`duplicate-${testimonial.id}`} className="flex-shrink-0 w-80">
            <Card className="h-full border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-3 border-2 border-pink-100">
                    <AvatarImage
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="object-cover"
                    />
                    <AvatarFallback>{testimonial.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.tier} Member</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
