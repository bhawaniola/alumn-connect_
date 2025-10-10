import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Briefcase, Users, Loader2, Send, CheckCircle, ArrowLeft, MapPin, Clock, DollarSign, Code, UserCheck, Link as LinkIcon, FileText, ChevronLeft, ChevronRight, Edit, Mail, Phone, Globe, Award, TrendingUp, Handshake, Star } from 'lucide-react'
import { ProfileModal } from '../components/ProfileModal'

interface Position {
  id: number
  title: string
  description: string
  required_skills: string[]
  count: number
  filled_count: number
  is_active: boolean
  stipend?: number
  duration?: string
  location?: string
  selected_students: Array<{
    id: number
    name: string
    email: string
  }>
}

interface Project {
  id: number
  title: string
  description: string
  category: string
  status: string
  team_members: string[]
  tags: string[]
  skills_required: string[]
  created_at: string
  created_by_id: number
  created_by_name: string
  created_by_email: string
  positions?: Position[]
  images?: string[]
  project_links?: { label: string, url: string }[]
  jd_pdf?: string
  contact_details?: {
    email?: string
    phone?: string
    website?: string
  }
  team_roles?: Array<{
    name: string
    role: string
    skills?: string[]
  }>
  partners?: string[]
  funding?: string
  highlights?: string[]
}

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)
  const [profileModalUserId, setProfileModalUserId] = useState<number | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [related, setRelated] = useState<Project[]>([])

  useEffect(() => {
    if (id) {
      fetchProject()
      if (user && user.role === 'student') {
        checkApplicationStatus()
      }
    }
  }, [id, user])

  const fetchProject = async () => {
    try {
      const response = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
        // Load related by same category
        try {
          const rel = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects?category=${encodeURIComponent(data.category)}`)
          if (rel.ok) {
            const relData = await rel.json()
            setRelated(relData.filter((p: any) => p.id !== data.id).slice(0, 6))
          }
        } catch (_) {}
      } else {
        console.error('Failed to fetch project')
        setProject(null)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      setProject(null)
    } finally {
      setIsLoading(false)
    }
  }

  const checkApplicationStatus = async () => {
    try {
      const response = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects/${id}/application-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setHasApplied(data.has_applied)
        setApplicationStatus(data.status || null)
      }
    } catch (error) {
      console.error('Error checking application status:', error)
    }
  }

  const handleApply = async () => {
    if (!user || !project) return

    setIsApplying(true)
    try {
      const response = await fetch('https://alumconnect-s4c7.onrender.com/api/project-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          project_id: project.id,
          position_id: selectedPosition,
          message: applicationMessage
        })
      })

      if (response.ok) {
        setApplicationSubmitted(true)
        setHasApplied(true)
        setApplicationStatus('pending')
        setApplicationMessage('')
        setSelectedPosition(null)
      } else {
        const error = await response.json()
        console.error('Failed to submit application:', error.error)
        alert(error.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
    } finally {
      setIsApplying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <span className="text-lg text-gray-600">Loading project...</span>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Project not found</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/projects')}
            className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-6 py-3 rounded-full font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Back Button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4 py-2" 
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project Header */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                  {/* Status and Category */}
                  <div className="flex items-center gap-3 mb-6">
                    <Badge 
                      variant={project.status === 'active' ? 'default' : 'secondary'}
                      className="px-4 py-2 text-sm font-medium"
                    >
                      {project.status}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="px-4 py-2 text-sm font-medium border-blue-200 text-blue-700"
                    >
                      {project.category}
                    </Badge>
                    {user && (user.id === project.created_by_id || user.email === project.created_by_email) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto"
                        onClick={() => navigate(`/alumni/projects/${project.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                    {project.title}
                  </h1>

                  {/* Media Carousel */}
                  {project.images && project.images.length > 0 && (
                    <div className="mb-6 relative">
                      <div className="rounded-xl overflow-hidden border border-gray-200">
                        <img 
                          src={project.images[carouselIndex]} 
                          alt={`Project image ${carouselIndex + 1}`} 
                          className="w-full h-64 object-cover"
                        />
                      </div>
                      <div className="absolute inset-y-0 left-0 flex items-center">
                        <button
                          className="m-2 p-2 rounded-full bg-white/80 hover:bg-white shadow"
                          onClick={() => setCarouselIndex((i) => (i - 1 + project.images!.length) % project.images!.length)}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <button
                          className="m-2 p-2 rounded-full bg-white/80 hover:bg-white shadow"
                          onClick={() => setCarouselIndex((i) => (i + 1) % project.images!.length)}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex gap-2 mt-2 justify-center">
                        {project.images.map((_, idx) => (
                          <button
                            key={idx}
                            className={`h-2 w-2 rounded-full ${idx === carouselIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                            onClick={() => setCarouselIndex(idx)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* External Links & JD */}
                  {(project.jd_pdf || (project.project_links && project.project_links.length > 0)) && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {project.jd_pdf && (
                        <a href={project.jd_pdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                          <FileText className="h-4 w-4 mr-2" /> Job Description
                        </a>
                      )}
                      {project.project_links && project.project_links.map((l, i) => (
                        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                          <LinkIcon className="h-4 w-4 mr-2" /> {l.label || 'Link'}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Required */}
              {project.skills_required && project.skills_required.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Code className="h-5 w-5 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Skills Required</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {project.skills_required.map((skill: string) => (
                        <Badge 
                          key={skill} 
                          variant="default" 
                          className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Team Roles */}
              {project.team_roles && project.team_roles.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Team</h2>
                    </div>
                    <div className="space-y-4">
                      {project.team_roles.map((member, index: number) => (
                        <div key={index} className="p-4 rounded-xl border border-gray-200 hover:border-green-300 transition-all">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-br from-pink-100 to-blue-100 text-gray-700">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                              {member.skills && member.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {member.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Team Members (Legacy) */}
              {project.team_members && project.team_members.length > 0 && (!project.team_roles || project.team_roles.length === 0) && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
                    </div>
                    <div className="space-y-3">
                      {project.team_members.map((member: string, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-pink-100 to-blue-100 text-gray-700">
                              {member.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{member}</p>
                            <p className="text-sm text-gray-500">Team Member</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Partners */}
              {project.partners && project.partners.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Handshake className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Partners</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {project.partners.map((partner: string, index: number) => (
                        <div key={index} className="p-4 rounded-xl border border-gray-200 text-center hover:border-indigo-300 transition-all">
                          <p className="font-semibold text-gray-900">{partner}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Highlights */}
              {project.highlights && project.highlights.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Star className="h-5 w-5 text-yellow-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Highlights</h2>
                    </div>
                    <div className="space-y-3">
                      {project.highlights.map((highlight: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                          <Award className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-900">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Tags</h2>
                    <div className="flex flex-wrap gap-3">
                      {project.tags.map((tag: string) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="px-3 py-1 text-sm border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Positions Section - show only active positions */}
              {project.positions && project.positions.filter(p => p.is_active).length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-purple-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Open Positions</h2>
                    </div>
                    <div className="space-y-4">
                      {project.positions.filter(p => p.is_active).map((position) => (
                        <div 
                          key={position.id}
                          className="p-5 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{position.title}</h3>
                              <p className="text-sm text-gray-600 mb-3">{position.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge 
                                variant={position.is_active ? "default" : "secondary"}
                                className="whitespace-nowrap"
                              >
                                {position.is_active ? 'Active' : 'Filled'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {position.filled_count}/{position.count} filled
                              </span>
                            </div>
                          </div>
                          
                          {/* Position Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            {position.stipend && (
                              <div className="flex items-center space-x-2 p-2 rounded-lg bg-green-50 border border-green-100">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <div>
                                  <p className="text-xs text-gray-600">Stipend</p>
                                  <p className="text-sm font-semibold text-green-600">₹{position.stipend.toLocaleString()}</p>
                                </div>
                              </div>
                            )}
                            {position.duration && (
                              <div className="flex items-center space-x-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <div>
                                  <p className="text-xs text-gray-600">Duration</p>
                                  <p className="text-sm font-semibold text-blue-600">{position.duration}</p>
                                </div>
                              </div>
                            )}
                            {position.location && (
                              <div className="flex items-center space-x-2 p-2 rounded-lg bg-purple-50 border border-purple-100">
                                <MapPin className="h-4 w-4 text-purple-600" />
                                <div>
                                  <p className="text-xs text-gray-600">Location</p>
                                  <p className="text-sm font-semibold text-purple-600">{position.location}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {position.required_skills && position.required_skills.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500 mb-2">Required Skills:</p>
                              <div className="flex flex-wrap gap-2">
                                {position.required_skills.map((skill, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline" 
                                    className="text-xs bg-blue-50 border-blue-200 text-blue-700"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {position.selected_students && position.selected_students.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-xs font-medium text-gray-500 mb-3">Selected Candidates:</p>
                              <div className="space-y-2">
                                {position.selected_students.map((student) => (
                                  <div 
                                    key={student.id}
                                    className="flex items-center space-x-3 p-2 rounded-lg bg-green-50 border border-green-100 cursor-pointer hover:bg-green-100"
                                    onClick={() => {
                                      setProfileModalUserId(student.id)
                                      setIsProfileModalOpen(true)
                                    }}
                                  >
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                      <p className="text-xs text-gray-500">{student.email}</p>
                                    </div>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {user && user.role === 'student' && position.is_active && !hasApplied && (
                            <Button
                              size="sm"
                              className="mt-3 w-full bg-purple-600 hover:bg-purple-700"
                              onClick={() => setSelectedPosition(position.id)}
                            >
                              Apply for this position
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author Info */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Project Creator</h3>
                  <div 
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    onClick={() => {
                      setProfileModalUserId(project.created_by_id)
                      setIsProfileModalOpen(true)
                    }}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-lg font-semibold">
                        {project.created_by_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{project.created_by_name}</p>
                      <p className="text-sm text-gray-500">Project Lead</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              {project.contact_details && (project.contact_details.email || project.contact_details.phone || project.contact_details.website) && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      {project.contact_details.email && (
                        <a href={`mailto:${project.contact_details.email}`} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{project.contact_details.email}</p>
                          </div>
                        </a>
                      )}
                      {project.contact_details.phone && (
                        <a href={`tel:${project.contact_details.phone}`} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-medium text-gray-900">{project.contact_details.phone}</p>
                          </div>
                        </a>
                      )}
                      {project.contact_details.website && (
                        <a href={project.contact_details.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Globe className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Website</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{project.contact_details.website}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Application Section */}
              {user && user.role === 'student' && project.status === 'active' && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    {hasApplied || applicationSubmitted ? (
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Already Applied!</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Your application has been sent to the project creator.
                        </p>
                        {applicationStatus && (
                          <Badge variant={
                            applicationStatus === 'accepted' ? 'default' : 
                            applicationStatus === 'declined' ? 'destructive' : 
                            'secondary'
                          }>
                            Status: {applicationStatus}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Apply for this Project</h3>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
                              Apply Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Apply for {project.title}</DialogTitle>
                              <DialogDescription>
                                Write a message to introduce yourself and explain why you're interested in this project.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Tell us about yourself and why you want to work on this project..."
                                value={applicationMessage}
                                onChange={(e) => setApplicationMessage(e.target.value)}
                                rows={4}
                              />
                              <Button 
                                onClick={handleApply} 
                                disabled={isApplying || !applicationMessage.trim()}
                                className="w-full"
                              >
                                {isApplying ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Application
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Project Stats */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Project Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Category</span>
                      <span className="text-sm font-medium text-gray-900">{project.category}</span>
                    </div>
                    {project.funding && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-600">Funding</span>
                        </div>
                        <p className="text-sm font-semibold text-green-600">{project.funding}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Related Opportunities */}
              {related.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Related Opportunities</h3>
                    <div className="space-y-3">
                      {related.map((rp) => (
                        <div key={rp.id} className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100" onClick={() => navigate(`/projects/${rp.id}`)}>
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 truncate mr-2">{rp.title}</p>
                            <Badge variant="secondary" className="capitalize">{rp.status}</Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">{rp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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