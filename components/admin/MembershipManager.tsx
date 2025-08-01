"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  User, 
  Users, 
  Award,
  History,
  Edit3,
  Save,
  X,
  Clock,
  UserCheck
} from 'lucide-react';

interface MembershipHistory {
  id: string;
  user_id: string;
  old_membership_type: string | null;
  new_membership_type: string;
  changed_by: string;
  reason: string | null;
  effective_date: string;
  created_at: string;
  changed_by_user: {
    full_name: string | null;
    username: string | null;
  } | null;
}

interface MembershipManagerProps {
  userId: string;
  currentMembership: string;
  userName: string;
  onMembershipUpdated?: () => void;
}

export default function MembershipManager({ 
  userId, 
  currentMembership, 
  userName,
  onMembershipUpdated 
}: MembershipManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [membershipHistory, setMembershipHistory] = useState<MembershipHistory[]>([]);
  const [formData, setFormData] = useState({
    new_membership_type: currentMembership,
    reason: ''
  });

  const membershipColors = {
    basic: 'bg-blue-100 text-blue-800',
    premium: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800'
  };

  const membershipIcons = {
    basic: User,
    premium: Crown,
    admin: Award
  };

  const fetchMembershipHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const response = await fetch(`/api/admin/membership?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMembershipHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching membership history:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      fetchMembershipHistory();
    }
  }, [isDialogOpen, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          new_membership_type: formData.new_membership_type,
          reason: formData.reason || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update membership');
      }

      const data = await response.json();
      
      toast({
        title: "Membership Updated",
        description: `${userName}'s membership has been updated to ${formData.new_membership_type.toUpperCase()}.`,
      });

      setIsDialogOpen(false);
      setFormData({ new_membership_type: formData.new_membership_type, reason: '' });
      onMembershipUpdated?.();
      
      // Refresh history
      fetchMembershipHistory();

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update membership",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ new_membership_type: currentMembership, reason: '' });
    setIsDialogOpen(false);
  };

  const CurrentMembershipIcon = membershipIcons[currentMembership as keyof typeof membershipIcons] || User;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit3 className="h-4 w-4 mr-2" />
          Manage Membership
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Manage Membership: {userName}
          </DialogTitle>
          <DialogDescription>
            Update membership level and view change history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Membership Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CurrentMembershipIcon className="h-5 w-5 mr-2" />
                Current Membership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Badge className={membershipColors[currentMembership as keyof typeof membershipColors]}>
                  {currentMembership.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-600">
                  Active membership level
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Membership Update Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Edit3 className="h-5 w-5 mr-2" />
                Update Membership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="new_membership_type">New Membership Level</Label>
                  <Select
                    value={formData.new_membership_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, new_membership_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select membership type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Basic
                        </div>
                      </SelectItem>
                      <SelectItem value="premium">
                        <div className="flex items-center">
                          <Crown className="h-4 w-4 mr-2" />
                          Premium
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reason">Reason for Change (Optional)</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Document the reason for this membership change..."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || formData.new_membership_type === currentMembership}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Updating...' : 'Update Membership'}
                  </Button>
                </DialogFooter>
              </form>
            </CardContent>
          </Card>

          {/* Membership History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <History className="h-5 w-5 mr-2" />
                Membership History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isHistoryLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading history...</p>
                </div>
              ) : membershipHistory.length > 0 ? (
                <div className="space-y-3">
                  {membershipHistory.map((change) => {
                    const Icon = membershipIcons[change.new_membership_type as keyof typeof membershipIcons] || User;
                    return (
                      <div key={change.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge className={membershipColors[change.new_membership_type as keyof typeof membershipColors]}>
                                {change.new_membership_type.toUpperCase()}
                              </Badge>
                              {change.old_membership_type && (
                                <>
                                  <span className="text-gray-400">→</span>
                                  <Badge variant="outline">
                                    {change.old_membership_type.toUpperCase()}
                                  </Badge>
                                </>
                              )}
                            </div>
                            {change.reason && (
                              <p className="text-sm text-gray-600 mt-1">{change.reason}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(change.effective_date).toLocaleDateString()}
                          </div>
                          {change.changed_by_user && (
                            <div className="flex items-center mt-1">
                              <UserCheck className="h-3 w-3 mr-1" />
                              {change.changed_by_user.full_name || change.changed_by_user.username || 'Unknown'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No membership changes recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 