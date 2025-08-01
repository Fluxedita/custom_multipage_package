"use client"

import { useState } from "react"
import { Star, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useProfileEdit } from "./ProfileEditContext"
import EditableContent from "./EditableContent"
import EditableImage from "./EditableImage"
import { TestimonialsCarousel } from "@/components/members/TestimonialsCarousel"

interface Testimonial {
  id: number
  name: string
  text: string
  avatar: string
  initials: string
  rating: number
  tier: string
}

export default function ProfileTestimonials() {
  const { isEditMode, setIsDirty } = useProfileEdit()
  const [title, setTitle] = useState("What My Members Say")
  const [description, setDescription] = useState(
    "Don't just take my word for it - here's what my amazing community has to say.",
  )
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: 1,
      name: "EmilyLuxe",
      text: "admin has such a natural charm. Every post feels personal — it's like she's sharing a secret just with us!",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      initials: "EL",
      rating: 5,
      tier: "Premium",
    },
    {
      id: 2,
      name: "PhotoFan89",
      text: "The way admin connects with her audience is unreal. Her energy is magnetic and so inviting.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      initials: "PF",
      rating: 5,
      tier: "VIP",
    },
    {
      id: 3,
      name: "JustJay",
      text: "Every new upload is a treat. admin knows how to keep things classy and seductive all at once!",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      initials: "JJ",
      rating: 5,
      tier: "Basic",
    },
    {
      id: 4,
      name: "SereneDream",
      text: "I can't get enough of her behind-the-scenes stories — she's effortlessly captivating.",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      initials: "SD",
      rating: 5,
      tier: "Premium",
    },
    {
      id: 5,
      name: "CamKing23",
      text: "admin's content never disappoints. She has that perfect mix of sweetness and allure.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      initials: "CK",
      rating: 5,
      tier: "VIP",
    },
    {
      id: 6,
      name: "LilyRae",
      text: "Her style is so unique and authentic. You can tell she puts her heart into every post.",
      avatar: "https://randomuser.me/api/portraits/women/17.jpg",
      initials: "LR",
      rating: 5,
      tier: "Basic",
    },
    {
      id: 7,
      name: "MidnightMuse",
      text: "Every photo feels like it was taken just for me. admin's presence is pure magic.",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      initials: "MM",
      rating: 5,
      tier: "Premium",
    },
    {
      id: 8,
      name: "AlexBreeze",
      text: "She's the reason I signed up — and stayed. Her natural vibe is just so rare.",
      avatar: "https://randomuser.me/api/portraits/men/91.jpg",
      initials: "AB",
      rating: 5,
      tier: "VIP",
    },
    {
      id: 9,
      name: "VelvetVox",
      text: "admin turns ordinary moments into something intimate and special. She's a total gem.",
      avatar: "https://randomuser.me/api/portraits/women/89.jpg",
      initials: "VV",
      rating: 5,
      tier: "Basic",
    },
    {
      id: 10,
      name: "NovaSkye",
      text: "There's something about admin — so soft, so genuine, yet totally mesmerizing. Love everything she shares.",
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
      initials: "NS",
      rating: 5,
      tier: "Premium",
    },
  ])

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null)
  const [newTestimonial, setNewTestimonial] = useState<Omit<Testimonial, "id">>({
    name: "",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    initials: "",
    text: "",
    rating: 5,
    tier: "Premium",
  })

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setCurrentTestimonial(testimonial)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!currentTestimonial) return

    setTestimonials((prev) => prev.map((item) => (item.id === currentTestimonial.id ? currentTestimonial : item)))
    setIsEditDialogOpen(false)
    setCurrentTestimonial(null)
    setIsDirty(true)
  }

  const handleDeleteTestimonial = (id: number) => {
    setTestimonials((prev) => prev.filter((item) => item.id !== id))
    setIsDirty(true)
  }

  const handleAddTestimonial = () => {
    // Generate initials from name
    const initials = newTestimonial.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)

    const testimonial: Testimonial = {
      ...newTestimonial,
      id: Math.max(...testimonials.map(t => t.id)) + 1,
      initials: initials || "XX",
    }

    setTestimonials((prev) => [...prev, testimonial])
    setIsAddDialogOpen(false)
    setNewTestimonial({
      name: "",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      initials: "",
      text: "",
      rating: 5,
      tier: "Premium",
    })
    setIsDirty(true)
  }

  const updateTestimonialAvatar = (id: number, url: string) => {
    setTestimonials((prev) => prev.map((item) => (item.id === id ? { ...item, avatar: url } : item)))
    setIsDirty(true)
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">
          <EditableContent
            profile={{ id: "testimonials-title", full_name: title }}
            onSave={async (data) => setTitle(data.full_name)}
            isEditing={isEditMode}
            onEditToggle={() => {}}
          />
        </h2>
        <div className="text-gray-600 max-w-2xl mx-auto">
          <EditableContent
            profile={{ id: "testimonials-description", bio: description }}
            onSave={async (data) => setDescription(data.bio)}
            isEditing={isEditMode}
            onEditToggle={() => {}}
          />
        </div>
      </div>

      <div className="relative">
        <TestimonialsCarousel testimonials={testimonials} />
        
        {isEditMode && (
          <div className="flex justify-center mt-8">
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-rose-500 hover:bg-rose-600">
              <Plus className="h-4 w-4 mr-2" /> Add Testimonial
            </Button>
          </div>
        )}
      </div>

      {/* Edit Testimonial Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Update the testimonial details and rating
            </p>
          </DialogHeader>
          {currentTestimonial && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={currentTestimonial.name}
                  onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="relative h-20 w-20 mx-auto">
                  <EditableImage
                    src={currentTestimonial.avatar}
                    alt={currentTestimonial.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                    onChange={(url) => setCurrentTestimonial({ ...currentTestimonial, avatar: url })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Testimonial</Label>
                <Textarea
                  id="text"
                  value={currentTestimonial.text}
                  onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, text: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={currentTestimonial.rating}
                  onChange={(e) =>
                    setCurrentTestimonial({
                      ...currentTestimonial,
                      rating: Math.min(5, Math.max(1, Number.parseInt(e.target.value) || 1)),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="membership">Membership Tier</Label>
                <Input
                  id="membership"
                  value={currentTestimonial.tier}
                  onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, tier: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Testimonial Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Testimonial</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add a new testimonial to showcase on your profile
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Name</Label>
              <Input
                id="new-name"
                value={newTestimonial.name}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Avatar</Label>
              <div className="relative h-20 w-20 mx-auto">
                <EditableImage
                  src={newTestimonial.avatar}
                  alt="New testimonial avatar"
                  width={80}
                  height={80}
                  className="rounded-full"
                  onChange={(url) => setNewTestimonial({ ...newTestimonial, avatar: url })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-text">Testimonial</Label>
              <Textarea
                id="new-text"
                value={newTestimonial.text}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                rows={4}
                placeholder="Enter testimonial text..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-rating">Rating (1-5)</Label>
              <Input
                id="new-rating"
                type="number"
                min="1"
                max="5"
                value={newTestimonial.rating}
                onChange={(e) =>
                  setNewTestimonial({
                    ...newTestimonial,
                    rating: Math.min(5, Math.max(1, Number.parseInt(e.target.value) || 1)),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-membership">Membership Tier</Label>
              <Input
                id="new-membership"
                value={newTestimonial.tier}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, tier: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTestimonial}>Add Testimonial</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
