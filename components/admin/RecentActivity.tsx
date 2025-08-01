"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentActivity() {
  // In a real application, this data would come from your backend
  const activities = [
    {
      user: {
        name: "John Doe",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "JD",
      },
      action: "subscribed to Premium",
      time: "2 hours ago",
    },
    {
      user: {
        name: "Alice Smith",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AS",
      },
      action: "commented on 'Summer Vibes'",
      time: "5 hours ago",
    },
    {
      user: {
        name: "Robert Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "RJ",
      },
      action: "liked 'Beach Sunset Collection'",
      time: "1 day ago",
    },
    {
      user: {
        name: "Emily Davis",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "ED",
      },
      action: "subscribed to Premium",
      time: "2 days ago",
    },
    {
      user: {
        name: "Michael Wilson",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "MW",
      },
      action: "commented on 'City Lights'",
      time: "3 days ago",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions from your members</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.user.name}</p>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
              </div>
              <div className="text-xs text-muted-foreground">{activity.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
