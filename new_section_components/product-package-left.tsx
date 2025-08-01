"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, Eye } from "lucide-react"
import MediaLibrary from "@/components/media/MediaLibrary"

export interface ProductPackageProps {
  id: string
  name: string
  subtitle: string
  description: string
  badge?: string
  features: string[]
  perfectFor: string[]
  color: string
  icon: React.ReactNode
  imageSrc: string
  imageAlt: string
  onLearnMoreAction: () => void
  onViewDemoAction: () => void
  onLightboxOpenAction: () => void
  lightboxOpen: boolean
  // Add editable button fields
  learnMoreText?: string
  learnMoreUrl?: string
  isEditMode?: boolean
  onSectionChange?: (section: ProductPackageProps) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
}

export function ProductPackageLeft({
  id,
  name,
  subtitle,
  description,
  badge,
  features,
  perfectFor,
  color,
  icon,
  imageSrc,
  imageAlt,
  onLearnMoreAction,
  onViewDemoAction,
  onLightboxOpenAction,
  lightboxOpen,
  learnMoreText = 'Learn More',
  learnMoreUrl = '#',
  isEditMode = false,
  onSectionChange,
}: ProductPackageProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  // Edit mode UI for button text/link
  if (isEditMode && onSectionChange) {
    // Helper to handle comma-separated lists
    const handleListChange = (field: keyof ProductPackageProps, value: string) => {
      onSectionChange({ ...arguments[0], [field]: value.split(",").map(s => s.trim()).filter(Boolean) });
    };
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => onSectionChange({ ...arguments[0], name: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="Product Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={e => onSectionChange({ ...arguments[0], subtitle: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="Product Subtitle"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => onSectionChange({ ...arguments[0], description: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="Describe your product package here."
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
          <input
            type="text"
            value={badge || ''}
            onChange={e => onSectionChange({ ...arguments[0], badge: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="e.g. Most Popular"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
          <input
            type="text"
            value={features.join(', ')}
            onChange={e => handleListChange('features', e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="Feature 1, Feature 2, Feature 3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Perfect For (comma separated)</label>
          <input
            type="text"
            value={perfectFor.join(', ')}
            onChange={e => handleListChange('perfectFor', e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="Use 1, Use 2, Use 3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color (Tailwind gradient classes)</label>
          <input
            type="text"
            value={color}
            onChange={e => onSectionChange({ ...arguments[0], color: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="from-blue-500 to-blue-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={imageSrc}
              onChange={e => onSectionChange({ ...arguments[0], imageSrc: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
              placeholder="https://..."
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Select from Media Library"
              onClick={() => setMediaDialogOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            </Button>
          </div>
          {mediaDialogOpen && (
            <MediaLibrary
              isDialog
              type="image"
              onCloseAction={() => setMediaDialogOpen(false)}
              onSelectAction={(url: string) => {
                onSectionChange({ ...arguments[0], imageSrc: url });
                setMediaDialogOpen(false);
              }}
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
          <input
            type="text"
            value={imageAlt}
            onChange={e => onSectionChange({ ...arguments[0], imageAlt: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="Image description for accessibility"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Learn More Button Label</label>
          <input
            type="text"
            value={learnMoreText}
            onChange={e => onSectionChange({ ...arguments[0], learnMoreText: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="e.g. Learn More"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Learn More Button Link</label>
          <input
            type="url"
            value={learnMoreUrl}
            onChange={e => onSectionChange({ ...arguments[0], learnMoreUrl: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g. https://your-link.com"
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      ref={ref}
      className="flex flex-col gap-12"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
        {/* Content */}
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
              {icon}
            </div>
            {badge && (
              <Badge variant={badge === "Most Popular" ? "default" : "secondary"} className="text-xs">
                {badge}
              </Badge>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{name}</h2>
            <h3 className="text-xl text-blue-600 font-semibold mb-4">{subtitle}</h3>
            <p className="text-gray-600 mb-6">{description}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.05 + 0.4 }}
                  >
                    <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.3 }}>
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    </motion.div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Perfect For:</h4>
              <ul className="space-y-2">
                {perfectFor.map((use, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.05 + 0.6 }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full mr-3"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 }}
                    />
                    <span className="text-gray-700">{use}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href={learnMoreUrl}
                className={`inline-block`}
              >
                <Button
                  size="lg"
                  className={`bg-gradient-to-r ${color} hover:opacity-90 relative overflow-hidden group`}
                  asChild
                >
                  <span className="relative z-10 flex items-center">
                    {learnMoreText}
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.div>
                  </span>
                </Button>
              </a>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="lg" 
                className="hover:bg-gray-50 bg-transparent"
                onClick={onViewDemoAction}
              >
                View Demo
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Image Side - Moved to left */}
        <motion.div 
          className="flex-1 w-full h-full rounded-2xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, x: -50, rotateY: -15 }}
          animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: -50, rotateY: -15 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ 
            y: -10,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          <img 
            src={imageSrc} 
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
