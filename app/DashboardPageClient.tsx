'use client';

import { DynamicPage } from '@/app/utils/dynamic-page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/components/providers/AuthProvider'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Eye, 
  Clock, 
  Star, 
  Heart, 
  Image as ImageIcon, 
  Video, 
  Settings, 
  CreditCard,
  LogOut
} from 'lucide-react'
import { toast } from 'sonner'

interface Activity {
  type: 'view' | 'like' | 'comment'
  content: string
  time: string
}

export default function DashboardPageClient() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    // In a real app, fetch user activity here
    const fetchActivity = async () => {
      try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setRecentActivity([
          { type: 'view', content: 'Beach Sunset Gallery', time: '2 hours ago' },
          { type: 'like', content: 'Mountain View Video', time: '5 hours ago' },
          { type: 'comment', content: 'City Timelapse', time: '1 day ago' },
        ])
      } catch (error) {
        toast.error('Failed to load activity')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchActivity()
    }
  }, [user])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <DynamicPage>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Content Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.5h</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">+23% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+4 new this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions with content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-full">
                      {activity.type === 'view' && <Eye className="h-4 w-4" />}
                      {activity.type === 'like' && <Heart className="h-4 w-4" />}
                      {activity.type === 'comment' && <Star className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.content}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4" asChild>
                  <a href="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Profile Settings</div>
                      <div className="text-xs text-muted-foreground">Update your profile</div>
                    </div>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto py-4" asChild>
                  <a href="/subscription">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Subscription</div>
                      <div className="text-xs text-muted-foreground">Manage your plan</div>
                    </div>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto py-4" asChild>
                  <a href="/gallery">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Gallery</div>
                      <div className="text-xs text-muted-foreground">Browse content</div>
                    </div>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto py-4" asChild>
                  <a href="/exclusive">
                    <Video className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Exclusive</div>
                      <div className="text-xs text-muted-foreground">Premium content</div>
                    </div>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>Your current membership details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Premium Membership</p>
                  <p className="text-sm text-muted-foreground">Active until Dec 31, 2024</p>
                </div>
                <Button variant="outline" asChild>
                  <a href="/subscription">Manage Subscription</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DynamicPage>
  )
} 