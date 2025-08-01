import { z } from "zod"

export const mediaFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  isPremium: z.boolean(),
  tags: z.array(z.string()).optional(),
  type: z.enum(['image', 'video']),
  videoUrl: z.string().optional(),
  coverImage: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  galleryType: z.enum(['public', 'exclusive', 'behind-scenes', 'gallery']),
  featured: z.boolean(),
  order: z.number().optional(),
})

export type MediaFormValues = z.infer<typeof mediaFormSchema>
