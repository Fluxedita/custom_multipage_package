"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Heart, 
  Calendar, 
  Award,
  Save,
  X,
  Edit3
} from 'lucide-react';

interface Member {
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

interface MemberEditFormProps {
  member: Member;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MemberEditForm({ member, onSuccess, onCancel }: MemberEditFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: member.first_name || '',
    last_name: member.last_name || '',
    full_name: member.full_name || '',
    username: member.username || '',
    email: member.email || '',
    bio: member.bio || '',
    bio_message: member.bio_message || '',
    age: member.age?.toString() || '',
    city: member.city || '',
    country: member.country || '',
    occupation: member.occupation || '',
    hobbies: member.hobbies || '',
    video_intro_url: member.video_intro_url || '',
    additional_notes: member.additional_notes || '',
    membership_type: member.membership_type || 'basic'
  });

  useEffect(() => {
    setFormData({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      full_name: member.full_name || '',
      username: member.username || '',
      email: member.email || '',
      bio: member.bio || '',
      bio_message: member.bio_message || '',
      age: member.age?.toString() || '',
      city: member.city || '',
      country: member.country || '',
      occupation: member.occupation || '',
      hobbies: member.hobbies || '',
      video_intro_url: member.video_intro_url || '',
      additional_notes: member.additional_notes || '',
      membership_type: member.membership_type || 'basic'
    });
  }, [member]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/members/${member.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member');
      }

      toast({
        title: "Member updated",
        description: "Member information has been updated successfully.",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Edit3 className="h-5 w-5 mr-2" />
          Edit Member: {member.full_name || member.username || 'Unknown'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <User className="h-4 w-4 mr-2" />
              Basic Information
            </h3>
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
          </div>

          {/* Location & Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Location & Details
            </h3>
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
          </div>

          {/* About Me */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              About Me
            </h3>
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
                placeholder="Any additional information..."
                rows={3}
              />
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Media
            </h3>
            <div>
              <Label htmlFor="video_intro_url">Video Introduction URL</Label>
              <Input
                id="video_intro_url"
                value={formData.video_intro_url}
                onChange={(e) => handleInputChange('video_intro_url', e.target.value)}
                placeholder="Enter video URL"
              />
            </div>
          </div>

          {/* Membership */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Membership
            </h3>
            <div>
              <Label htmlFor="membership_type">Membership Type</Label>
              <Select
                value={formData.membership_type}
                onValueChange={(value) => handleInputChange('membership_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select membership type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 