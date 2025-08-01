"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30days")

  // In a real application, this data would come from your backend
  const visitorData = [
    { name: "Jan", visitors: 4000, pageViews: 2400 },
    { name: "Feb", visitors: 3000, pageViews: 1398 },
    { name: "Mar", visitors: 2000, pageViews: 9800 },
    { name: "Apr", visitors: 2780, pageViews: 3908 },
    { name: "May", visitors: 1890, pageViews: 4800 },
    { name: "Jun", visitors: 2390, pageViews: 3800 },
    { name: "Jul", visitors: 3490, pageViews: 4300 },
  ]

  const contentPerformanceData = [
    { name: "Beach Sunset", views: 4000, likes: 2400, comments: 240 },
    { name: "Mountain View", views: 3000, likes: 1398, comments: 139 },
    { name: "City Timelapse", views: 2000, likes: 9800, comments: 980 },
    { name: "Ocean Waves", views: 2780, likes: 3908, comments: 390 },
    { name: "Forest Walk", views: 1890, likes: 4800, comments: 480 },
  ]

  const deviceData = [
    { name: "Desktop", value: 40 },
    { name: "Mobile", value: 45 },
    { name: "Tablet", value: 15 },
  ]

  const locationData = [
    { name: "United States", value: 35 },
    { name: "United Kingdom", value: 20 },
    { name: "Canada", value: 15 },
    { name: "Australia", value: 10 },
    { name: "Germany", value: 8 },
    { name: "Other", value: 12 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitors & Page Views</CardTitle>
            <CardDescription>Track your site traffic over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={visitorData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="visitors" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="pageViews" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Performance</CardTitle>
            <CardDescription>See which content performs best</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={contentPerformanceData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#8884d8" />
                  <Bar dataKey="likes" fill="#82ca9d" />
                  <Bar dataKey="comments" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Audience</CardTitle>
            <CardDescription>Understand your audience demographics</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="devices">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
              </TabsList>
              <TabsContent value="devices" className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deviceData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="locations" className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={locationData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Track user engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: "Jan", engagement: 65 },
                    { name: "Feb", engagement: 72 },
                    { name: "Mar", engagement: 78 },
                    { name: "Apr", engagement: 85 },
                    { name: "May", engagement: 82 },
                    { name: "Jun", engagement: 88 },
                    { name: "Jul", engagement: 91 },
                  ]}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="engagement" stroke="#ff49db" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
