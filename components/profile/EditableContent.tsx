"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Heart, 
  Calendar, 
  Mail, 
  Globe,
  Camera,
  Video,
  Save,
  X,
  Edit3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditableContentProps {
  profile: {
    id: string;
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
  };
  onSave: (data: any) => Promise<void>;
  isEditing: boolean;
  onEditToggle: () => void;
}

export default function EditableContent({ 
  profile, 
  onSave, 
  isEditing, 
  onEditToggle 
}: EditableContentProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    username: profile.username || '',
    email: profile.email || '',
    bio: profile.bio || '',
    bio_message: profile.bio_message || '',
    age: profile.age || '',
    city: profile.city || '',
    country: profile.country || '',
    occupation: profile.occupation || '',
    hobbies: profile.hobbies || '',
    video_intro_url: profile.video_intro_url || '',
    additional_notes: profile.additional_notes || '',
    first_name: profile.first_name || '',
    last_name: profile.last_name || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        age: formData.age ? parseInt(formData.age as string) : null
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
      onEditToggle();
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

  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name || '',
      username: profile.username || '',
      email: profile.email || '',
      bio: profile.bio || '',
      bio_message: profile.bio_message || '',
      age: profile.age || '',
      city: profile.city || '',
      country: profile.country || '',
      occupation: profile.occupation || '',
      hobbies: profile.hobbies || '',
      video_intro_url: profile.video_intro_url || '',
      additional_notes: profile.additional_notes || '',
      first_name: profile.first_name || '',
      last_name: profile.last_name || ''
    });
    onEditToggle();
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location & Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Enter age"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Enter country"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="Enter occupation"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              About Me
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="bio_message">Detailed Bio</Label>
              <Textarea
                id="bio_message"
                value={formData.bio_message}
                onChange={(e) => handleInputChange('bio_message', e.target.value)}
                placeholder="Share your story in detail..."
                rows={5}
              />
            </div>
            <div>
              <Label htmlFor="hobbies">Hobbies & Interests</Label>
              <Textarea
                id="hobbies"
                value={formData.hobbies}
                onChange={(e) => handleInputChange('hobbies', e.target.value)}
                placeholder="What are your hobbies and interests?"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="additional_notes">Additional Notes</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                placeholder="Any additional information you'd like to share..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video_intro_url">Video Introduction URL</Label>
              <Input
                id="video_intro_url"
                value={formData.video_intro_url}
                onChange={(e) => handleInputChange('video_intro_url', e.target.value)}
                placeholder="Enter video URL"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Basic Information
            </div>
            <Button variant="outline" size="sm" onClick={onEditToggle}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">First Name</Label>
              <p className="text-gray-900">{profile.first_name || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Last Name</Label>
              <p className="text-gray-900">{profile.last_name || 'Not provided'}</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Full Name</Label>
            <p className="text-gray-900">{profile.full_name || 'Not provided'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Username</Label>
            <p className="text-gray-900">{profile.username || 'Not provided'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Email</Label>
            <p className="text-gray-900">{profile.email || 'Not provided'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location & Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Age</Label>
              <p className="text-gray-900">{profile.age || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">City</Label>
              <p className="text-gray-900">{profile.city || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Country</Label>
              <p className="text-gray-900">{profile.country || 'Not provided'}</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Occupation</Label>
            <p className="text-gray-900">{profile.occupation || 'Not provided'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            About Me
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Short Bio</Label>
            <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Detailed Bio</Label>
            <p className="text-gray-900">{profile.bio_message || 'No detailed bio provided'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Hobbies & Interests</Label>
            <p className="text-gray-900">{profile.hobbies || 'No hobbies listed'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Additional Notes</Label>
            <p className="text-gray-900">{profile.additional_notes || 'No additional notes'}</p>
          </div>
        </CardContent>
      </Card>

      {profile.video_intro_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Video Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <video 
              src={profile.video_intro_url} 
              className="w-full rounded-lg"
              controls
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
