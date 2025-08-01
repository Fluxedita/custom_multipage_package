"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

export function ContentOverview() {
  // In a real application, this data would come from your backend
  const contentData = [
    { name: "Images", value: 124, color: "#ff49db" },
    { name: "Videos", value: 308, color: "#0070f3" },
    { name: "Premium", value: 187, color: "#8e44ad" },
    { name: "Free", value: 245, color: "#27ae60" },
  ]

  const categoryData = [
    { name: "Portraits", value: 85, color: "#ff49db" },
    { name: "Landscapes", value: 64, color: "#0070f3" },
    { name: "Fashion", value: 120, color: "#8e44ad" },
    { name: "Events", value: 163, color: "#27ae60" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Overview</CardTitle>
        <CardDescription>Breakdown of your content by type and category</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="type">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="type">By Type</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
          </TabsList>
          <TabsContent value="type" className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {contentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="category" className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
