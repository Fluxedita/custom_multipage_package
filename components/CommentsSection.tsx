'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, MessageSquare, Calendar, User, ThumbsUp, ThumbsDown, Flag, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import supabase from '@/lib/supabase/client'

interface CommentUser {
  user_id?: string;
  id?: string;
  username?: string;
  avatar_url?: string | null;
  full_name?: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_flagged: boolean;
  is_approved: boolean;
  user?: CommentUser;
  profiles?: CommentUser;
  user_id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
}

interface CommentsSectionProps {
  title?: string
  description?: string
  className?: string
  pageSlug?: string
}

export default function CommentsSection({ 
  title = "Comments & Feedback", 
  description = "Share your thoughts, feedback, or content requests with the community.",
  className = "",
  pageSlug = window.location.pathname // Default to current path
}: CommentsSectionProps) {
  const { user, isAdmin, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  // Initialize user data
  const [userAvatar, setUserAvatar] = useState('')
  const [userName, setUserName] = useState('')
  const [userInitials, setUserInitials] = useState('')

  // Update user data when user changes
  useEffect(() => {
    if (user) {
      const avatar = user?.user_metadata?.avatar_url || 
                   user?.identities?.[0]?.identity_data?.avatar_url ||
                   ''
      
      const name = user?.user_metadata?.full_name || 
                 user?.identities?.[0]?.identity_data?.full_name || 
                 user?.email?.split('@')[0] || 
                 'Anonymous User'
      
      const initials = name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      
      setUserAvatar(avatar)
      setUserName(name)
      setUserInitials(initials)
      
      console.log('Current user data:', {
        user,
        userAvatar: avatar,
        userName: name,
        userInitials: initials
      })
    }
  }, [user])

  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(true)

  useEffect(() => {
    console.log('CommentsSection - Auth state:', { user, isAdmin })
    const loadData = async () => {
      try {
        await fetchComments()
      } catch (error) {
        console.error('Error loading comments:', error)
      }
    }
    loadData()
  }, [pageSlug]) // Refetch when pageSlug changes

  useEffect(() => {
    console.log('User in CommentsSection:', user);
    supabase.auth.getSession().then(console.log);
  }, [user]);

  const fetchComments = async (): Promise<Comment[]> => {
    try {
      setCommentsLoading(true)
      console.log('Fetching comments from /api/comments/simple')
      
      const response = await fetch(`/api/comments/simple?pageSlug=${pageSlug}`)
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      
      const data = await response.json()
      console.log('Fetched comments:', data.comments?.length || 0, 'comments')
      const comments = Array.isArray(data.comments) ? data.comments : []
      setComments(comments)
      return comments
      
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
      setComments([])
      return []
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmitComment called, preventDefault done');
    
    const commentContent = newComment.trim()
    if (!commentContent) {
      toast.error('Please enter a comment')
      return
    }

    try {
      setSubmitting(true)
      
      // Simple check for user existence
      if (!user) {
        console.log('No user found, redirecting to login')
        toast.error('Please log in to post a comment')
        window.location.href = '/auth/login?redirectedFrom=' + encodeURIComponent(window.location.pathname)
        return
      }

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Session:', session, 'SessionError:', sessionError)
      
      // If we can't get a session, force a logout and redirect
      if (sessionError || !session?.access_token) {
        console.log('Session error or missing token:', sessionError)
        await supabase.auth.signOut()
        toast.error('Your session has expired. Please log in again.')
        window.location.href = '/auth/login?redirectedFrom=' + encodeURIComponent(window.location.pathname)
        return
      }
      
      // Ensure we have a valid user
      const currentUser = session.user
      if (!currentUser) {
        console.log('No user in session')
        await supabase.auth.signOut()
        toast.error('Error getting user information. Please log in again.')
        window.location.href = '/auth/login?redirectedFrom=' + encodeURIComponent(window.location.pathname)
        return
      }
      
      // Prepare the request headers with the access token
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
      
      console.log('Attempting to post comment with token:', {
        tokenPrefix: session.access_token?.substring(0, 10) + '...',
        tokenLength: session.access_token?.length
      })
      
      console.log('About to POST to /api/comments')
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          content: commentContent,
          pageSlug: window.location.pathname
        })
      })

      console.log('Comment API response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        
        if (response.status === 401) {
          toast.error('Your session has expired. Please log in again.')
          await supabase.auth.signOut()
          window.location.href = '/auth/login?redirectedFrom=' + encodeURIComponent(window.location.pathname)
          return
        }
        
        throw new Error(errorData.error || `Failed to post comment: ${response.status} ${response.statusText}`)
      }
      
      const responseData = await response.json()
      console.log('Comment posted successfully:', responseData)
      
      // Update the comments list with the new comment
      setComments(prevComments => [responseData, ...prevComments])
      setNewComment('')
      toast.success('Comment posted successfully!')
      
      console.log('POST to /api/comments finished', response)
      
    } catch (error) {
      console.error('Error in handleSubmitComment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
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

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Debug info */}
          <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
            Debug: User = {user ? 'Logged in' : 'Not logged in'} | Admin = {isAdmin ? 'Yes' : 'No'}
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Avatar>
                    {userAvatar ? (
                      <AvatarImage src={userAvatar} alt={user?.email || 'User'} />
                    ) : (
                      <AvatarFallback>{userInitials || 'U'}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts, feedback, or content requests..."
                    rows={3}
                    maxLength={1000}
                    disabled={submitting}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {newComment.length}/1000 characters
                    </span>
                    <Button 
                      type="submit" 
                      disabled={submitting || !newComment.trim()}
                      size="sm"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 border rounded-lg bg-gray-50">
              <p className="text-gray-600 mb-2">Please log in to post a comment</p>
              <Link href="/auth/login">
                <Button size="sm">Log In</Button>
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Comments</h3>
            
            {commentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => {
                  // Fallback: use comment.profiles if comment.user is undefined
                  const commentUser = comment.user || comment.profiles || {};
                  const commentUserId = commentUser.user_id || commentUser.id || '';
                  const commentUserName = commentUser.full_name || commentUser.username || 'Anonymous';
                  const commentUserAvatar = commentUser.avatar_url || null;
                  const commentDate = new Date(comment.created_at);
                  const formattedDate = commentDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  return (
                    <div key={comment.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Link href={`/profile/${commentUserId}`}>
                        <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
                          <AvatarImage 
                            src={commentUserAvatar || undefined} 
                            alt={commentUserName} 
                          />
                          <AvatarFallback>
                            {(commentUserName)
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Link 
                            href={`/profile/${commentUserId}`}
                            className="font-medium text-gray-900 hover:underline"
                          >
                            {commentUserName}
                          </Link>
                          {isAdmin && (
                            <Badge variant="outline" className="text-xs">
                              {comment.is_approved ? 'Approved' : 'Pending'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2 break-words">{comment.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formattedDate}
                          </span>
                          {comment.updated_at !== comment.created_at && (
                            <span className="text-xs">(edited)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
 );
}