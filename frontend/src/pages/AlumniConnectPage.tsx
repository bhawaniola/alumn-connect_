import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { excerptFromHtml } from '../lib/dataUtils'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Textarea } from '../components/ui/textarea'
import { Briefcase, Clock, MapPin, DollarSign, ArrowRight, Loader2, Send, CheckCircle, BookOpen, Building, Heart, X } from 'lucide-react'
import { ProfileModal } from '../components/ProfileModal'

interface Project {
  id: number
  title: string
  description: string
  category: string
  status: string
  team_members: string[]
  tags: string[]
  skills_required: string[]
  stipend?: number
  duration?: string
  location?: string
  work_type?: string
  created_at: string
  created_by_id: number
  created_by_name: string
  created_by_email: string
}

interface BlogPost {
  id: number
  title: string
  content: string
  category: string
  created_at: string
  updated_at: string
  author_name: string
  author_avatar?: string
  author_id: number
  likes_count?: number
  is_liked?: boolean
}

export const AlumniConnectPage: React.FC = () => {
  const { user, token } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [profileModalUserId, setProfileModalUserId] = useState<number | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [appliedProjects, setAppliedProjects] = useState<Set<number>>(new Set())
  const [applicationStatuses, setApplicationStatuses] = useState<Map<number, string>>(new Map())

  useEffect(() => {
    fetchData()
    if (user && user.role === 'student' && token) {
      fetchAppliedProjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAppliedProjects = async () => {
    try {
      const response = await fetch('https://alumconnect-s4c7.onrender.com/api/students/applied-projects', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        const appliedIds = new Set<number>(data.map((p: { id: number }) => p.id))
        const statuses = new Map<number, string>(data.map((p: { id: number; application_status: string }) => [p.id, p.application_status]))
        setAppliedProjects(appliedIds)
        setApplicationStatuses(statuses)
      }
    } catch (error) {
      console.error('Error fetching applied projects:', error)
    }
  }

  const fetchData = async () => {
    try {
      // Fetch projects and blogs in parallel
      const [projectsResponse, blogsResponse] = await Promise.all([
        fetch('https://alumconnect-s4c7.onrender.com/api/projects'),
        fetch('https://alumconnect-s4c7.onrender.com/api/blog')
      ])

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData.filter((p: Project) => p.status === 'active'))
      }

      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json()
        setBlogs(blogsData.slice(0, 6)) // Show latest 6 blogs
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleApply = async () => {
    if (!user || !selectedProject) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('https://alumconnect-s4c7.onrender.com/api/project-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          project_id: selectedProject.id,
          message: applicationMessage
        })
      })

      if (response.ok) {
        setApplicationSubmitted(true)
        setAppliedProjects(prev => new Set(prev).add(selectedProject.id))
        setApplicationMessage('')
        setTimeout(() => {
          setIsDialogOpen(false)
          setApplicationSubmitted(false)
        }, 2000)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWithdraw = async (projectId: number) => {
    if (!confirm('Are you sure you want to withdraw your application?')) {
      return
    }

    try {
      const response = await fetch(`https://alumconnect-s4c7.onrender.com/api/project-applications/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setAppliedProjects(prev => {
          const newSet = new Set(prev)
          newSet.delete(projectId)
          return newSet
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to withdraw application')
      }
    } catch (error) {
      console.error('Error withdrawing application:', error)
      alert('Failed to withdraw application')
    }
  }

  const handleLike = (postId: number) => {
    setBlogs(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            is_liked: !post.is_liked,
            likes_count: post.is_liked ? (post.likes_count || 0) - 1 : (post.likes_count || 0) + 1
          }
        : post
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <span className="text-lg text-gray-600">Loading opportunities...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight">
            Founder's Connect
            </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connect with successful alumni, apply for exciting projects, and get inspired by their stories. 
            Your journey to professional growth starts here.
            </p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Projects */}
          <div className="lg:col-span-2 space-y-8">
            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-8">
                    <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Projects</h2>
                  <p className="text-gray-600">Apply for projects and gain real-world experience</p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/projects">
                    View All Projects
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                  </div>
                  
              {projects.length > 0 ? (
                <div className="space-y-6">
                  {projects.slice(0, 4).map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge 
                                variant={project.status === 'active' ? 'default' : 'secondary'}
                                className="px-3 py-1 text-sm"
                              >
                                {project.status}
                              </Badge>
                              <Badge variant="outline" className="px-3 py-1 text-sm">
                                {project.category}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl mb-2 line-clamp-2">{project.title}</CardTitle>
                            <CardDescription className="line-clamp-2 text-base">
                              {project.description}
                            </CardDescription>
                    </div>
                  </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Project Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {project.stipend && (
                              <div className="flex items-center space-x-2 text-sm">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-medium">₹{project.stipend.toLocaleString()}</span>
                    </div>
                            )}
                            {project.duration && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span>{project.duration}</span>
                  </div>
                            )}
                            {project.location && (
                              <div className="flex items-center space-x-2 text-sm">
                                <MapPin className="h-4 w-4 text-purple-600" />
                                <span>{project.location}</span>
                    </div>
                            )}
                            {project.work_type && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Building className="h-4 w-4 text-orange-600" />
                                <span className="capitalize">{project.work_type}</span>
                  </div>
                            )}
                </div>
                
                          {/* Skills */}
                          {project.skills_required && project.skills_required.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                              {project.skills_required.slice(0, 4).map((skill: string) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                              {project.skills_required.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.skills_required.length - 4} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div 
                              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setProfileModalUserId(project.created_by_id)
                                setIsProfileModalOpen(true)
                              }}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-semibold">
                                  {project.created_by_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{project.created_by_name}</p>
                                <p className="text-xs text-gray-500">Project Creator</p>
                  </div>
                </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/projects/${project.id}`}>
                                  View Details
                                </Link>
                              </Button>
                              {user && user.role === 'student' && (
                                appliedProjects.has(project.id) ? (
                                  <div className="flex gap-2">
                                    {applicationStatuses.get(project.id) === 'accepted' ? (
                                      <Button 
                                        size="sm"
                                        disabled
                                        className="bg-green-600 text-white hover:bg-green-600"
                                      >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Accepted
                                      </Button>
                                    ) : applicationStatuses.get(project.id) === 'declined' ? (
                                      <Button 
                                        size="sm"
                                        disabled
                                        className="bg-red-50 text-red-600 border border-red-200"
                                      >
                                        <X className="mr-2 h-4 w-4" />
                                        Declined
                                      </Button>
                                    ) : (
                                      <>
                                        <Button 
                                          size="sm"
                                          disabled
                                          className="bg-yellow-50 text-yellow-600 border border-yellow-200"
                                        >
                                          <Clock className="mr-2 h-4 w-4" />
                                          Pending
                                        </Button>
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleWithdraw(project.id)}
                                          className="text-red-600 hover:bg-red-50 border-red-200"
                                        >
                                          Withdraw
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm"
                                        onClick={() => setSelectedProject(project)}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                      >
                                        Apply Now
                                      </Button>
                                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Apply for {selectedProject?.title || project.title}</DialogTitle>
                        <DialogDescription>
                          Write a message to introduce yourself and explain why you're interested in this project.
                        </DialogDescription>
                      </DialogHeader>
                      {applicationSubmitted ? (
                        <div className="text-center py-6">
                          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted!</h3>
                          <p className="text-sm text-gray-600">
                            Your application has been sent successfully.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Tell us about yourself and why you want to work on this project..."
                            value={applicationMessage}
                            onChange={(e) => setApplicationMessage(e.target.value)}
                            rows={4}
                          />
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsDialogOpen(false)
                                setApplicationMessage('')
                              }}
                              className="flex-1"
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleApply} 
                              disabled={isSubmitting || !applicationMessage.trim()}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="mr-2 h-4 w-4" />
                                  Submit
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects available</h3>
                    <p className="text-gray-600">Check back later for new project opportunities.</p>
                  </CardContent>
                </Card>
                        )}
                      </div>
          </div>

          {/* Sidebar - Blogs */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Latest Insights</h2>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/blog">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {blogs.length > 0 ? (
                <div className="space-y-4">
                  {blogs.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-all duration-200 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {post.category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                            {post.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {excerptFromHtml(post.content, 100)}
                          </p>
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setProfileModalUserId(post.author_id)
                                setIsProfileModalOpen(true)
                              }}
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                  {post.author_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">{post.author_name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center space-x-1 text-xs ${
                                  post.is_liked ? 'text-red-600' : 'text-gray-500'
                                }`}
                              >
                                <Heart className={`h-3 w-3 ${post.is_liked ? 'fill-current' : ''}`} />
                                <span>{post.likes_count || 0}</span>
                              </button>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                            <Link to={`/blog/${post.id}`}>
                              Read More
                            </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
                </div>
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">No articles yet</h3>
                    <p className="text-xs text-gray-600">Check back later for inspiring stories.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Call to Action */}
            {!user && (
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-gray-900 mb-2">Ready to Get Started?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Join our community and start your journey with alumni mentors.
                  </p>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to="/register">Get Started</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
        </div>
      </div>

      {/* Profile Modal */}
      {profileModalUserId && (
        <ProfileModal
          userId={profileModalUserId}
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false)
            setProfileModalUserId(null)
          }}
        />
      )}
    </div>
  )
}