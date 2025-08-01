'use client';

import { useEffect, useState } from 'react';
import { getAllMembers } from '../../app/actions/members';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';
import Link from 'next/link';

type Member = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export function PublicMembersList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const memberData = await getAllMembers();
      // For a public page, let's only show members who have a full name
      const filteredMembers = memberData.filter(m => m.name && m.name !== 'N/A');
      setMembers(filteredMembers);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  if (loading) {
    return <div>Loading members...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Our Members</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {members.map(member => (
          <Link href={`/profile/${member.id}`} key={member.id} legacyBehavior>
            <a className="cursor-pointer">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="flex flex-col items-center p-4">
                  <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={member.avatarUrl ?? undefined} alt={member.name} />
                    <AvatarFallback>
                      {member.name ? member.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-center">{member.name}</p>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
} 