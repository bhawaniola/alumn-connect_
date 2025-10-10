import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Loader2, User, Check, X, Mail, CheckCircle } from 'lucide-react'
import { FeedbackModal } from '../components/FeedbackModal'

interface ProjectApplication {
  id: number
  message: string
  status: string
  created_at: string
  project_title: string
  project_id: number
  student_name: string
  student_email: string
  is_completed?: boolean
  completed_at?: string
  feedback?: string
}

export const AlumniProjectApplicationsPage: React.FC = () => {
  const { token, user, isLoading } = useAuth()
  const [applications, setApplications] = useState<ProjectApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean
    applicationId: number | null
    studentName: string
    projectTitle: string
  }>({
    isOpen: false,
    applicationId: null,
    studentName: '',
    projectTitle: ''
  })

  useEffect(() => {
    const loadApplications = async () => {
      if (!token) return
      
      try {
        const res = await fetch('https://alumconnect-s4c7.onrender.com/api/alumni/project-applications', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setApplications(data)
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadApplications()
  }, [token])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const handleApplication = async (applicationId: number, action: 'accept' | 'decline') => {
    if (!token) return
    
    setProcessing(applicationId)
    try {
      const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/project-applications/${applicationId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (res.ok) {
        // Update the application status in the local state
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status: action === 'accept' ? 'accepted' : 'declined' } : app
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
        <p className="text-muted-foreground">Only alumni can view project applications.</p>
      </div>
    )
  }

  const pendingApplications = applications.filter(app => app.status === 'pending')
  const processedApplications = applications.filter(app => app.status !== 'pending')

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Project Applications</h1>
          <p className="text-muted-foreground">Review and manage applications for your projects.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Applications */}
            {pendingApplications.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pending Applications ({pendingApplications.length})</h2>
                <div className="space-y-4">
                  {pendingApplications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{application.project_title}</CardTitle>
                            <CardDescription>Application from {application.student_name}</CardDescription>
                          </div>
                          <Badge variant="outline" className="capitalize">{application.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{application.student_name}</span>
                            <Mail className="h-4 w-4 text-muted-foreground ml-2" />
                            <span className="text-sm text-muted-foreground">{application.student_email}</span>
                          </div>
                          
                          {application.message && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm">{application.message}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Applied on {new Date(application.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleApplication(application.id, 'decline')}
                                disabled={processing === application.id}
                              >
                                {processing === application.id ? (
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
                                onClick={() => handleApplication(application.id, 'accept')}
                                disabled={processing === application.id}
                              >
                                {processing === application.id ? (
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

            {/* Processed Applications */}
            {processedApplications.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Processed Applications ({processedApplications.length})</h2>
                <div className="space-y-4">
                  {processedApplications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{application.project_title}</CardTitle>
                            <CardDescription>Application from {application.student_name}</CardDescription>
                          </div>
                          <Badge 
                            variant={application.status === 'accepted' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {application.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{application.student_name}</span>
                            <Mail className="h-4 w-4 text-muted-foreground ml-2" />
                            <span className="text-sm text-muted-foreground">{application.student_email}</span>
                          </div>
                          
                          {application.message && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm">{application.message}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Applied on {new Date(application.created_at).toLocaleDateString()}
                              {application.is_completed && application.completed_at && (
                                <span className="ml-2 text-green-600">
                                  • Completed on {new Date(application.completed_at).toLocaleDateString()}
                                </span>
                              )}
                            </span>
                            {application.status === 'accepted' && !application.is_completed && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                onClick={() => setFeedbackModal({
                                  isOpen: true,
                                  applicationId: application.id,
                                  studentName: application.student_name,
                                  projectTitle: application.project_title
                                })}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Mark as Completed
                              </Button>
                            )}
                          </div>
                          {application.is_completed && application.feedback && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-xs font-medium text-green-800 mb-1">Your Feedback:</p>
                              <p className="text-sm text-gray-700">{application.feedback}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {applications.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No applications yet</CardTitle>
                  <CardDescription>Applications for your projects will appear here.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModal.applicationId && (
        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          onClose={() => setFeedbackModal({
            isOpen: false,
            applicationId: null,
            studentName: '',
            projectTitle: ''
          })}
          applicationId={feedbackModal.applicationId}
          studentName={feedbackModal.studentName}
          projectTitle={feedbackModal.projectTitle}
          onSuccess={() => {
            // Reload applications to show updated status
            const loadApplications = async () => {
              if (!token) return
              try {
                const res = await fetch('https://alumconnect-s4c7.onrender.com/api/alumni/project-applications', {
                  headers: { Authorization: `Bearer ${token}` },
                })
                if (res.ok) {
                  const data = await res.json()
                  setApplications(data)
                }
              } catch (error) {
                console.error('Error reloading applications:', error)
              }
            }
            loadApplications()
          }}
        />
      )}
    </div>
  )
}
