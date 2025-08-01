"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Instagram, Twitter, Youtube, Mail, Send, Edit, Trash2, Plus } from "lucide-react"
import { useProfileEdit } from "./ProfileEditContext"
import EditableContent from "./EditableContent"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SocialLink {
  id: string
  platform: string
  username: string
  icon: any // This would be a React component type in a real app
  url: string
  color: string
}

export default function ProfileSocial() {
  const { isEditMode, setIsDirty } = useProfileEdit()
  const [title, setTitle] = useState("Connect With Me")
  const [description, setDescription] = useState(
    "Follow me on social media for updates or subscribe to my newsletter to stay in the loop."
  )
  const [newsletterTitle, setNewsletterTitle] = useState("Subscribe to My Newsletter")
  const [newsletterDescription, setNewsletterDescription] = useState("Get updates on new content, exclusive offers, and behind-the-scenes insights delivered straight to your inbox.")
  const [newsletterDisclaimer, setNewsletterDisclaimer] = useState("By subscribing, you agree to receive email communications from me. Don't worry, I respect your privacy and will never share your information.")

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    {
      id: "1",
      platform: "Instagram",
      username: "@admin.creates",
      icon: Instagram,
      url: "https://instagram.com",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      id: "2",
      platform: "Twitter",
      username: "@admin_creates",
      icon: Twitter,
      url: "https://twitter.com",
      color: "bg-blue-500",
    },
    {
      id: "3",
      platform: "YouTube",
      username: "admin Creates",
      icon: Youtube,
      url: "https://youtube.com",
      color: "bg-red-600",
    },
  ])

  const [isEditLinkDialogOpen, setIsEditLinkDialogOpen] = useState(false)
  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false)
  const [currentLink, setCurrentLink] = useState<SocialLink | null>(null)
  const [newLink, setNewLink] = useState({
    platform: "Instagram",
    username: "",
    url: "",
  })

  const platformOptions = [
    { name: "Instagram", icon: Instagram, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { name: "Twitter", icon: Twitter, color: "bg-blue-500" },
    { name: "YouTube", icon: Youtube, color: "bg-red-600" },
    { name: "TikTok", icon: Youtube, color: "bg-black" }, // Using Youtube icon as placeholder
    { name: "Facebook", icon: Twitter, color: "bg-blue-600" }, // Using Twitter icon as placeholder
    { name: "Pinterest", icon: Instagram, color: "bg-red-500" }, // Using Instagram icon as placeholder
  ]

  const handleEditLink = (link: SocialLink) => {
    setCurrentLink(link)
    setIsEditLinkDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!currentLink) return

    setSocialLinks((prev) => prev.map((item) => (item.id === currentLink.id ? currentLink : item)))
    setIsEditLinkDialogOpen(false)
    setCurrentLink(null)
    setIsDirty(true)
  }

  const handleDeleteLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((item) => item.id !== id))
    setIsDirty(true)
  }

  const handleAddLink = () => {
    const platformInfo = platformOptions.find((p) => p.name === newLink.platform)

    if (!platformInfo) return

    const link: SocialLink = {
      id: `social-${Date.now()}`,
      platform: newLink.platform,
      username: newLink.username,
      icon: platformInfo.icon,
      url: newLink.url || `https://${newLink.platform.toLowerCase()}.com`,
      color: platformInfo.color,
    }

    setSocialLinks((prev) => [...prev, link])
    setIsAddLinkDialogOpen(false)
    setNewLink({
      platform: "Instagram",
      username: "",
      url: "",
    })
    setIsDirty(true)
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">
          <EditableContent
            profile={{ id: "social-title", full_name: title }}
            onSave={async (data) => setTitle(data.full_name)}
            isEditing={isEditMode}
            onEditToggle={() => {}}
          />
        </h2>
        <div className="text-gray-600 max-w-2xl mx-auto">
          <EditableContent
            profile={{ id: "social-description", bio: description }}
            onSave={async (data) => setDescription(data.bio)}
            isEditing={isEditMode}
            onEditToggle={() => {}}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {socialLinks.map((social, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {isEditMode ? (
                <Card className="overflow-hidden h-full relative">
                  <div className={`h-2 ${social.color}`}></div>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4`}>
                        <social.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold mb-1">{social.platform}</h3>
                      <p className="text-sm text-gray-500 mb-4">{social.username}</p>

                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleEditLink(social)}>
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDeleteLink(social.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Link href={social.url} target="_blank" rel="noopener noreferrer">
                  <Card className="overflow-hidden h-full">
                    <div className={`h-2 ${social.color}`}></div>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4`}>
                          <social.icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold mb-1">{social.platform}</h3>
                        <p className="text-sm text-gray-500 mb-4">{social.username}</p>
                        <Button variant="outline" size="sm" className="w-full">
                          Follow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </motion.div>
          ))}

          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden h-full border-dashed border-2 flex items-center justify-center p-6">
                <Button
                  variant="ghost"
                  className="flex flex-col h-full w-full gap-2 py-8"
                  onClick={() => setIsAddLinkDialogOpen(true)}
                >
                  <Plus className="h-8 w-8" />
                  <span>Add Social Link</span>
                </Button>
              </Card>
            </motion.div>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <Mail className="h-6 w-6 text-rose-500 mr-2" />
              <h3 className="text-xl font-semibold">
                {isEditMode ? (
                  <EditableContent
                    profile={{ id: "newsletter-title", full_name: newsletterTitle }}
                    onSave={async (data) => setNewsletterTitle(data.full_name)}
                    isEditing={isEditMode}
                    onEditToggle={() => {}}
                  />
                ) : (
                  "Subscribe to My Newsletter"
                )}
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              {isEditMode ? (
                <EditableContent
                  profile={{ id: "newsletter-description", bio: newsletterDescription }}
                  onSave={async (data) => setNewsletterDescription(data.bio)}
                  isEditing={isEditMode}
                  onEditToggle={() => {}}
                />
              ) : (
                "Get updates on new content, exclusive offers, and behind-the-scenes insights delivered straight to your inbox."
              )}
            </p>

            <form className="space-y-4">
              <div>
                <Input type="text" placeholder="Your Name" />
              </div>
              <div>
                <Input type="email" placeholder="Your Email" />
              </div>
              <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600">
                Subscribe <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="text-xs text-gray-500 mt-4">
              {isEditMode ? (
                <EditableContent
                  profile={{ id: "newsletter-disclaimer", bio: newsletterDisclaimer }}
                  onSave={async (data) => setNewsletterDisclaimer(data.bio)}
                  isEditing={isEditMode}
                  onEditToggle={() => {}}
                />
              ) : (
                "By subscribing, you agree to receive email communications from me. Don't worry, I respect your privacy and will never share your information."
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Social Link Dialog */}
      <Dialog open={isEditLinkDialogOpen} onOpenChange={setIsEditLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Social Link</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Update your social media link information
            </p>
          </DialogHeader>
          {currentLink && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={currentLink.platform}
                  onValueChange={(value) => {
                    const platformInfo = platformOptions.find((p) => p.name === value)
                    if (platformInfo) {
                      setCurrentLink({
                        ...currentLink,
                        platform: value,
                        icon: platformInfo.icon,
                        color: platformInfo.color,
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((platform) => (
                      <SelectItem key={platform.name} value={platform.name}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username/Handle</Label>
                <Input
                  id="username"
                  value={currentLink.username}
                  onChange={(e) => setCurrentLink({ ...currentLink, username: e.target.value })}
                  placeholder="@yourusername"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={currentLink.url}
                  onChange={(e) => setCurrentLink({ ...currentLink, url: e.target.value })}
                  placeholder="https://platform.com/username"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Social Link Dialog */}
      <Dialog open={isAddLinkDialogOpen} onOpenChange={setIsAddLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Social Link</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add a new social media link to your profile
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-platform">Platform</Label>
              <Select value={newLink.platform} onValueChange={(value) => setNewLink({ ...newLink, platform: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((platform) => (
                    <SelectItem key={platform.name} value={platform.name}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-username">Username/Handle</Label>
              <Input
                id="new-username"
                value={newLink.username}
                onChange={(e) => setNewLink({ ...newLink, username: e.target.value })}
                placeholder="@yourusername"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-url">URL (optional)</Label>
              <Input
                id="new-url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://platform.com/username"
              />
              <p className="text-xs text-gray-500">Leave empty to generate from platform name</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLink} disabled={!newLink.username}>
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
