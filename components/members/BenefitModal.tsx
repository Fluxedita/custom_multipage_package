'use client'

import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface BenefitModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  benefits: Array<{
    title: string
    description: string
  }>
  color: 'green' | 'pink' | 'purple'
}

export default function BenefitModal({ isOpen, onClose, title, benefits, color }: BenefitModalProps) {
  const colorClasses = {
    green: 'bg-green-500',
    pink: 'bg-pink-500',
    purple: 'bg-purple-500'
  }

  const buttonClasses = {
    green: 'bg-green-500 hover:bg-green-600',
    pink: 'bg-pink-500 hover:bg-pink-600',
    purple: 'bg-purple-500 hover:bg-purple-600'
  }

  const iconColors = {
    green: 'text-green-500',
    pink: 'text-pink-500',
    purple: 'text-purple-500'
  }

  const bgColors = {
    green: 'bg-green-100',
    pink: 'bg-pink-100',
    purple: 'bg-purple-100'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              className="inline-block w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`${colorClasses[color]} px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{title} Benefits</h3>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full ${bgColors[color]} flex items-center justify-center mr-4`}>
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${colorClasses[color]} bg-opacity-20`}>
                          <div className={`h-3 w-3 rounded-full ${colorClasses[color]}`} />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                        <p className="mt-1 text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={onClose}
                    className={`${buttonClasses[color]} text-white`}
                  >
                    Got it, thanks!
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
