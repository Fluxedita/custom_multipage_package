"use client"
import { useEffect, useState, useRef } from "react"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HeroSectionResponsive } from '../custom_pages/components/sections/HeroSectionResponsive';
import { defaultTextStyle } from '../custom_pages/components/sections/TextStyleEditor';
import type { HeroSectionResponsiveType } from '../custom_pages/types/sections';

// Define the testimonials outside the component
const testimonials = [
  {
    id: 1,
    name: "DevDan",
    text: "Fluxedita saves me hours. I can make client site updates live, right in the browser — no more code pushes for tiny changes.",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    initials: "DD",
    rating: 5,
    tier: "Advanced",
  },
  {
    id: 2,
    name: "CreateWithCasey",
    text: "I'm not a coder, but I built my own multi-page site with Fluxedita. The layout tools are incredibly easy to use!",
    avatar: "https://randomuser.me/api/portraits/women/34.jpg",
    initials: "CW",
    rating: 5,
    tier: "Standard",
  },
  {
    id: 3,
    name: "PixelMark",
    text: "The modular section editor is a dream. I can add Hero, Slider, Feature sections and see updates instantly — brilliant UX.",
    avatar: "https://randomuser.me/api/portraits/men/56.jpg",
    initials: "PM",
    rating: 5,
    tier: "Premium",
  },
  {
    id: 4,
    name: "LanaLive",
    text: "The media set galleries are stunning and super easy to manage. Behind-the-scenes content feels premium and exclusive.",
    avatar: "https://randomuser.me/api/portraits/women/78.jpg",
    initials: "LL",
    rating: 5,
    tier: "Premium",
  },
  {
    id: 5,
    name: "TinkerTom",
    text: "The live editing is so smooth — it feels like designing a site in Figma, but it’s real and live. This changes everything.",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    initials: "TT",
    rating: 5,
    tier: "Advanced",
  },
  {
    id: 6,
    name: "StartFresh",
    text: "I had no idea building a website could feel this empowering. I don’t touch code, but I control everything on my site.",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    initials: "SF",
    rating: 5,
    tier: "Standard",
  },
  {
    id: 7,
    name: "AriaSites",
    text: "The Supabase and Stripe integrations were plug-and-play. I was selling content in a day — and editing the layout on the fly.",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    initials: "AS",
    rating: 5,
    tier: "Premium",
  },
  {
    id: 8,
    name: "CodeCraft",
    text: "Fluxedita blends developer flexibility with no-code simplicity. It’s built on tech I trust: Next.js, Tailwind, Framer. Love it.",
    avatar: "https://randomuser.me/api/portraits/women/89.jpg",
    initials: "CC",
    rating: 5,
    tier: "Advanced",
  },
  {
    id: 9,
    name: "MiaMotions",
    text: "I built a gorgeous portfolio with zero technical knowledge. The page editor made me feel like a designer — and I’m hooked.",
    avatar: "https://randomuser.me/api/portraits/men/31.jpg",
    initials: "MM",
    rating: 5,
    tier: "Standard",
  },
  {
    id: 10,
    name: "GeniusGrid",
    text: "Finally, a site builder that doesn’t treat me like a child. Professional tools, slick design — and freedom. 10/10.",
    avatar: "https://randomuser.me/api/portraits/women/58.jpg",
    initials: "GG",
    rating: 5,
    tier: "Premium",
  },
]

const defaultHeroSection: HeroSectionResponsiveType = {
  id: 'members-hero',
  type: 'hero-responsive',
  visible: true,
  enableSpeech: false,
  title: 'Welcome to the Members Community',
  description: 'Join a vibrant group of creators, developers, and fans. Enjoy exclusive content, live updates, and a supportive network.',
  buttonText: 'Join Now',
  buttonUrl: '/signup',
  backgroundMedia: 'https://res.cloudinary.com/dv9g1csum/image/upload/v1751700903/cld-sample-4.jpg',
  mediaType: 'image',
  objectFit: 'cover',
  objectPosition: 'center',
  overlayColor: 'rgba(0,0,0,0.4)',
  textVerticalAlign: 'middle',
  textHorizontalAlign: 'center',
  height: '50vh',
  enableTitleSpeech: false,
  enableDescriptionSpeech: false,
  titleTextStyle: {
    ...defaultTextStyle,
    fontColor: '#FFFFFF',
    fontSize: '3rem',
    textOutline: {
      ...defaultTextStyle.textOutline,
      width: '0',
    },
    textBackground: {
      ...defaultTextStyle.textBackground,
      opacity: 1,
    },
  },
  descriptionTextStyle: {
    ...defaultTextStyle,
    fontColor: '#FFFFFF',
    fontSize: '1.75rem',
    textBackground: {
      ...defaultTextStyle.textBackground,
      opacity: 1,
    },
  },
};

// Create a client component for the testimonials carousel
function TestimonialsCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="relative w-full overflow-hidden py-6">
      {/* Gradient overlays for smooth fade effect */}
      <div className="absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white to-transparent"></div>
      <div className="absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent"></div>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
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
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
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
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
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

// Create a client wrapper component
export function MembersPageClient() {
  return (
    <>
      {/* Hero Section */}
      <HeroSectionResponsive
        section={defaultHeroSection}
        isEditMode={false}
        onSectionChangeAction={() => {}}
        speakTextAction={() => {}}
        isDirty={false}
      />
      {/* Testimonials */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-center mb-8">What My Members Say</h2>
        <TestimonialsCarousel />
      </div>
    </>
  )
}
