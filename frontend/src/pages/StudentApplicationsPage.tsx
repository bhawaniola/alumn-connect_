import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Loader2, Briefcase, Clock, CheckCircle, X, ArrowLeft, Calendar } from 'lucide-react'

interface ProjectApplication {
  id: number
  project_id: number
  project_title: string
  project_description: string
  position_id?: number
  position_title?: string
  message: string
  status: string
  created_at: string
  applied_at: string
}

export const StudentApplicationsPage: React.FC = () => {
  const { token, user, isLoading: authLoading } = useAuth()
  const [applications, setApplications] = useState<ProjectApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token && user && user.role === 'student') {
      fetchApplications()
    }
  }, [token, user])

  const fetchApplications = async () => {
    try {
      const response = await fetch('https://alumconnect-s4c7.onrender.com/api/students/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading applications...</span>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Only students can view this page.</p>
      </div>
    )
  }

  const pendingApplications = applications.filter(app => app.status === 'pending')
  const acceptedApplications = applications.filter(app => app.status === 'accepted')
  const declinedApplications = applications.filter(app => app.status === 'declined')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/student-dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            My Applications
          </h1>
          <p className="text-gray-600">Track all your project applications in one place</p>

          {/* Summary Stats */}
          {applications.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-700 font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
              </div>
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
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-yellow-600" />
                  Pending Applications ({pendingApplications.length})
                </h2>
                <div className="space-y-4">
                  {pendingApplications.map((application) => (
                    <Card key={application.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">
                              <Link to={`/projects/${application.project_id}`} className="hover:text-blue-600 transition-colors">
                                {application.project_title}
                              </Link>
                            </CardTitle>
                            {application.position_title && (
                              <Badge variant="outline" className="mb-2">
                                {application.position_title}
                              </Badge>
                            )}
                            <CardDescription className="line-clamp-2">
                              {application.project_description}
                            </CardDescription>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 ml-4">
                            PENDING
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {application.message && (
                          <div className="p-3 bg-gray-50 rounded-lg mb-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Your Message:</p>
                            <p className="text-sm text-gray-700">{application.message}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Applied on {new Date(application.applied_at).toLocaleDateString()}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/projects/${application.project_id}`}>
                              View Project
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Applications */}
            {acceptedApplications.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                  Accepted Applications ({acceptedApplications.length})
                </h2>
                <div className="space-y-4">
                  {acceptedApplications.map((application) => (
                    <Card key={application.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">
                              <Link to={`/projects/${application.project_id}`} className="hover:text-blue-600 transition-colors">
                                {application.project_title}
                              </Link>
                            </CardTitle>
                            {application.position_title && (
                              <Badge variant="outline" className="mb-2">
                                {application.position_title}
                              </Badge>
                            )}
                            <CardDescription className="line-clamp-2">
                              {application.project_description}
                            </CardDescription>
                          </div>
                          <Badge className="bg-green-600 text-white ml-4">
                            ACCEPTED
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {application.message && (
                          <div className="p-3 bg-gray-50 rounded-lg mb-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Your Message:</p>
                            <p className="text-sm text-gray-700">{application.message}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Applied on {new Date(application.applied_at).toLocaleDateString()}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/projects/${application.project_id}`}>
                              View Project
                            </Link>
                          </Button>
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
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
                  <X className="h-6 w-6 mr-2 text-red-600" />
                  Declined Applications ({declinedApplications.length})
                </h2>
                <div className="space-y-4">
                  {declinedApplications.map((application) => (
                    <Card key={application.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm opacity-75 hover:opacity-100 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">
                              <Link to={`/projects/${application.project_id}`} className="hover:text-blue-600 transition-colors">
                                {application.project_title}
                              </Link>
                            </CardTitle>
                            {application.position_title && (
                              <Badge variant="outline" className="mb-2">
                                {application.position_title}
                              </Badge>
                            )}
                            <CardDescription className="line-clamp-2">
                              {application.project_description}
                            </CardDescription>
                          </div>
                          <Badge className="bg-red-600 text-white ml-4">
                            DECLINED
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Applied on {new Date(application.applied_at).toLocaleDateString()}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/projects/${application.project_id}`}>
                              View Project
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {applications.length === 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <Briefcase className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">No applications yet</CardTitle>
                  <CardDescription className="text-gray-600 mb-6">
                    Start exploring projects and apply to opportunities that interest you.
                  </CardDescription>
                  <div className="flex justify-center gap-3">
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Link to="/alumni-connect">Browse Projects</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/projects">View All Projects</Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
