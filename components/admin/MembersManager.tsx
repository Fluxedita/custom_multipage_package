"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter } from "lucide-react"
import { getAllMembers } from "../../app/actions/members"
import AddMemberForm from "./AddMemberForm"
import { NewMembersTable } from "./NewMembersTable"

type Member = {
  id: string;
  name: string;
  email: string | undefined;
  status: string;
  subscription: string;
  joinDate: string;
}

export function MembersManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMembers = async () => {
    setLoading(true);
    const memberData = await getAllMembers();
    setMembers(memberData);
    setLoading(false);
  };

  useEffect(() => {
    refreshMembers();
  }, [])

  const handleDelete = (id: string) => {
    // In a real application, you would delete the member from your backend
    console.log(`Delete member with id: ${id}`)
  }

  const handleAddNew = () => {
    // In a real application, you would open a form to add a new member
    console.log("Add new member")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>Loading member data...</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please wait.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>Manage your site members and their access</CardDescription>
          </div>
          <AddMemberForm onSuccess={refreshMembers} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search members..." className="pl-8" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <NewMembersTable />
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t px-6 py-4">
        <div className="text-sm text-muted-foreground">
          Showing <strong>{members.length}</strong> of <strong>{members.length}</strong> members
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
