'use client'

import { useEffect, useState } from 'react'
import { getAllMembers } from '../../app/actions/members'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

type Member = {
  id: string;
  name: string;
  email?: string;
  avatarUrl: string | null;
  role: string;
  subscription: string;
  status: string;
  joinDate: string;
}

export function NewMembersTable() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true)
      try {
        const memberData = await getAllMembers()
        console.log('NewMembersTable - Fetched members:', memberData)
        
        const processedMembers = memberData.map(member => ({
          id: member.id,
          name: member.full_name || member.username || 'Anonymous',
          email: member.email,
          avatarUrl: member.avatar_url || null,
          role: member.role || 'standard',
          subscription: 'none',
          status: 'active',
          joinDate: member.created_at ? new Date(member.created_at).toLocaleDateString() : '',
        }))
        
        setMembers(processedMembers)
      } catch (error) {
        console.error('Error fetching members:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMembers()
  }, [])

  if (loading) {
    return <div className="p-4 text-center">Loading members...</div>
  }

  return (
    <div className="mt-12 border rounded-lg overflow-hidden">
      <h3 className="bg-gray-100 p-4 font-semibold">New Members Table (Debug View)</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-100">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={member.avatarUrl || undefined} 
                        alt={member.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      <AvatarFallback className="text-xs">
                        {member.name ? member.name.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {member.name}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {member.email}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-center">
                  <Badge 
                    variant={member.role === 'admin' ? 'default' : 'secondary'} 
                    className="text-xs font-medium capitalize"
                  >
                    {member.role}
                  </Badge>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <Badge variant="outline" className="capitalize text-xs">
                    {member.subscription}
                  </Badge>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Badge 
                    variant={member.status === 'active' ? 'default' : 'outline'} 
                    className="capitalize text-xs"
                  >
                    {member.status}
                  </Badge>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {member.joinDate}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/members/${member.id}`} className="w-full cursor-pointer">
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/members/${member.id}?edit=true`} className="w-full cursor-pointer">
                          Edit Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this member?')) {
                            console.log(`Delete member with id: ${member.id}`);
                            // In a real app, you would call your delete API here
                          }
                        }}
                        className="text-red-600 cursor-pointer"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
