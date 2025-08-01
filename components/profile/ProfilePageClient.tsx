"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Settings, 
  Camera, 
  Video, 
  Mail, 
  MapPin, 
  Briefcase, 
  Heart, 
  Calendar, 
  Star,
  Award,
  Shield,
  Edit3,
  Save,
  X
} from 'lucide-react';
import EditableContent from './EditableContent';
import EditableImage from './EditableImage';

interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  username?: string;
  email?: string;
  bio?: string;
  age?: number;
  city?: string;
  country?: string;
  occupation?: string;
  hobbies?: string;
  avatar_url?: string;
  banner_url?: string;
  video_intro_url?: string;
  additional_notes?: string;
  first_name?: string;
  last_name?: string;
  bio_message?: string;
  membership_type?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProfilePageClientProps {
  profile: Profile;
  isOwnProfile?: boolean;
}

export default function ProfilePageClient({ profile, isOwnProfile = false }: ProfilePageClientProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = user?.role === 'admin'; // user.role is now membership_type

  useEffect(() => {
    setCurrentProfile(profile);
  }, [profile]);

  const handleSave = async (data: any) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/profile/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setCurrentProfile(updatedProfile);
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpdate = (field: string, url: string) => {
    setCurrentProfile(prev => ({
      ...prev,
      [field]: url
    }));
  };

  const displayName = currentProfile.full_name || currentProfile.username || 'Anonymous User';
  const membershipBadgeColor = currentProfile.membership_type === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="relative">
        {/* Banner Image */}
        <div className="h-64 rounded-lg overflow-hidden mb-4">
          {currentProfile.banner_url ? (
            <img 
              src={currentProfile.banner_url} 
              alt="Profile banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-600 flex items-center justify-center">
              <Camera className="h-16 w-16 text-white opacity-50" />
            </div>
          )}
          {isOwnProfile && (
            <div className="absolute top-4 right-4">
              <EditableImage
                src={currentProfile.banner_url || ''}
                alt="Profile banner"
                width={800}
                height={400}
                className="bg-white/90 hover:bg-white text-gray-700"
                type="background"
                onChange={(url: string) => handleImageUpdate('banner_url', url)}
              />
            </div>
          )}
        </div>
        
        {/* Profile Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="relative">
            {currentProfile.avatar_url ? (
              <img 
                src={currentProfile.avatar_url} 
                alt={displayName} 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <Badge className={`absolute -bottom-2 -right-2 ${membershipBadgeColor}`}>
              {currentProfile.membership_type || 'Basic'}
            </Badge>
            {isOwnProfile && (
              <div className="absolute top-0 right-0">
                <EditableImage
                  src={currentProfile.avatar_url || ''}
                  alt="Profile avatar"
                  width={128}
                  height={128}
                  className="bg-white/90 hover:bg-white text-gray-700"
                  type="profile"
                  onChange={(url: string) => handleImageUpdate('avatar_url', url)}
                />
              </div>
            )}
          </div>
          
          {/* Basic Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900">{displayName}</h1>
            {currentProfile.occupation && (
              <p className="text-xl text-gray-600 mt-1">{currentProfile.occupation}</p>
            )}
            {(currentProfile.city || currentProfile.country) && (
              <p className="text-gray-500 mt-1 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {[currentProfile.city, currentProfile.country].filter(Boolean).join(', ')}
              </p>
            )}
            {currentProfile.created_at && (
              <p className="text-gray-500 mt-1 flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Member since {new Date(currentProfile.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            {isOwnProfile && (
              <Button 
                variant={isEditing ? "destructive" : "outline"} 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            )}
            {!isOwnProfile && (
              <>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Message
                </Button>
                {isAdmin && (
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            About
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center">
            <Camera className="h-4 w-4 mr-2" />
            Media
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6">
          <EditableContent
            profile={currentProfile}
            onSave={handleSave}
            isEditing={isEditing}
            onEditToggle={() => setIsEditing(!isEditing)}
          />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <div className="space-y-6">
            {/* Video Introduction */}
            {currentProfile.video_intro_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Video Introduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <video 
                    src={currentProfile.video_intro_url} 
                    className="w-full rounded-lg"
                    controls
                  />
                </CardContent>
              </Card>
            )}

            {/* Profile Media Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Profile Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No profile media uploaded yet</p>
                  {isOwnProfile && (
                    <Button className="mt-4" variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Media
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="space-y-6">
            {/* Membership Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type</span>
                  <Badge className={membershipBadgeColor}>
                    {currentProfile.membership_type || 'Basic'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-sm text-green-600">Active</span>
                </div>
                {currentProfile.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Member Since</span>
                    <span className="text-sm text-gray-600">
                      {new Date(currentProfile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Profile visibility and privacy settings will be available here.
                </p>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Account management options will be available here.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 