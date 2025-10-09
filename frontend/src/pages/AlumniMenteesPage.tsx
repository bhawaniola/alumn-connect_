import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Loader2, User, Check, X, Mail, Eye } from 'lucide-react'
import { ProfileModal } from '../components/ProfileModal'

interface RequestItem {
  id: number
  message: string
  status: string
  created_at: string
  other_user_name: string
  other_user_email: string
  other_user_id?: number
}

export const AlumniMenteesPage: React.FC = () => {
  const { token, user, isLoading } = useAuth()
  const [items, setItems] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [profileUserId, setProfileUserId] = useState<number | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const openProfileForMentee = async (item: RequestItem) => {
    if (item.other_user_id) {
      setProfileUserId(item.other_user_id)
      setIsProfileOpen(true)
      return
    }
    // Fallback via available users endpoint by email
    try {
      const res = await fetch('https://alumconnect-s4c7.onrender.com/api/messages/available-users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const users = await res.json()
        const match = users.find((u: any) => u.email && u.email.toLowerCase() === item.other_user_email.toLowerCase())
        if (match?.id) {
          setProfileUserId(match.id)
          setIsProfileOpen(true)
        } else {
          alert('Unable to find user profile for this mentee.')
        }
      }
    } catch (e) {
      console.error('Failed to resolve user by email', e)
      alert('Unable to open profile right now.')
    }
  }

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      
      try {
        // console.log('Fetching mentorship requests...')
        const res = await fetch('https://alumconnect-s4c7.onrender.com/api/mentorship/requests', {
          headers: { Authorization: `Bearer ${token}` },
        })
        // console.log('Response status:', res.status)
        
        if (res.ok) {
          const data = await res.json()
          // console.log('Mentorship requests data:', data)
          setItems(data)
        } else {
          const error = await res.json()
          console.error('Error fetching mentorship requests:', error)
        }
      } catch (error) {
        console.error('Failed to fetch mentorship requests:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const handleMentorshipRequest = async (requestId: number, action: 'accept' | 'decline') => {
    if (!token) return
    
    setProcessing(requestId)
    try {
      const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/mentorship/${requestId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (res.ok) {
        // Update the request status in the local state
        setItems(prev => prev.map(item => 
          item.id === requestId ? { ...item, status: action === 'accept' ? 'accepted' : 'declined' } : item
        ))
      }
    } finally {
      setProcessing(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access this page.</p>
      </div>
    )
  }

  if (user.role !== 'alumni') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Only alumni can view mentee requests.</p>
      </div>
    )
  }

  const pendingRequests = items.filter(r => r.status === 'pending')
  const processedRequests = items.filter(r => r.status !== 'pending')

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mentee Requests</h1>
          <p className="text-muted-foreground">Manage mentorship requests from students</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pending Requests ({pendingRequests.length})</h2>
                <div className="space-y-4">
                  {pendingRequests.map((r) => (
                    <Card key={r.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{r.other_user_name}</p>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">{r.other_user_email}</p>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {r.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {r.message && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm">{r.message}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Requested on {new Date(r.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openProfileForMentee(r)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View Profile
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleMentorshipRequest(r.id, 'decline')}
                                disabled={processing === r.id}
                              >
                                {processing === r.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <X className="mr-1 h-3 w-3" />
                                    Decline
                                  </>
                                )}
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleMentorshipRequest(r.id, 'accept')}
                                disabled={processing === r.id}
                              >
                                {processing === r.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="mr-1 h-3 w-3" />
                                    Accept
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Processed Requests */}
            {processedRequests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Processed Requests ({processedRequests.length})</h2>
                <div className="space-y-4">
                  {processedRequests.map((r) => (
                    <Card key={r.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{r.other_user_name}</p>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">{r.other_user_email}</p>
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={r.status === 'accepted' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {r.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {r.message && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm">{r.message}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Requested on {new Date(r.created_at).toLocaleDateString()}
                            </span>
                            <div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openProfileForMentee(r)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {items.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No requests yet</CardTitle>
                  <CardDescription>Students will contact you here for mentorship.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        )}
      </div>
      {profileUserId && (
        <ProfileModal
          userId={profileUserId}
          isOpen={isProfileOpen}
          onClose={() => { setIsProfileOpen(false); setProfileUserId(null) }}
        />
      )}
    </div>
  )
}


