'use client';

import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Briefcase, 
  Music, 
  Film, 
  Book, 
  Coffee, 
  Heart, 
  Users, 
  Star,
  PersonStanding,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Camera,
  Video,
  Tag,
  Award,
  Target,
  Lightbulb,
  Zap,
  User
} from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Member {
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
  profile_media?: string[];
  avatar_url?: string;
  banner_url?: string;
  membership?: string;
  membership_type?: string;
  created_at?: string;
  updated_at?: string;
  video_intro_url?: string;
  additional_notes?: string;
  first_name?: string;
  last_name?: string;
  bio_message?: string;
}

interface PublicProfileProps {
  member: Member;
  isAdmin?: boolean;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-center space-x-3 py-2">
      <Icon className="h-5 w-5 text-gray-400" />
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{value}</p>
      </div>
    </div>
  );
};

const MediaItem = ({ url, type }: { url: string; type: 'image' | 'video' }) => {
  return (
    <div className="relative group rounded-lg overflow-hidden bg-gray-100">
      {type === 'image' ? (
        <img 
          src={url} 
          alt="Profile media" 
          className="w-full h-48 object-cover"
        />
      ) : (
        <video 
          src={url} 
          className="w-full h-48 object-cover"
          controls
        />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
        {type === 'image' ? (
          <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        ) : (
          <Video className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );
};

export default function PublicProfile({ member, isAdmin = false }: PublicProfileProps) {
  const displayName = member.full_name || member.username || 'Anonymous User';
  const membershipBadgeColor = member.membership_type === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="relative">
        {/* Banner Image */}
        {member.banner_url && (
          <div className="h-48 rounded-lg overflow-hidden mb-4">
            <img 
              src={member.banner_url} 
              alt="Profile banner" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Profile Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="relative">
            {member.avatar_url ? (
              <img 
                src={member.avatar_url} 
                alt={displayName} 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <Badge className={`absolute -bottom-2 -right-2 ${membershipBadgeColor}`}>
              {member.membership_type || 'Basic'}
            </Badge>
          </div>
          
          {/* Basic Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
            {member.occupation && (
              <p className="text-lg text-gray-600 mt-1">{member.occupation}</p>
            )}
            {(member.city || member.country) && (
              <p className="text-gray-500 mt-1 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {[member.city, member.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {member.bio_message || member.bio ? (
                <p className="text-gray-700 leading-relaxed">
                  {member.bio_message || member.bio}
                </p>
              ) : (
                <p className="text-gray-500 italic">No bio available</p>
              )}
              
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <DetailItem icon={Calendar} label="Age" value={member.age?.toString()} />
                <DetailItem icon={MapPin} label="Location" value={[member.city, member.country].filter(Boolean).join(', ')} />
                <DetailItem icon={Briefcase} label="Occupation" value={member.occupation} />
                <DetailItem icon={Star} label="Member Since" value={member.created_at ? new Date(member.created_at).toLocaleDateString() : undefined} />
              </div>
            </CardContent>
          </Card>

          {/* Hobbies & Interests */}
          {member.hobbies && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Hobbies & Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{member.hobbies}</p>
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          {member.additional_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{member.additional_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Profile Media */}
          {member.profile_media && member.profile_media.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Profile Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {member.profile_media.map((url, index) => (
                    <MediaItem 
                      key={index} 
                      url={url} 
                      type={url.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image'} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Introduction */}
          {member.video_intro_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  Video Introduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <video 
                  src={member.video_intro_url} 
                  className="w-full rounded-lg"
                  controls
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Contact & Membership */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{member.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Available for messages</span>
              </div>
            </CardContent>
          </Card>

          {/* Membership Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Membership
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type</span>
                <Badge className={membershipBadgeColor}>
                  {member.membership_type || 'Basic'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <span className="text-sm text-green-600">Active</span>
              </div>
              {member.created_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Member Since</span>
                  <span className="text-sm text-gray-600">
                    {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button className="w-full" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Add to Favorites
              </Button>
              {isAdmin && (
                <Button className="w-full" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Admin Actions
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 