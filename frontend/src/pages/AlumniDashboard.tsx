import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Users, BookOpen, Bell, Plus, FilePlus2, Briefcase, Loader2, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface DashboardStats {
  active_projects: number
  total_projects: number
  mentees: number
  blog_posts: number
  pending_mentorship_requests: number
  pending_project_applications: number
}

interface RecentActivity {
  id: number
  type: 'mentorship' | 'project_application'
  title: string
  description: string
  status: string
  created_at: string
}

export const AlumniDashboard: React.FC = () => {
  const { token, user, isLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    active_projects: 0,
    total_projects: 0,
    mentees: 0,
    blog_posts: 0,
    pending_mentorship_requests: 0,
    pending_project_applications: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!token) return
      
      try {
        // Load dashboard stats
        const statsRes = await fetch('https://alumconnect-s4c7.onrender.com/api/alumni/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        // Build recent activity from supported endpoints
        const [mentorshipRes, applicationsRes] = await Promise.all([
          fetch('https://alumconnect-s4c7.onrender.com/api/mentorship/requests', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('https://alumconnect-s4c7.onrender.com/api/alumni/project-applications', { headers: { Authorization: `Bearer ${token}` } })
        ])

        const activities: RecentActivity[] = []

        if (mentorshipRes.ok) {
          const mentorshipData = await mentorshipRes.json()
          for (const r of mentorshipData) {
            activities.push({
              id: r.id,
              type: 'mentorship',
              title: `Mentorship request from ${r.other_user_name || 'student'}`,
              description: r.message || 'Mentorship request',
              status: r.status || 'pending',
              created_at: r.created_at
            })
          }
        }

        if (applicationsRes.ok) {
          const applicationsData = await applicationsRes.json()
          for (const a of applicationsData) {
            activities.push({
              id: a.id,
              type: 'project_application',
              title: `${a.student_name || 'Student'} applied to ${a.project_title || 'your project'}`,
              description: a.message || 'Project application',
              status: a.status || 'pending',
              created_at: a.created_at
            })
          }
        }

        // Sort desc by created_at and keep recent ones
        activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setRecentActivity(activities.slice(0, 10))
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [token])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <span className="text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access your dashboard.</p>
      </div>
    )
  }

  if (user.role !== 'alumni') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Only alumni can access this dashboard.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="mb-12">
          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 leading-tight">
              Founder's Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
              Welcome back, {user.name}! Manage your projects, mentorship, and community engagement.
            </p>
            
            {/* Animated border decoration */}
            <div className="absolute -bottom-2 left-0 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 left-28 h-1 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse delay-300"></div>
            <div className="absolute -bottom-2 left-48 h-1 w-12 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-pulse delay-700"></div>
          </div>
        </div>

        {/* Statistics Cards with Enhanced Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.active_projects}
              </div>
              <p className="text-xs text-gray-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                Currently showcasing
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                <FilePlus2 className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.total_projects}
              </div>
              <p className="text-xs text-gray-500 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                All time created
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600">Mentees</CardTitle>
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.mentees}
              </div>
              <p className="text-xs text-gray-500 flex items-center">
                <Users className="h-3 w-3 mr-1 text-purple-500" />
                Active mentees
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600">Blog Posts</CardTitle>
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.blog_posts}
              </div>
              <p className="text-xs text-gray-500 flex items-center">
                <BookOpen className="h-3 w-3 mr-1 text-orange-500" />
                Published articles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions with Enhanced Animations */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button asChild className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 shadow hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Link to="/alumni/create-project">
                <div className="p-3 rounded-full bg-white/20 group-hover:bg-white/30 transition-all duration-300 mb-2">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold">Create Project</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200 hover:from-green-200 hover:to-emerald-300 text-green-700 shadow hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Link to="/alumni/create-blog">
                <div className="p-3 rounded-full bg-green-100 group-hover:bg-green-200 transition-all duration-300 mb-2">
                  <FilePlus2 className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold">Write Blog</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 hover:from-indigo-200 hover:to-purple-300 text-indigo-700 shadow hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Link to="/alumni/mentees">
                <div className="p-3 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-all duration-300 mb-2">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold">View Mentees</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 to-cyan-200 hover:from-teal-200 hover:to-cyan-300 text-teal-700 shadow hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Link to="/alumni/projects">
                <div className="p-3 rounded-full bg-teal-100 group-hover:bg-cyan-200 transition-all duration-300 mb-2">
                  <Briefcase className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold">My Projects</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Activity with Enhanced Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Last 7 days</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'mentorship' 
                          ? 'bg-purple-100 group-hover:bg-purple-200' 
                          : 'bg-blue-100 group-hover:bg-blue-200'
                      } transition-colors duration-200`}>
                        {activity.type === 'mentorship' ? (
                          <Users className={`h-4 w-4 ${
                            activity.type === 'mentorship' ? 'text-purple-600' : 'text-blue-600'
                          }`} />
                        ) : (
                          <Briefcase className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge 
                            variant={activity.status === 'pending' ? 'secondary' : 'default'}
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">Pending Requests</CardTitle>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-500">Action Required</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-orange-100">
                      <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Mentorship Requests</p>
                      <p className="text-xs text-gray-500">Students seeking guidance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pending_mentorship_requests}
                    </div>
                    <Button size="sm" variant="outline" className="mt-1" asChild>
                      <Link to="/alumni/mentees">View</Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Project Applications</p>
                      <p className="text-xs text-gray-500">Students applying to your projects</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pending_project_applications}
                    </div>
                    <Button size="sm" variant="outline" className="mt-1" asChild>
                      <Link to="/alumni/project-applications">View</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}