"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Lock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ContentCardProps {
  id: string
  title: string
  description: string
  imageUrl: string
  isPremium?: boolean
  href: string
  className?: string
}

export default function ContentCard({
  id,
  title,
  description,
  imageUrl,
  isPremium = false,
  href,
  className,
}: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      className={cn(
        "bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300",
        isHovered && "shadow-xl",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          fill
          className={cn("object-cover transition-transform duration-500", isHovered && "scale-105")}
        />
        {isPremium && (
          <div className="absolute top-2 right-2 bg-rose-500 text-white px-2 py-1 rounded text-sm font-medium">
            Premium
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        <Button
          asChild
          className={cn("w-full", isPremium ? "bg-rose-500 hover:bg-rose-600" : "bg-gray-800 hover:bg-gray-900")}
        >
          <Link href={href}>
            {isPremium ? (
              <>
                <Lock className="mr-2 h-4 w-4" /> View Content
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" /> View Content
              </>
            )}
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}
