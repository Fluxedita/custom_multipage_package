'use client'

import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import { useState } from "react"
import BenefitModal from "./BenefitModal"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
  hover: {
    y: -5,
    transition: {
      duration: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
}

const benefitData = {
  basic: {
    title: 'Basic Package',
    color: 'green' as const,
    benefits: [
      {
        title: 'Photo Gallery Access',
        description: 'Browse through my exclusive photo collections with full access to all basic content.'
      },
      {
        title: 'Weekly Updates',
        description: 'Get notified about new content every week to stay up-to-date with my latest work.'
      },
      {
        title: 'Content Interaction',
        description: 'Comment and engage with my content, and interact with other community members.'
      },
      {
        title: 'Video Content',
        description: 'Access to a growing library of exclusive video content available only to members.'
      }
    ]
  },
  premium: {
    title: 'Premium Package',
    color: 'pink' as const,
    benefits: [
      {
        title: 'All Basic Features',
        description: 'Everything included in the Basic package, plus premium benefits.'
      },
      {
        title: 'Direct Messaging',
        description: 'Chat directly with me about content, ideas, or just to say hello!'
      },
      {
        title: 'Priority Content',
        description: 'Get early access to new content before it\'s available to basic members.'
      },
      {
        title: 'Enhanced Interaction',
        description: 'More ways to engage with my content, including polls and Q&A sessions.'
      },
      {
        title: 'Exclusive Behind-the-Scenes',
        description: 'See how content is made with exclusive behind-the-scenes access.'
      }
    ]
  },
  vip: {
    title: 'VIP Package',
    color: 'purple' as const,
    benefits: [
      {
        title: 'All Premium Features',
        description: 'Everything included in the Premium package, plus VIP exclusives.'
      },
      {
        title: 'Personal Messaging',
        description: 'One-on-one conversations with me for a more personal connection.'
      },
      {
        title: 'Exclusive Content',
        description: 'Content created exclusively for VIP members, not available anywhere else.'
      },
      {
        title: 'VIP Treatment',
        description: 'Special perks including personalized shoutouts and priority responses.'
      },
      {
        title: 'Custom Content Requests',
        description: 'Request specific types of content you\'d like to see from me.'
      },
      {
        title: 'Virtual Girlfriend',
        description: 'Experience personalized attention with a virtual girlfriend experience, including one-on-one intimate messaging and exclusive picture and video request content.'
      }
    ]
  }
}

export default function AnimatedBenefits() {
  const [modalOpen, setModalOpen] = useState<null | 'basic' | 'premium' | 'vip'>(null)

  const openModal = (type: 'basic' | 'premium' | 'vip') => setModalOpen(type)
  const closeModal = () => setModalOpen(null)
  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="my-16"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Detailed Benefits
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Package Benefits */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => openModal('basic')}
          >
            <h3 className="text-2xl font-bold mb-6">Basic Package</h3>
            <ul className="space-y-4">
              {benefitData.basic.benefits.slice(0, 2).map((benefit, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  className="flex items-start group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 group-hover:bg-green-500 transition-colors duration-300">
                    <Check className="h-5 w-5 text-green-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <span className="font-medium block group-hover:text-green-600 transition-colors duration-300">{benefit.title}</span>
                    <p className="text-sm text-gray-600 mt-1">{benefit.description.split('. ')[0]}</p>
                  </div>
                </motion.li>
              ))}
              <div className="pt-2">
                <button className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
                  View all benefits →
                </button>
              </div>
            </ul>
          </motion.div>

          {/* Premium Package Benefits */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-lg shadow-lg p-8 border-2 border-pink-500 hover:shadow-xl transition-all duration-300 cursor-pointer relative"
            onClick={() => openModal('premium')}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-6">Premium Package</h3>
            <ul className="space-y-4">
              {benefitData.premium.benefits.slice(0, 2).map((benefit, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  className="flex items-start group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-3 group-hover:bg-pink-500 transition-colors duration-300">
                    <Check className="h-5 w-5 text-pink-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <span className="font-medium block group-hover:text-pink-600 transition-colors duration-300">{benefit.title}</span>
                    <p className="text-sm text-gray-600 mt-1">{benefit.description.split('. ')[0]}</p>
                  </div>
                </motion.li>
              ))}
              <div className="pt-2">
                <button className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors">
                  View all benefits →
                </button>
              </div>
            </ul>
          </motion.div>

          {/* VIP Package Benefits */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => openModal('vip')}
          >
            <h3 className="text-2xl font-bold mb-6">VIP Package</h3>
            <ul className="space-y-4">
              {benefitData.vip.benefits.slice(0, 2).map((benefit, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  className="flex items-start group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 group-hover:bg-purple-500 transition-colors duration-300">
                    <Check className="h-5 w-5 text-purple-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <span className="font-medium block group-hover:text-purple-600 transition-colors duration-300">{benefit.title}</span>
                    <p className="text-sm text-gray-600 mt-1">{benefit.description.split('. ')[0]}</p>
                  </div>
                </motion.li>
              ))}
              <div className="pt-2">
                <button className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                  View all benefits →
                </button>
              </div>
            </ul>
          </motion.div>
        </div>
      </motion.div>
      <AnimatePresence>
        {modalOpen && (
          <BenefitModal
            isOpen={!!modalOpen}
            onClose={closeModal}
            title={benefitData[modalOpen].title}
            benefits={benefitData[modalOpen].benefits}
            color={benefitData[modalOpen].color}
          />
        )}
      </AnimatePresence>
    </>
  )
}