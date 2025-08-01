"use client"

import { useState } from "react"
import { useForm, SubmitHandler, useFormContext } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

const generalFormSchema = z.object({
  siteName: z.string().min(1, {
    message: "Site name is required.",
  }),
  siteDescription: z.string().min(10, {
    message: "Site description must be at least 10 characters.",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  footerText: z.string(),
}).strict()

const featuresFormSchema = z.object({
  enableComments: z.boolean(),
  enableMemberRegistration: z.boolean(),
  enableContentRating: z.boolean(),
  enableDarkMode: z.boolean(),
  enableSocialSharing: z.boolean(),
}).strict()

type FeaturesFormInput = z.infer<typeof featuresFormSchema>
const defaultFeatures: FeaturesFormInput = {
  enableComments: true,
  enableMemberRegistration: true,
  enableContentRating: true,
  enableDarkMode: true,
  enableSocialSharing: true,
}

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  newMemberNotifications: z.boolean(),
  commentNotifications: z.boolean(),
}).strict()

type NotificationsFormInput = z.infer<typeof notificationsFormSchema>
const defaultNotifications: NotificationsFormInput = {
  emailNotifications: true,
  newMemberNotifications: true,
  commentNotifications: true,
}

type GeneralFormValues = z.infer<typeof generalFormSchema>

export function SettingsManager() {
  const [activeTab, setActiveTab] = useState("general")

  // General settings form
  const generalForm = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      siteName: "admin's Portfolio",
      siteDescription: "A showcase of my creative work and premium content for subscribers.",
      contactEmail: "jamescroanin@gmail.com",
      footerText: "© 2023 admin's Portfolio. All rights reserved.",
    },
  })

  // Features settings form
  const featuresForm = useForm<FeaturesFormInput>({
    resolver: zodResolver(featuresFormSchema) as any,
    defaultValues: defaultFeatures,
  })

  // Notifications settings form
  const notificationsForm = useForm<NotificationsFormInput>({
    resolver: zodResolver(notificationsFormSchema) as any,
    defaultValues: defaultNotifications,
  })

  function onGeneralSubmit(data: GeneralFormValues) {
    // In a real application, you would save these settings to your backend
    console.log("General settings:", data)
    toast({
      title: "General settings updated",
      description: "Your general settings have been saved successfully.",
    })
  }

  const onFeaturesSubmit: SubmitHandler<z.infer<typeof featuresFormSchema>> = (data) => {
    // In a real application, you would save these settings to your backend
    console.log("Features settings:", data)
    toast({
      title: "Features settings updated",
      description: "Your features settings have been saved successfully.",
    })
  }

  const onNotificationsSubmit: SubmitHandler<z.infer<typeof notificationsFormSchema>> = (data) => {
    // In a real application, you would save these settings to your backend
    console.log("Notifications settings:", data)
    toast({
      title: "Notifications settings updated",
      description: "Your notifications settings have been saved successfully.",
    })
  }

  return (
    <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage your site's basic information</CardDescription>
          </CardHeader>
          <Form {...generalForm}>
            <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={generalForm.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>This is the name that will be displayed on your site.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generalForm.control}
                  name="siteDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter a description for your site" className="resize-none" />
                      </FormControl>
                      <FormDescription>
                        This description will be used for SEO and may appear in search results.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generalForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormDescription>This email will be used for contact forms and notifications.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generalForm.control}
                  name="footerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer Text</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>This text will appear in the footer of your site.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit">Save General Settings</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>

      <TabsContent value="features">
        <Card>
          <CardHeader>
            <CardTitle>Features Settings</CardTitle>
            <CardDescription>Enable or disable site features</CardDescription>
          </CardHeader>
          <Form {...featuresForm}>
            <form onSubmit={featuresForm.handleSubmit(onFeaturesSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={featuresForm.control}
                  name="enableComments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Comments</FormLabel>
                        <FormDescription>Allow members to comment on your content.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={featuresForm.control}
                  name="enableMemberRegistration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Member Registration</FormLabel>
                        <FormDescription>Allow new users to register on your site.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={featuresForm.control}
                  name="enableContentRating"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Content Rating</FormLabel>
                        <FormDescription>Allow members to rate your content.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={featuresForm.control}
                  name="enableDarkMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Dark Mode</FormLabel>
                        <FormDescription>Allow users to switch between light and dark mode.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={featuresForm.control}
                  name="enableSocialSharing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Social Sharing</FormLabel>
                        <FormDescription>Allow users to share your content on social media.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Features Settings</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications Settings</CardTitle>
            <CardDescription>Manage your email and system notifications</CardDescription>
          </CardHeader>
          <Form {...notificationsForm}>
            <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={notificationsForm.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>Receive notifications via email.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={notificationsForm.control}
                  name="newMemberNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">New Member Notifications</FormLabel>
                        <FormDescription>Receive notifications when new members register.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={notificationsForm.control}
                  name="commentNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Comment Notifications</FormLabel>
                        <FormDescription>Receive notifications when members comment on your content.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

              </CardContent>
              <CardFooter>
                <Button type="submit">Save Notifications Settings</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
