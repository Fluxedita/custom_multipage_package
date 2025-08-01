"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Users, Image, Video, Star, Heart } from "lucide-react"

export default function ProfileStats() {
  const stats = [
    {
      icon: Camera,
      value: "5+",
      label: "Years Creating",
      description: "Professional content creation",
      color: "bg-blue-100 text-blue-700",
    },
    {
      icon: Users,
      value: "10K+",
      label: "Community",
      description: "Loyal followers and members",
      color: "bg-rose-100 text-rose-700",
    },
    {
      icon: Image,
      value: "500+",
      label: "Photos",
      description: "Professional photoshoots",
      color: "bg-purple-100 text-purple-700",
    },
    {
      icon: Video,
      value: "100+",
      label: "Videos",
      description: "Exclusive video content",
      color: "bg-amber-100 text-amber-700",
    },
    {
      icon: Star,
      value: "4.9",
      label: "Rating",
      description: "Average member rating",
      color: "bg-green-100 text-green-700",
    },
    {
      icon: Heart,
      value: "25K+",
      label: "Likes",
      description: "Across all content",
      color: "bg-red-100 text-red-700",
    },
  ]

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">By The Numbers</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          A glimpse into my content creation journey and the amazing community we've built together.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full ${stat.color} mx-auto flex items-center justify-center mb-4`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="font-medium text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.description}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
