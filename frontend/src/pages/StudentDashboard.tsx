import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Loader2, Briefcase, ArrowRight, BookOpen, UserPlus, Search, TrendingUp, Clock, CheckCircle, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CompletedProjectCard } from '../components/CompletedProjectCard'

interface ProjectItem {
  id: number
  title: string
  description: string
  category: string
  status: string
  tags: string[]
  team_members: string[]
  created_by_name: string
  application_status: string
  applied_at: string
  is_completed?: boolean
}

interface MentorshipRequest {
  id: number
  message: string
  status: string
  created_at: string
  other_user_name: string
  other_user_email: string
}

interface DashboardStats {
  applied_projects: number
  mentorship_requests: number
  accepted_projects: number
  pending_applications: number
}

interface CompletedProject {
  application_id: number
  feedback: string
  completed_at: string
  applied_at: string
  project_id: number
  title: string
  description: string
  category: string
  status: string
  alumni_name: string
  alumni_email: string
}

export const StudentDashboard: React.FC = () => {
  const { token, user, isLoading } = useAuth()
  const [appliedProjects, setAppliedProjects] = useState<ProjectItem[]>([])
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([])
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    applied_projects: 0,
    mentorship_requests: 0,
    accepted_projects: 0,
    pending_applications: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!token) return
      
      try {
        // Load applied projects
        const projectsRes = await fetch('https://alumconnect-s4c7.onrender.com/api/students/applied-projects', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setAppliedProjects(projectsData)
          
          // Calculate stats
          const acceptedProjects = projectsData.filter((p: ProjectItem) => p.application_status === 'accepted').length
          const pendingApplications = projectsData.filter((p: ProjectItem) => p.application_status === 'pending').length
          
          setStats(prev => ({
            ...prev,
            applied_projects: projectsData.length,
            accepted_projects: acceptedProjects,
            pending_applications: pendingApplications
          }))
        }

        // Load mentorship requests
        const mentorshipRes = await fetch('https://alumconnect-s4c7.onrender.com/api/mentorship/requests', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (mentorshipRes.ok) {
          const mentorshipData = await mentorshipRes.json()
          setMentorshipRequests(mentorshipData)
          setStats(prev => ({
            ...prev,
            mentorship_requests: mentorshipData.length
          }))
        }

        // Load completed projects with feedback
        const completedRes = await fetch('https://alumconnect-s4c7.onrender.com/api/students/completed-projects', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (completedRes.ok) {
          const completedData = await completedRes.json()
          setCompletedProjects(completedData)
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [token])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access your dashboard.</p>
      </div>
    )
  }

  const ongoingProjects = appliedProjects.filter(
    (p) => p.application_status === 'accepted' && p.status === 'active' && !p.is_completed
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="relative mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4 leading-tight">
            Student Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your applications, find mentors, and explore exciting opportunities.
          </p>
          {/* Animated border decoration */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse"></div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">Applied Projects</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Briefcase className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.applied_projects}</div>
              <p className="text-sm text-gray-600">Total applications</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">Accepted Projects</CardTitle>
              <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.accepted_projects}</div>
              <p className="text-sm text-gray-600">Projects you're part of</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">Mentorship Requests</CardTitle>
              <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <UserPlus className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.mentorship_requests}</div>
              <p className="text-sm text-gray-600">Requests sent</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-700">Pending Applications</CardTitle>
              <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pending_applications}</div>
              <p className="text-sm text-gray-600">Awaiting response</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button asChild className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 shadow hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Link to="/alumni-connect">
                <Search className="h-6 w-6 mb-2" />
                <span className="text-sm font-semibold">Browse Projects</span>
              </Link>
            </Button>
            <Button asChild className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200 hover:from-green-200 hover:to-emerald-300 text-green-700 shadow hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Link to="/find-mentors">
                <UserPlus className="h-6 w-6 mb-2" />
                <span className="text-sm font-semibold">Find Mentors</span>
              </Link>
            </Button>
            <Button asChild className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 hover:from-indigo-200 hover:to-purple-300 text-indigo-700 shadow hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Link to="/blog">
                <BookOpen className="h-6 w-6 mb-2" />
                <span className="text-sm font-semibold">Read Blogs</span>
              </Link>
            </Button>
            <Button asChild className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 to-cyan-200 hover:from-teal-200 hover:to-cyan-300 text-teal-700 shadow hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Link to="/messages">
                <MessageCircle className="h-6 w-6 mb-2" />
                <span className="text-sm font-semibold">Messages</span>
              </Link>
            </Button>
          </div>
        </div>

        {ongoingProjects.length > 0 && (
          <div className="mt-8 pb-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Ongoing Projects</CardTitle>
                    <CardDescription className="text-gray-600">Projects you are currently part of</CardDescription>
                  </div>
                  <Badge className="bg-blue-500 text-white">{ongoingProjects.length} Ongoing</Badge>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {ongoingProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{project.title}</p>
                        <p className="text-sm text-gray-500">
                          {project.category} • Ongoing • By {project.created_by_name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-blue-500">Accepted</Badge>
                        <Button variant="ghost" size="sm" asChild className="hover:bg-gray-200">
                          <Link to={`/projects/${project.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity & Applied Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-bold text-gray-900">Recent Activity</CardTitle>
              <CardDescription className="text-gray-600">Your latest applications and requests</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : appliedProjects.length === 0 && mentorshipRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">Start exploring projects and connecting with alumni!</p>
                  </div>
                ) : (
                  <>
                    {appliedProjects.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className={`w-3 h-3 rounded-full ${
                          project.status === 'completed' ? 'bg-green-500' : 
                          project.status === 'active' ? 'bg-blue-500 animate-pulse' : 
                          'bg-gray-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Applied to {project.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(project.applied_at).toLocaleDateString()} • {project.status === 'active' ? 'Ongoing' : project.status === 'completed' ? 'Completed' : project.status}
                          </p>
                        </div>
                        <Badge variant={project.application_status === 'accepted' ? 'default' : 'secondary'} className="capitalize">
                          {project.application_status}
                        </Badge>
                      </div>
                    ))}
                    {mentorshipRequests.slice(0, 2).map((request) => (
                      <div key={request.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Mentorship request to {request.other_user_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'} className="capitalize">
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-bold text-gray-900">Applied Projects</CardTitle>
              <CardDescription className="text-gray-600">Projects you have applied to</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : appliedProjects.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No applications yet</p>
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                    <Link to="/alumni-connect">Browse Projects</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appliedProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900">{project.title}</p>
                        <p className="text-sm text-gray-500">{project.category} • {project.status === 'active' ? 'Ongoing' : project.status === 'completed' ? 'Completed' : project.status}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={project.application_status === 'accepted' ? 'default' : 'secondary'} 
                          className={`capitalize ${
                            project.status === 'completed' ? 'bg-green-500' : 
                            project.status === 'active' ? 'bg-blue-500' : ''
                          }`}
                        >
                          {project.application_status}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild className="hover:bg-gray-200">
                          <Link to={`/projects/${project.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {appliedProjects.length > 3 && (
                    <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50" asChild>
                      <Link to="/student/applications">View All Applications</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mentorship Requests Section */}
        <div className="mt-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-bold text-gray-900">Mentorship Requests</CardTitle>
              <CardDescription className="text-gray-600">Your mentorship requests to alumni</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : mentorshipRequests.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No mentorship requests yet</p>
                  <Button asChild className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                    <Link to="/alumni-connect">Find Alumni Mentors</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mentorshipRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900">{request.other_user_name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{request.message}</p>
                      </div>
                      <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'} className="capitalize">
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                  {mentorshipRequests.length > 3 && (
                    <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50" asChild>
                      <Link to="/student/mentorship">View All Requests</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
 
        {/* Completed Projects Section */}
        {completedProjects.length > 0 && (
          <div className="mt-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                      <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                      Completed Projects
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Projects you've completed with feedback from alumni
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    {completedProjects.length} Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {completedProjects.map((project) => (
                    <CompletedProjectCard key={project.application_id} project={project} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
