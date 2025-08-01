'use client'

import { useState, useEffect } from 'react'
import { DynamicPage } from '@/app/utils/dynamic-page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Check, X, Flag, Trash2, Edit, User, Calendar, MessageSquare } from 'lucide-react'
import supabase from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'


interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  is_flagged: boolean
  is_approved: boolean
  user: {
    id: string
    username: string
    avatar_url: string | null
    full_name: string | null
  }
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { user, session, loading: authLoading } = useAuth()

  const fetchComments = async () => {
    if (!session) {
      throw new Error('Not authenticated')
    }
    try {
      setLoading(true)
      
      const response = await fetch('/api/comments/admin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const transformedData = (data.comments || []).map((item: any) => ({
        id: item.id,
        content: item.content,
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_flagged: item.is_flagged,
        is_approved: item.is_approved,
        user: {
          id: item.user?.id || '',
          username: item.user?.username || '',
          avatar_url: item.user?.avatar_url || null,
          full_name: item.user?.full_name || null
        }
      }))
      
      setComments(transformedData)
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchComments()
      } else {
        toast.error('You must be logged in to view comments.')
        setLoading(false)
      }
    }
  }, [authLoading, user])

  const handleApproveComment = async (commentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      const response = await fetch('/api/comments/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          id: commentId,
          is_approved: true,
          is_flagged: false
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      toast.success('Comment approved')
      fetchComments()
    } catch (error) {
      console.error('Error approving comment:', error)
      toast.error('Failed to approve comment')
    }
  }

  const handleFlagComment = async (commentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      const response = await fetch('/api/comments/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          id: commentId,
          is_flagged: true,
          is_approved: false
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      toast.success('Comment flagged')
      fetchComments()
    } catch (error) {
      console.error('Error flagging comment:', error)
      toast.error('Failed to flag comment')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      const response = await fetch(`/api/comments/admin?id=${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      toast.success('Comment deleted')
      fetchComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const handleEditComment = async () => {
    if (!editingComment || !editContent.trim()) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      const response = await fetch('/api/comments/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          id: editingComment.id,
          content: editContent.trim()
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      toast.success('Comment updated')
      setIsEditDialogOpen(false)
      setEditingComment(null)
      setEditContent('')
      fetchComments()
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
    }
  }

  const openEditDialog = (comment: Comment) => {
    setEditingComment(comment)
    setEditContent(comment.content)
    setIsEditDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDisplayName = (user: any) => {
    return user.full_name || user.username || 'Unknown User'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const approvedComments = comments.filter(c => c.is_approved)
  const flaggedComments = comments.filter(c => c.is_flagged)
  const pendingComments = comments.filter(c => !c.is_approved && !c.is_flagged)

  if (authLoading) {
    return (
      <DynamicPage>
        <div className="flex justify-center items-center h-screen">
          <div className="text-2xl">Loading...</div>
        </div>
      </DynamicPage>
    )
  }

  return (
    <DynamicPage>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Comments Management</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{comments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedComments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged</CardTitle>
              <Flag className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{flaggedComments.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Flag className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingComments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Comments List */}
        <Card>
          <CardHeader>
            <CardTitle>All Comments</CardTitle>
            <CardDescription>Manage member comments and feedback</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No comments found
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 border rounded-lg ${
                      comment.is_flagged ? 'border-red-200 bg-red-50' :
                      !comment.is_approved ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Link href={`/profile/${comment.user.id}`}>
                          <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                            <AvatarImage src={comment.user.avatar_url || undefined} />
                            <AvatarFallback>
                              {getInitials(getDisplayName(comment.user))}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Link 
                              href={`/profile/${comment.user.id}`}
                              className="font-medium text-gray-900 hover:underline"
                            >
                              {getDisplayName(comment.user)}
                            </Link>
                            <Badge variant={comment.is_approved ? "default" : comment.is_flagged ? "destructive" : "secondary"}>
                              {comment.is_approved ? "Approved" : comment.is_flagged ? "Flagged" : "Pending"}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-700 mb-2">{comment.content}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(comment.created_at)}
                            </span>
                            {comment.updated_at !== comment.created_at && (
                              <span className="text-xs">(edited)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!comment.is_approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveComment(comment.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {!comment.is_flagged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFlagComment(comment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(comment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this comment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteComment(comment.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Comment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Comment</DialogTitle>
            </DialogHeader>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={5}
              className="mt-4"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditComment}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DynamicPage>
  )
}