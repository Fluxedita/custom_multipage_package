"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ImageIcon, Eye, DollarSign } from "lucide-react"

export function DashboardStats() {
  // In a real application, these would be fetched from your backend
  const stats = [
    {
      title: "Total Members",
      value: "2,853",
      description: "+12% from last month",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Content Items",
      value: "432",
      description: "124 images, 308 videos",
      icon: ImageIcon,
      color: "text-pink-500",
    },
    {
      title: "Total Views",
      value: "1.2M",
      description: "+18% from last month",
      icon: Eye,
      color: "text-green-500",
    },
    {
      title: "Revenue",
      value: "$48,294",
      description: "+7% from last month",
      icon: DollarSign,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
