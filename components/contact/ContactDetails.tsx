"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ContactEditableMedia from './ContactEditableMedia';
import { cn } from '@/lib/utils';
import { useContactEdit } from './ContactEditContext';
import supabase from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ContactMethod {
  icon: React.ReactNode;
  title: string;
  value: string;
  action: string;
}

interface ContactDetailsProps {
  onMediaChange?: (url: string) => void;
  onContactMethodChangeAction?: (index: number, field: string, value: string) => void;
  contactMethods?: ContactMethod[];
  profileImage?: string;
}

const defaultContactMethods: ContactMethod[] = [
  {
    icon: (
      <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Email',
    value: 'jamescroanin@gmail.com',
    action: 'mailto:jamescroanin@gmail.com'
  },
  {
    icon: (
      <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: 'Phone',
    value: '+1 (555) 123-4567',
    action: 'tel:+15551234567'
  },
  {
    icon: (
      <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Location',
    value: 'London, United Kingdom',
    action: 'https://maps.google.com'
  }
];

// Default profile image if none is provided
const defaultProfileImage = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';

export default function ContactDetails({
  onMediaChange,
  onContactMethodChangeAction = () => {},
  contactMethods: propContactMethods,
  profileImage = defaultProfileImage
}: ContactDetailsProps) {
  const { isEditMode, saveContactData, getContactData, saveChanges, isSaving } = useContactEdit()
  // Use a transparent 1x1 pixel as a fallback to prevent 404 errors
  const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  
  // Load contact methods from localStorage or use defaults
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>(() => {
    const savedMethods = getContactData('contactMethods');
    return savedMethods || (propContactMethods || defaultContactMethods);
  });

  // Load profile image from context or use prop as fallback
  const [currentProfileImage, setCurrentProfileImage] = useState<string>(() => {
    const savedImage = getContactData('profileImage');
    return savedImage || profileImage;
  });
  
  // Save contact methods when they change
  useEffect(() => {
    if (contactMethods.length > 0) {
      saveContactData('contactMethods', contactMethods);
    }
  }, [contactMethods, saveContactData]);

  // Handle profile image change
  const handleProfileImageChange = (url: string) => {
    setCurrentProfileImage(url);
    saveContactData('profileImage', url);
    if (onMediaChange) {
      onMediaChange(url);
    }
  };
  
  // Handle contact method changes
  const handleContactMethodChange = (index: number, field: string, value: string) => {
    const updatedMethods = [...contactMethods];
    updatedMethods[index] = { ...updatedMethods[index], [field]: value };
    
    // Update action URLs for email and phone
    if (field === 'value') {
      if (updatedMethods[index].title === 'Email') {
        updatedMethods[index].action = `mailto:${value}`;
      } else if (updatedMethods[index].title === 'Phone') {
        const phoneNumber = value.replace(/\D/g, '');
        updatedMethods[index].action = `tel:${phoneNumber}`;
      }
    }
    
    setContactMethods(updatedMethods);
    onContactMethodChangeAction(index, field, value);
  };

  return (
    <section className="py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">Get in Touch</h2>
            <p className="text-lg text-gray-600">
              We are always excited to connect with other developers! Whether you have questions, want to collaborate, or just want to say hi, 
              feel free to reach out using any of the methods below.
            </p>
          </div>
          
          <div className="space-y-6">
            {contactMethods.map((method, index) => (
              <div key={index} className="group relative">
                {isEditMode ? (
                  <div className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{method.title}</h3>
                      <div className="flex-shrink-0 p-2 bg-pink-50 rounded-lg">
                        {method.icon}
                      </div>
                    </div>
                    <input
                      type={method.title === 'Email' ? 'email' : 'text'}
                      value={method.value}
                      onChange={(e) => handleContactMethodChange(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      placeholder={`Enter ${method.title.toLowerCase()}`}
                    />
                    {method.title === 'Email' && (
                      <p className="text-xs text-gray-500">
                        This will update the email link
                      </p>
                    )}
                    {method.title === 'Phone' && (
                      <p className="text-xs text-gray-500">
                        This will update the phone link (numbers only)
                      </p>
                    )}
                  </div>
                ) : (
                  <a
                    href={method.action}
                    className="flex items-start space-x-4 group-hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex-shrink-0 p-2 bg-pink-50 rounded-lg group-hover:bg-pink-100 transition-colors">
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{method.title}</h3>
                      <p className="text-gray-600">{method.value}</p>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
          {/* Save Button for Get in Touch section */}
          {isEditMode && (
            <button
              className="mt-6 w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded shadow"
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from('root_page_components')
                    .update({ content: { contactMethods } })
                    .eq('page_slug', 'contact')
                    .eq('component_type', 'contact_data');
                  if (error) throw error;
                  toast.success('Contact details saved!');
                } catch (err) {
                  toast.error('Failed to save contact details');
                }
              }}
            >
              Save Contact Details
            </button>
          )}
        </motion.div>

        {/* Profile Image (Media Placeholder) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className={cn("relative aspect-[4/5] w-full h-full max-w-xs md:max-w-sm lg:max-w-md bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center", {
            'ring-2 ring-pink-500 ring-offset-2': isEditMode
          })}
        >
          <ContactEditableMedia
            src={currentProfileImage}
            alt="Profile Image"
            className="w-full h-full object-cover rounded-2xl"
            onChange={handleProfileImageChange}
            type="image"
          />
          {/* Save Button for Profile Image */}
          {isEditMode && (
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <button
                className="mt-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded shadow disabled:opacity-60"
                onClick={async () => {
                  try {
                    await saveChanges();
                  } catch (err) {
                    toast.error('Failed to save profile image');
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Profile Image'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
