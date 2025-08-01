"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, Eye } from "lucide-react"
import type { ProductPackageRightSection as ProductPackageRightSectionType } from '@/app/custom_pages/types/sections';
type EditSectionProps = {
  section: ProductPackageRightSectionType;
  isEditMode: boolean;
  onSectionChangeAction: (section: ProductPackageRightSectionType) => void;
};

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
  learnMoreText?: string
  learnMoreUrl?: string
  isEditMode?: boolean
  onSectionChangeAction?: (section: ProductPackageProps) => void
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

export function ProductPackageRight({
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
  onSectionChangeAction,
}: ProductPackageProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  if (isEditMode && onSectionChangeAction) {
    // Helper to handle comma-separated lists
    const handleListChange = (field: keyof ProductPackageProps, value: string) => {
      onSectionChangeAction({ ...arguments[0], [field]: value.split(",").map(s => s.trim()).filter(Boolean) });
    };
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => onSectionChangeAction({ ...arguments[0], name: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="Product Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={e => onSectionChangeAction({ ...arguments[0], subtitle: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="Product Subtitle"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => onSectionChangeAction({ ...arguments[0], description: e.target.value })}
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
            onChange={e => onSectionChangeAction({ ...arguments[0], badge: e.target.value })}
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
            onChange={e => onSectionChangeAction({ ...arguments[0], color: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="from-blue-500 to-blue-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="text"
            value={imageSrc}
            onChange={e => onSectionChangeAction({ ...arguments[0], imageSrc: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
          <input
            type="text"
            value={imageAlt}
            onChange={e => onSectionChangeAction({ ...arguments[0], imageAlt: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="Image description for accessibility"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Learn More Button Label</label>
          <input
            type="text"
            value={learnMoreText}
            onChange={e => onSectionChangeAction({ ...arguments[0], learnMoreText: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
            placeholder="e.g. Learn More"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Learn More Button Link</label>
          <input
            type="url"
            value={learnMoreUrl}
            onChange={e => onSectionChangeAction({ ...arguments[0], learnMoreUrl: e.target.value })}
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
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Content Side */}
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 cursor-pointer">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
              {icon}
            </div>
            {badge && (
              <Badge variant={badge === "Most Popular" ? "default" : "secondary"} className="text-xs">
                {badge}
              </Badge>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{name}</h2>
            <h3 className="text-xl text-blue-600 font-semibold mb-4">{subtitle}</h3>
            <p className="text-gray-600 mb-6">{description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
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
                href={learnMoreUrl || '#'}
                className={`inline-block`}
              >
                <Button
                  size="lg"
                  className={`bg-gradient-to-r ${color} hover:opacity-90 relative overflow-hidden group`}
                  asChild
                >
                  <span className="relative z-10 flex items-center">
                    {learnMoreText || 'Learn More'}
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

        {/* Image Side */}
        <motion.div 
          className="flex-1 w-full h-full rounded-2xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, x: 50, rotateY: 15 }}
          animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: 50, rotateY: 15 }}
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

// Wrapper for section system compatibility
export function ProductPackageRightSection({ section, isEditMode, onSectionChangeAction }: EditSectionProps) {
  return (
    <ProductPackageRight
      {...section}
      isEditMode={isEditMode}
      onSectionChangeAction={(s) => onSectionChangeAction(s as unknown as ProductPackageRightSectionType)}
      icon={<span />}
      onLearnMoreAction={() => {}}
      onViewDemoAction={() => {}}
      onLightboxOpenAction={() => {}}
      lightboxOpen={false}
    />
  );
}
