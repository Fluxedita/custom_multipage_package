'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Phone, MapPin, User, MessageSquare, Smile, Heart, Info, 
  Calendar, Home, Users, Briefcase, Music, Film, Book, Coffee, 
  ChevronDown, ChevronUp, Cake, Map, HeartPulse, UserPlus, Star, Lock, Check, X,
  Upload, Image as ImageIcon, Video, XCircle, FileVideo, FileImage, Trash2, Camera, VideoOff, Send
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'

interface ContactFormProps {
  isAuthenticated: boolean
  user: any
}

export default function ContactForm({ isAuthenticated, user }: ContactFormProps) {
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
    // Personal Details
    sharePersonalInfo: false,
    personalDetails: {
      company: '',
      city: '',
      country: '',
      occupation: '',
      hobbies: ''
    },
    additionalInfo: ''
  });

  // State for file uploads
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileVideo, setProfileVideo] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { getRootProps: getBaseRootProps, getInputProps: getBaseInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.type.startsWith('image/')) {
          setProfileImage(file);
        } else if (file.type.startsWith('video/')) {
          setProfileVideo(file);
        }
      }
    }
  });

  const getImageRootProps = useCallback(() => {
    return getBaseRootProps({
      className: `border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive && profileImage === null ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
      }`
    });
  }, [getBaseRootProps, isDragActive, profileImage]);

  const getImageInputProps = useCallback(() => {
    return getBaseInputProps({
      accept: 'image/*',
      multiple: false
    });
  }, [getBaseInputProps]);

  const getVideoRootProps = useCallback(() => {
    return getBaseRootProps({
      className: `border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive && profileVideo === null ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
      }`
    });
  }, [getBaseRootProps, isDragActive, profileVideo]);

  const getVideoInputProps = useCallback(() => {
    return getBaseInputProps({
      accept: 'video/*',
      multiple: false
    });
  }, [getBaseInputProps]);

  const isImageDragActive = isDragActive && profileImage === null;
  const isVideoDragActive = isDragActive && profileVideo === null;

  const removeFile = (type: 'image' | 'video') => {
    if (type === 'image') {
      setProfileImage(null);
    } else {
      setProfileVideo(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle nested objects in form data
    if (name.startsWith('personalDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        personalDetails: {
          ...prev.personalDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sharePersonalInfo: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Send the form data to your API route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          // Add any other fields you want to send
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        setUploadStatus('error');
        setUploadError('Failed to send message. Please try again.');
        toast.error('Failed to send message. Please try again.');
        return;
      }

      setUploadProgress(100);
      setUploadStatus('success');
      toast.success('Message sent successfully! We\'ll get back to you soon.');

      // Reset form
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        message: '',
        sharePersonalInfo: false,
        personalDetails: {
          company: '',
          city: '',
          country: '',
          occupation: '',
          hobbies: ''
        },
        additionalInfo: ''
      });
      setProfileImage(null);
      setProfileVideo(null);

    } catch (error) {
      setUploadStatus('error');
      setUploadError('Failed to send message. Please try again.');
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Get in Touch</h2>
              <p className="text-blue-100">We'd love to hear from you!</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jamescroanin@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your project, collaboration idea, or just say hello!"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Personal Information (Optional) */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sharePersonalInfo"
                name="sharePersonalInfo"
                checked={formData.sharePersonalInfo}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="sharePersonalInfo" className="text-sm font-medium">
                Share additional information (optional)
              </Label>
            </div>

            <AnimatePresence>
              {formData.sharePersonalInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 p-4 bg-gray-50 rounded-lg"
                >
                  {/* Personal Details Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="personalDetails.company"
                        value={formData.personalDetails.company}
                        onChange={handleChange}
                        placeholder="Your company"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="personalDetails.city"
                        value={formData.personalDetails.city}
                        onChange={handleChange}
                        placeholder="Your city"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="personalDetails.country"
                        value={formData.personalDetails.country}
                        onChange={handleChange}
                        placeholder="Your country"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="sector">Sector</Label>
                      <Input
                        id="sector"
                        name="personalDetails.sector"
                        value={formData.personalDetails.occupation}
                        onChange={handleChange}
                        placeholder="Sector"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="interest">Interests</Label>
                    <Textarea
                      id="interest"
                      name="personalDetails.hobbies"
                      value={formData.personalDetails.hobbies}
                      onChange={handleChange}
                      placeholder="Tell us about your interested area."
                      rows={3}
                    />
                  </div>

                  {/* Attachments (Optional) - moved inside conditional */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Attachments (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Image Upload */}
                      <div>
                        <Label>Profile Image</Label>
                        <div {...getImageRootProps()}>
                          <input {...getImageInputProps()} />
                          {profileImage ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{profileImage.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile('image');
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                              <p className="text-sm text-gray-600">
                                {isImageDragActive ? 'Drop image here' : 'Click to upload or drag image'}
                              </p>
                              <p className="text-xs text-gray-500">Max 5MB</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Video Upload */}
                      <div>
                        <Label>Profile Video</Label>
                        <div {...getVideoRootProps()}>
                          <input {...getVideoInputProps()} />
                          {profileVideo ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{profileVideo.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile('video');
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Video className="h-8 w-8 mx-auto text-gray-400" />
                              <p className="text-sm text-gray-600">
                                {isVideoDragActive ? 'Drop video here' : 'Click to upload or drag video'}
                              </p>
                              <p className="text-xs text-gray-500">Max 50MB</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information - moved inside conditional */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Info className="h-5 w-5 mr-2" />
                      Additional Information
                    </h3>
                    <div>
                      <Label htmlFor="additionalInfo">Additional Comments</Label>
                      <Textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleChange}
                        placeholder="Any additional information you'd like to share..."
                        rows={3}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={uploadStatus === 'uploading'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              {uploadStatus === 'uploading' ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </div>
              )}
            </Button>
          </div>

          {/* Upload Progress */}
          {uploadStatus === 'uploading' && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{uploadError}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
