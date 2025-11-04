import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Loader2, User, Check, X, Mail, CheckCircle, ArrowLeft, Users } from 'lucide-react'
import { FeedbackModal } from '../components/FeedbackModal'

interface ProjectApplication {
  id: number
  message: string
  status: string
  created_at: string
  student_id: number
  student_name: string
  student_email: string
  position_id?: number
  position_title?: string
  is_completed?: boolean
  completed_at?: string
  feedback?: string
  has_team?: boolean
}

interface Project {
  id: number
  title: string
  description: string
  category: string
  status: string
}

export const ProjectApplicationsDetailPage: React.FC = () => {
  const { projectId } = useParams()
  const { token, user, isLoading } = useAuth()
  const [applications, setApplications] = useState<ProjectApplication[]>([])
  const [project, setProject] = useState<Project | null>(null)
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
    const loadData = async () => {
      if (!token || !projectId) return
      
      try {
        // Load project details
        const projectRes = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (projectRes.ok) {
          const projectData = await projectRes.json()
          setProject(projectData)
        }

        // Load applications
        const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects/${projectId}/applications`, {
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
    
    loadData()
  }, [token, projectId])

  const handleApplication = async (applicationId: number, action: 'accept' | 'decline') => {
    if (!token) return
    
    setProcessing(applicationId)
    try {
      const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/project-applications/${applicationId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (res.ok) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status: action === 'accept' ? 'accepted' : 'declined' } : app
        ))
      }
    } finally {
      setProcessing(null)
    }
  }

  const reloadApplications = async () => {
    if (!token || !projectId) return
    try {
      const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects/${projectId}/applications`, {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!user || user.role !== 'alumni') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Only alumni can view project applications.</p>
      </div>
    )
  }

  const pendingApplications = applications.filter(app => app.status === 'pending')
  const acceptedApplications = applications.filter(app => app.status === 'accepted')
  const declinedApplications = applications.filter(app => app.status === 'declined')

  // Group applications by position for better organization
  const groupByPosition = (apps: ProjectApplication[]) => {
    const grouped: Record<string, ProjectApplication[]> = {}
    apps.forEach(app => {
      const key = app.position_title || 'General Application'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(app)
    })
    return grouped
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/alumni/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          
          {project && (
            <div className="mb-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {project.title}
              </h1>
              <p className="text-gray-600">Manage applications for this project</p>
            </div>
          )}

          {/* Summary Stats */}
          {!loading && applications.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-700 font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-900">{pendingApplications.length}</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700 font-medium">Accepted</p>
                <p className="text-3xl font-bold text-green-900">{acceptedApplications.length}</p>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium">Declined</p>
                <p className="text-3xl font-bold text-red-900">{declinedApplications.length}</p>
              </div>
            </div>
          )}
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
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                  Pending Applications ({pendingApplications.length})
                </h2>
                <div className="space-y-6">
                  {Object.entries(groupByPosition(pendingApplications)).map(([positionTitle, apps]) => (
                    <div key={positionTitle} className="space-y-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{positionTitle}</h3>
                          <p className="text-sm text-gray-500">{apps.length} application{apps.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      {apps.map((application) => (
                    <Card key={application.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{application.student_name}</CardTitle>
                            <CardDescription className="flex items-center space-x-2 mt-1">
                              <Mail className="h-3 w-3" />
                              <span>{application.student_email}</span>
                            </CardDescription>
                            {application.has_team && (
                              <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
                                <Users className="h-3 w-3 mr-1" />
                                Has Team
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="capitalize">{application.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {application.message && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-xs font-medium text-gray-500 mb-1">Message:</p>
                              <p className="text-sm">{application.message}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-2">
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
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Applications */}
            {acceptedApplications.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                  Accepted Applications ({acceptedApplications.length})
                </h2>
                <div className="space-y-4">
                  {acceptedApplications.map((application) => (
                    <Card key={application.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{application.student_name}</CardTitle>
                            <CardDescription className="flex items-center space-x-2 mt-1">
                              <Mail className="h-3 w-3" />
                              <span>{application.student_email}</span>
                            </CardDescription>
                            {application.has_team && (
                              <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
                                <Users className="h-3 w-3 mr-1" />
                                Has Team
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="default" className="capitalize">{application.status}</Badge>
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
                          {application.position_title && (
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <p className="text-xs font-medium text-gray-500">Position:</p>
                              <p className="text-sm font-semibold text-gray-900">{application.position_title}</p>
                            </div>
                          )}
                          
                          {application.message && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-xs font-medium text-gray-500 mb-1">Message:</p>
                              <p className="text-sm">{application.message}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-muted-foreground">
                              Applied on {new Date(application.created_at).toLocaleDateString()}
                              {application.is_completed && application.completed_at && (
                                <span className="ml-2 text-green-600">
                                  • Completed on {new Date(application.completed_at).toLocaleDateString()}
                                </span>
                              )}
                            </span>
                            {!application.is_completed && (
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

            {/* Declined Applications */}
            {declinedApplications.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                  Declined Applications ({declinedApplications.length})
                </h2>
                <div className="space-y-4">
                  {declinedApplications.map((application) => (
                    <Card key={application.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm opacity-75">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{application.student_name}</CardTitle>
                            <CardDescription className="flex items-center space-x-2 mt-1">
                              <Mail className="h-3 w-3" />
                              <span>{application.student_email}</span>
                            </CardDescription>
                            {application.has_team && (
                              <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
                                <Users className="h-3 w-3 mr-1" />
                                Has Team
                              </Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className="capitalize">{application.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <span className="text-xs text-muted-foreground">
                          Applied on {new Date(application.created_at).toLocaleDateString()}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {applications.length === 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center py-12">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">No applications yet</CardTitle>
                  <CardDescription className="text-gray-600">Applications for this project will appear here.</CardDescription>
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
          onSuccess={reloadApplications}
        />
      )}
    </div>
  )
}
