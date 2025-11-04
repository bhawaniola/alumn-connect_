import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Loader2, User, Check, X, Mail, ArrowLeft, Eye, CheckCircle, Users } from 'lucide-react'
import { ProfileModal } from '../components/ProfileModal'
import { FeedbackModal } from '../components/FeedbackModal'

interface ProjectApplication {
  id: number
  message: string
  status: string
  created_at: string
  student_name: string
  student_email: string
  student_id?: number
  is_completed?: boolean
  completed_at?: string
  feedback?: string
  has_team?: boolean
}

interface Project {
  id: number
  title: string
  description: string
}

export const ProjectApplicationsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { token, user, isLoading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [applications, setApplications] = useState<ProjectApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [profileUserId, setProfileUserId] = useState<number | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
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

  const openProfileForApplicant = async (app: ProjectApplication) => {
    if (app.student_id) {
      setProfileUserId(app.student_id)
      setIsProfileOpen(true)
      return
    }

    // Fallback: fetch available users and match by email to get the user id
    try {
      const res = await fetch('https://alumconnect-s4c7.onrender.com/api/messages/available-users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const users = await res.json()
        const match = users.find((u: any) => u.email && u.email.toLowerCase() === app.student_email.toLowerCase())
        if (match?.id) {
          setProfileUserId(match.id)
          setIsProfileOpen(true)
        } else {
          alert('Unable to find user profile for this applicant.')
        }
      }
    } catch (e) {
      console.error('Failed to resolve user by email', e)
      alert('Unable to open profile right now.')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      if (!token || !id) return
      
      try {
        // Load project details
        const projectRes = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects/${id}`)
        if (projectRes.ok) {
          const projectData = await projectRes.json()
          setProject(projectData)
        }

        // Load applications for this specific project
        const appsRes = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects/${id}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (appsRes.ok) {
          const appsData = await appsRes.json()
          setApplications(appsData)
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [token, id])

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

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
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

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  const pendingApplications = applications.filter(app => app.status === 'pending')
  const processedApplications = applications.filter(app => app.status !== 'pending')

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/alumni/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Applications for {project.title}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>

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
                          <CardTitle className="text-lg">Application from {application.student_name}</CardTitle>
                          <CardDescription>{application.student_email}</CardDescription>
                        </div>
                        <Badge variant="outline" className="capitalize">{application.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{application.student_name}</span>
                          <Mail className="h-4 w-4 text-muted-foreground ml-2" />
                          <span className="text-sm text-muted-foreground">{application.student_email}</span>
                          {application.has_team && (
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                              <Users className="h-3 w-3 mr-1" />
                              Has Team
                            </Badge>
                          )}
                        </div>
                        
                        {application.message && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Message:</p>
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
                              onClick={() => openProfileForApplicant(application)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View Profile
                            </Button>
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
                          <CardTitle className="text-lg">Application from {application.student_name}</CardTitle>
                          <CardDescription>{application.student_email}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={application.status === 'accepted' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {application.status}
                          </Badge>
                          {application.is_completed && (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{application.student_name}</span>
                          <Mail className="h-4 w-4 text-muted-foreground ml-2" />
                          <span className="text-sm text-muted-foreground">{application.student_email}</span>
                          {application.has_team && (
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                              <Users className="h-3 w-3 mr-1" />
                              Has Team
                            </Badge>
                          )}
                        </div>
                        
                        {application.message && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Message:</p>
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
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openProfileForApplicant(application)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View Profile
                            </Button>
                            {application.status === 'accepted' && !application.is_completed && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                onClick={() => setFeedbackModal({
                                  isOpen: true,
                                  applicationId: application.id,
                                  studentName: application.student_name,
                                  projectTitle: project?.title || ''
                                })}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Mark as Completed
                              </Button>
                            )}
                          </div>
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
                <CardDescription>Applications for this project will appear here.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
      {profileUserId && (
        <ProfileModal
          userId={profileUserId}
          isOpen={isProfileOpen}
          onClose={() => { setIsProfileOpen(false); setProfileUserId(null) }}
        />
      )}

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
          onSuccess={async () => {
            // Reload applications to show updated status
            if (!token || !id) return
            try {
              const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects/${id}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              if (res.ok) {
                const data = await res.json()
                setApplications(data)
              }
            } catch (error) {
              console.error('Error reloading applications:', error)
            }
          }}
        />
      )}
    </div>
  )
}

// Profile Modal Mount
// Render modal at root of component
