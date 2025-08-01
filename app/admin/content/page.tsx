'use client'

import { DynamicPage } from '@/app/utils/dynamic-page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MediaLibrary from '@/components/media/MediaLibrary'

export default function ContentPage() {
  return (
    <DynamicPage>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Content Management</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Content</CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">156</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Published</CardTitle>
              <CardDescription>Current status</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">89</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Views</CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">45,678</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>Manage your media content across all types</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <MediaLibrary
              onSelectAction={(url, type, dimensions) => {
                // Handle media selection - you can customize this action
                console.log('Selected media:', { url, type, dimensions });
              }}
              type="all"
              isDialog={false}
            />
          </CardContent>
        </Card>
      </div>
    </DynamicPage>
  )
}


