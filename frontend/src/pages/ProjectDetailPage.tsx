import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Briefcase, Users, Loader2, Send, CheckCircle, ArrowLeft, MapPin, Clock, DollarSign, UserCheck, Link as LinkIcon, FileText, ChevronLeft, ChevronRight, Edit, Mail, Phone, Globe, Award, TrendingUp, Handshake, Star, ChevronDown, Calendar, Heart, X } from 'lucide-react'
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
  highlights?: Array<string | { text: string; image?: string }>
}

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [positionApplications, setPositionApplications] = useState<Record<string, { application_id: number, status: string, applied_at: string, is_legacy?: boolean }>>({})
  const [profileModalUserId, setProfileModalUserId] = useState<number | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [related, setRelated] = useState<Project[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [isTeamExpanded, setIsTeamExpanded] = useState(false)

  const API_BASE = 'https://alumconnect-s4c7.onrender.com'
  const abs = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) return `${API_BASE}${url}`
    return url
  }

  useEffect(() => {
    if (id) {
      fetchProject()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    console.log('🔄 useEffect triggered - id:', id, 'user:', user?.email, 'role:', user?.role, 'token:', !!token)
    if (id && user && user.role === 'student' && token) {
      console.log('🎯 Checking application status - User:', user.email, 'Project:', id)
      checkApplicationStatus()
    } else {
      console.log('⚠️ Skipping application status check:', { hasId: !!id, hasUser: !!user, isStudent: user?.role === 'student', hasToken: !!token })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, token])

  // Refetch application status after successful submission
  useEffect(() => {
    if (applicationSubmitted && user && user.role === 'student') {
      checkApplicationStatus()
    }
  }, [applicationSubmitted])

  // Initialize team categories when project changes
  useEffect(() => {
    if (project?.team_roles && project.team_roles.length > 0) {
      const categorizeRole = (role: string): string => {
        const roleLower = role.toLowerCase()
        if (roleLower.includes('advisor') || roleLower.includes('mentor')) return 'Advisors'
        if (roleLower.includes('lead') || roleLower.includes('head') || roleLower.includes('ceo') || roleLower.includes('cto') || roleLower.includes('founder') || roleLower.includes('director') || roleLower.includes('chief')) return 'Leadership'
        if (roleLower.includes('investor') || roleLower.includes('partner')) return 'Investors'
        if (roleLower.includes('intern') || roleLower.includes('trainee')) return 'Interns'
        if (roleLower.includes('developer') || roleLower.includes('engineer') || roleLower.includes('designer')) return 'Core Team'
        return 'Team Members'
      }
      const categorized = project.team_roles.reduce((acc: Record<string, any[]>, member) => {
        const category = categorizeRole(member.role)
        if (!acc[category]) acc[category] = []
        acc[category].push(member)
        return acc
      }, {})
      const initialState = Object.keys(categorized).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      setExpandedCategories(initialState)
    } else {
      setExpandedCategories({})
    }
  }, [project])

  const fetchProject = async () => {
    try {
      const response = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects/${id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Project data:', data)
        console.log('Project positions:', data.positions)
        setProject(data)
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
    if (!token) {
      console.log('⚠️ No token available, skipping application status check')
      return
    }
    try {
      console.log('🔍 Fetching application status for project:', id)
      const response = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects/${id}/application-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Application status response:', data)
        
        let applicationsData: Record<string, { application_id: number, status: string, applied_at: string, is_legacy?: boolean }> = {}
        
        // Handle new format with applications object
        if (data.applications) {
          applicationsData = data.applications
          console.log('📋 Applications by position (new format):', data.applications)
        }
        // Handle old format - single application without positions
        else if (data.has_applied && data.application_id) {
          console.log('⚠️ Old format detected - converting to new format')
          // If it's an old application, we need to get all positions and assign this application to all
          if (project?.positions) {
            project.positions.forEach(pos => {
              applicationsData[pos.id.toString()] = {
                application_id: data.application_id,
                status: data.status,
                applied_at: data.applied_at,
                is_legacy: true
              }
            })
          }
          console.log('📋 Converted applications:', applicationsData)
        }
        
        console.log('🔢 Number of applications:', Object.keys(applicationsData).length)
        
        // Log each position application for debugging
        Object.entries(applicationsData).forEach(([posId, app]: [string, any]) => {
          console.log(`  Position ${posId}:`, app)
        })
        
        setPositionApplications(applicationsData)
        console.log('💾 State updated with applications:', applicationsData)
      } else {
        console.error('❌ Failed to fetch application status:', response.status, await response.text())
      }
    } catch (error) {
      console.error('❌ Error checking application status:', error)
    }
  }

  const handleApply = async () => {
    if (!user || !project || !selectedPosition || !token) {
      console.error('❌ Missing required data:', { user: !!user, project: !!project, selectedPosition, token: !!token })
      return
    }

    const requestBody = {
      project_id: project.id,
      position_id: selectedPosition,
      message: applicationMessage
    }
    
    console.log('📤 Submitting application:', requestBody)

    setIsApplying(true)
    try {
      const response = await fetch('https://alumconnect-s4c7.onrender.com/api/project-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Application submitted successfully:', data)
        
        // Update the position applications state
        setPositionApplications(prev => ({
          ...prev,
          [selectedPosition.toString()]: {
            application_id: data.id || 0,
            status: 'pending',
            applied_at: new Date().toISOString()
          }
        }))
        setApplicationSubmitted(true)
        setApplicationMessage('')
        setIsApplyDialogOpen(false)
        setSelectedPosition(null)
        // Refetch to get the actual application data from server
        setTimeout(() => checkApplicationStatus(), 500)
      } else {
        const error = await response.json()
        console.error('❌ Failed to submit application:', error)
        alert(error.error || error.message || 'Failed to submit application')
      }
    } catch (error) {
      console.error('❌ Error submitting application:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading project...</span>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-12 w-12 text-blue-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              className="text-white hover:text-white hover:bg-white/20 rounded-full px-4 py-2" 
              onClick={() => navigate('/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Badge 
                variant="secondary"
                className="px-4 py-2 text-sm font-medium bg-white/20 text-white border-white/30"
              >
                {project.status}
              </Badge>
              <Badge 
                variant="outline" 
                className="px-4 py-2 text-sm font-medium border-white/30 text-white bg-white/10"
              >
                {project.category}
              </Badge>
              {user && (user.id === project.created_by_id || user.email === project.created_by_email) && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="ml-auto bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() => navigate(`/alumni/projects/${project.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white/90 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Posted {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              
              {project.positions && project.positions.filter(p => p.is_active).length > 0 && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  <span className="text-sm">{project.positions.filter(p => p.is_active).length} open positions</span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            {user && user.role === 'student' && project.status === 'active' && (
              <div className="flex gap-3">
                {project.positions && project.positions.filter(p => p.is_active && !positionApplications[p.id.toString()]).length > 0 && (
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-full shadow-lg"
                    onClick={() => {
                      // Scroll to positions section
                      const positionsSection = document.querySelector('[data-section="positions"]')
                      if (positionsSection) {
                        positionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                  >
                    View Open Positions
                  </Button>
                )}
                {Object.keys(positionApplications).length > 0 && (
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-full shadow-lg"
                    onClick={() => {
                      // Scroll to positions section to see application status
                      const positionsSection = document.querySelector('[data-section="positions"]')
                      if (positionsSection) {
                        positionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                  >
                    View Your Applications
                  </Button>
                )}
                <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg rounded-full">
                  <Heart className="h-5 w-5 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Media Carousel */}
              {project.images && project.images.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={abs(project.images[carouselIndex])} 
                      alt={`Project image ${carouselIndex + 1}`} 
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {project.images.length > 1 && (
                      <>
                        <button
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
                          onClick={() => setCarouselIndex((i) => (i - 1 + project.images!.length) % project.images!.length)}
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-800" />
                        </button>
                        <button
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
                          onClick={() => setCarouselIndex((i) => (i + 1) % project.images!.length)}
                        >
                          <ChevronRight className="h-5 w-5 text-gray-800" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {project.images.map((_, idx) => (
                            <button
                              key={idx}
                              className={`h-2 rounded-full transition-all ${idx === carouselIndex ? 'bg-white w-8' : 'bg-white/50 w-2'}`}
                              onClick={() => setCarouselIndex(idx)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* About Section */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-4" />
                  About This Project
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>

                {/* External Links & JD */}
                {(project.jd_pdf || (project.project_links && project.project_links.length > 0)) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Resources</h3>
                    <div className="flex flex-wrap gap-3">
                      {project.jd_pdf && (
                        <a href={abs(project.jd_pdf)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-3 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-all">
                          <FileText className="h-5 w-5 mr-2" /> Job Description
                        </a>
                      )}
                      {project.project_links && project.project_links.map((l, i) => (
                        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-3 rounded-xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition-all">
                          <LinkIcon className="h-5 w-5 mr-2" /> {l.label || 'Link'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Highlights */}
              {project.highlights && project.highlights.length > 0 && (() => {
                const items = project.highlights.map((h: any) => typeof h === 'string' ? { text: h } : h)
                const count = items.length
                const current = items[(highlightIndex % count + count) % count]
                return (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-sm border border-orange-100 p-0 overflow-hidden">
                    <div className="px-8 pt-8">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Key Highlights</h2>
                      </div>
                    </div>
                    <div className="relative">
                      <div className={`grid ${current.image && current.text ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-0 items-stretch rounded-xl overflow-hidden shadow-lg`}>
                        {/* Media */}
                        {current.image && (
                          <div className="relative min-h-[320px] md:min-h-[400px] bg-gradient-to-br from-orange-50 to-amber-50">
                            <img
                              src={abs(current.image)}
                              alt="highlight"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                          </div>
                        )}
                        
                        {/* Content */}
                        {current.text && (
                          <div className="flex items-center justify-center p-8 md:p-12 bg-gradient-to-br from-white to-orange-50/30">
                            <div className="max-w-2xl">
                              {/* <div className="mb-6 inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg">
                                <Award className="h-7 w-7 text-white" />
                              </div> */}
                              <p className="text-xl md:text-2xl text-gray-900 font-semibold leading-relaxed">
                                {current.text}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Fallback when both are missing */}
                        {!current.image && !current.text && (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100 min-h-[320px] md:min-h-[400px] p-8">
                            <div className="h-20 w-20 rounded-full bg-white shadow-xl flex items-center justify-center mb-6">
                              <Award className="h-10 w-10 text-orange-500" />
                            </div>
                            <p className="text-gray-600 text-lg font-medium">No content available</p>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      {count > 1 && (
                        <>
                          <button
                            aria-label="Previous highlight"
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg"
                            onClick={() => setHighlightIndex(i => (i - 1 + count) % count)}
                          >
                            <ChevronLeft className="h-5 w-5 text-gray-800" />
                          </button>
                          <button
                            aria-label="Next highlight"
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg"
                            onClick={() => setHighlightIndex(i => (i + 1) % count)}
                          >
                            <ChevronRight className="h-5 w-5 text-gray-800" />
                          </button>
                          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-2 pb-6">
                            {items.map((_, idx) => (
                              <button
                                key={idx}
                                aria-label={`Go to highlight ${idx + 1}`}
                                className={`h-2 rounded-full transition-all ${idx === ((highlightIndex % count + count) % count) ? 'bg-orange-600 w-8' : 'bg-orange-300 w-2'}`}
                                onClick={() => setHighlightIndex(idx)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Team Section (moved to sidebar) */}

              {/* Legacy Team Members */}
              {project.team_members && project.team_members.length > 0 && (!project.team_roles || project.team_roles.length === 0) && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Team Members</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.team_members.map((member: string, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 border border-gray-200 transition-all">
                        <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                          <AvatarFallback className="bg-gradient-to-br from-pink-100 to-blue-100 text-gray-700 font-bold">
                          {typeof member === 'string' ? member.split(' ').map(n => n[0]).join('') : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-gray-900">{member}</p>
                          <p className="text-sm text-gray-500">Team Member</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Partners */}
              {project.partners && project.partners.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-sm border border-indigo-100 p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Handshake className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Partners & Collaborators</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.partners.map((partner: string, index: number) => (
                      <div key={index} className="p-6 rounded-xl border-2 border-indigo-200 bg-white text-center hover:border-indigo-400 hover:shadow-lg transition-all group">
                        <div className="h-16 w-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <Handshake className="h-8 w-8 text-indigo-600" />
                        </div>
                        <p className="font-bold text-gray-900">{partner}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Open Positions */}
              {project.positions && project.positions.filter(p => p.is_active).length > 0 && (
                <div data-section="positions" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Open Positions</h2>
                      <p className="text-sm text-gray-500">Join our team and make an impact</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {project.positions.filter(p => p.is_active).map((position) => (
                      <div 
                        key={position.id}
                        className="p-6 rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{position.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{position.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <Badge 
                              variant={position.is_active ? "default" : "secondary"}
                              className="whitespace-nowrap bg-green-100 text-green-700 border-green-200"
                            >
                              {position.is_active ? 'Active' : 'Filled'}
                            </Badge>
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {position.filled_count}/{position.count} filled
                            </span>
                          </div>
                        </div>
                        
                        {/* Position Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                          {position.stipend && (
                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-green-50 border-2 border-green-200">
                              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Stipend</p>
                                <p className="text-lg font-bold text-green-600">₹{position.stipend.toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                          {position.duration && (
                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
                              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Clock className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Duration</p>
                                <p className="text-lg font-bold text-blue-600">{position.duration}</p>
                              </div>
                            </div>
                          )}
                          {position.location && (
                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-purple-50 border-2 border-purple-200">
                              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Location</p>
                                <p className="text-lg font-bold text-purple-600">{position.location}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {position.required_skills && position.required_skills.length > 0 && (
                          <div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                            <p className="text-sm font-bold text-gray-700 mb-3">Required Skills:</p>
                            <div className="flex flex-wrap gap-2">
                              {position.required_skills.map((skill, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-sm bg-white border-2 border-blue-300 text-blue-700 px-3 py-1 font-medium"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {position.selected_students && position.selected_students.length > 0 && (
                          <div className="mt-4 pt-4 border-t-2 border-gray-200">
                            <p className="text-sm font-bold text-gray-700 mb-3">Selected Candidates:</p>
                            <div className="space-y-2">
                              {position.selected_students.map((student) => (
                                <div 
                                  key={student.id}
                                  className="flex items-center space-x-3 p-3 rounded-xl bg-green-50 border-2 border-green-200 cursor-pointer hover:bg-green-100 hover:scale-105 transition-all"
                                  onClick={() => {
                                    setProfileModalUserId(student.id)
                                    setIsProfileModalOpen(true)
                                  }}
                                >
                                  <Avatar className="h-10 w-10 ring-2 ring-green-300">
                                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold">
                                      {student?.name ? student.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="font-bold text-gray-900">{student.name}</p>
                                    <p className="text-xs text-gray-600">{student.email}</p>
                                  </div>
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {user && user.role === 'student' && position.is_active && (
                          <div className="mt-4">
                            {positionApplications[position.id.toString()] ? (
                              <div className={`p-5 rounded-xl border-2 ${
                                positionApplications[position.id.toString()].status === 'accepted' 
                                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                                  : positionApplications[position.id.toString()].status === 'declined' 
                                  ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300' 
                                  : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                              }`}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    {positionApplications[position.id.toString()].status === 'accepted' ? (
                                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-7 w-7 text-green-600" />
                                      </div>
                                    ) : positionApplications[position.id.toString()].status === 'declined' ? (
                                      <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <X className="h-7 w-7 text-red-600" />
                                      </div>
                                    ) : (
                                      <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <Clock className="h-7 w-7 text-yellow-600" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-bold text-gray-900 text-lg">
                                        {positionApplications[position.id.toString()].status === 'accepted' 
                                          ? 'Application Accepted!' 
                                          : positionApplications[position.id.toString()].status === 'declined' 
                                          ? 'Application Declined' 
                                          : 'Application Pending'}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Applied on {new Date(positionApplications[position.id.toString()].applied_at).toLocaleDateString()}
                                        {positionApplications[position.id.toString()].is_legacy && (
                                          <span className="ml-2 text-xs text-blue-600">(General Application)</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge 
                                    className={`${
                                      positionApplications[position.id.toString()].status === 'accepted' ? 'bg-green-600 text-white' : 
                                      positionApplications[position.id.toString()].status === 'declined' ? 'bg-red-600 text-white' : 
                                      'bg-yellow-600 text-white'
                                    } border-0 font-bold px-4 py-2 text-sm`}
                                  >
                                    {positionApplications[position.id.toString()].status.toUpperCase()}
                                  </Badge>
                                </div>
                                {positionApplications[position.id.toString()].status === 'pending' && (
                                  <p className="text-sm text-gray-600 mt-2 pl-15">
                                    Your application is under review. We'll notify you once a decision is made.
                                  </p>
                                )}
                                {positionApplications[position.id.toString()].status === 'accepted' && (
                                  <p className="text-sm text-green-700 mt-2 pl-15 font-medium">
                                    Congratulations! The project creator will contact you soon.
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Dialog open={isApplyDialogOpen && selectedPosition === position.id} onOpenChange={(open) => {
                                setIsApplyDialogOpen(open)
                                if (!open) {
                                  setSelectedPosition(null)
                                  setApplicationMessage('')
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 rounded-xl shadow-lg"
                                    onClick={() => {
                                      setSelectedPosition(position.id)
                                      setIsApplyDialogOpen(true)
                                    }}
                                  >
                                    Apply for this position →
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Apply for {position.title}</DialogTitle>
                                    <DialogDescription>
                                      Write a message to introduce yourself and explain why you're interested in this position.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Textarea
                                      placeholder="Tell us about yourself and why you want this position..."
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
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Topics</h2>
                  <div className="flex flex-wrap gap-3">
                    {project.tags.map((tag: string) => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 font-medium cursor-pointer transition-all"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Status or Apply CTA */}
              {user && user.role === 'student' && project.status === 'active' && (
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-lg border border-blue-300 overflow-hidden">
                  <div className="p-6">
                    {Object.keys(positionApplications).length > 0 ? (
                      <div className="text-white">
                        <div className="text-center mb-4">
                          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">Your Applications</h3>
                          <p className="text-sm text-blue-100">
                            You have applied to {Object.keys(positionApplications).length} position{Object.keys(positionApplications).length > 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          {Object.entries(positionApplications).map(([posId, app]) => {
                            const position = project.positions?.find(p => p.id.toString() === posId)
                            return (
                              <div key={posId} className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-bold text-white text-sm">{position?.title || 'Position'}</p>
                                    <p className="text-xs text-blue-100">Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                                  </div>
                                  <Badge 
                                    className={`${
                                      app.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                                      app.status === 'declined' ? 'bg-red-100 text-red-700' : 
                                      'bg-yellow-100 text-yellow-700'
                                    } border-0 font-bold text-xs`}
                                  >
                                    {app.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        
                        {project.positions && project.positions.filter(p => p.is_active && !positionApplications[p.id.toString()]).length > 0 && (
                          <Button 
                            size="lg" 
                            className="w-full mt-4 bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg py-6 rounded-xl shadow-lg"
                            onClick={() => {
                              const positionsSection = document.querySelector('[data-section="positions"]')
                              if (positionsSection) {
                                positionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }
                            }}
                          >
                            Apply to More Positions
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-white">
                        <h3 className="text-xl font-bold mb-2">Interested?</h3>
                        <p className="text-sm text-blue-100 mb-6">
                          Apply for open positions and be part of something amazing!
                        </p>
                        <Button 
                          size="lg" 
                          className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg py-6 rounded-xl shadow-lg"
                          onClick={() => {
                            const positionsSection = document.querySelector('[data-section="positions"]')
                            if (positionsSection) {
                              positionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                          }}
                        >
                          View Open Positions
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Meet The Team (Sidebar) */}
              {project.team_roles && project.team_roles.length > 0 && (() => {
                const categorizeRole = (role: string): string => {
                  const roleLower = role.toLowerCase()
                  if (roleLower.includes('advisor') || roleLower.includes('mentor')) return 'Advisors'
                  if (roleLower.includes('lead') || roleLower.includes('head') || roleLower.includes('ceo') || roleLower.includes('cto') || roleLower.includes('founder') || roleLower.includes('director') || roleLower.includes('chief')) return 'Leadership'
                  if (roleLower.includes('investor') || roleLower.includes('partner')) return 'Investors'
                  if (roleLower.includes('intern') || roleLower.includes('trainee')) return 'Interns'
                  if (roleLower.includes('developer') || roleLower.includes('engineer') || roleLower.includes('designer')) return 'Core Team'
                  return 'Team Members'
                }

                const categorized = project.team_roles.reduce((acc: Record<string, typeof project.team_roles>, member) => {
                  const category = categorizeRole(member.role)
                  if (!acc[category]) acc[category] = []
                  acc[category].push(member)
                  return acc
                }, {} as Record<string, typeof project.team_roles>)

                const toggleCategory = (category: string) => {
                  setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))
                }

                const categoryColors: Record<string, { bg: string, icon: string, border: string, gradient: string }> = {
                  'Leadership': { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-500 to-pink-500' },
                  'Advisors': { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-500 to-cyan-500' },
                  'Investors': { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-200', gradient: 'from-green-500 to-emerald-500' },
                  'Core Team': { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-200', gradient: 'from-orange-500 to-red-500' },
                  'Interns': { bg: 'bg-pink-50', icon: 'text-pink-600', border: 'border-pink-200', gradient: 'from-pink-500 to-rose-500' },
                  'Team Members': { bg: 'bg-gray-50', icon: 'text-gray-600', border: 'border-gray-200', gradient: 'from-gray-500 to-slate-500' }
                }

                return (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <button
                        onClick={() => setIsTeamExpanded(!isTeamExpanded)}
                        className="w-full flex items-center justify-between hover:bg-gray-50 p-4 rounded-xl transition-all"
                      >
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-gray-900">Meet The Team</h3>
                          <p className="text-xs text-gray-500 font-medium">{project.team_roles.length} members</p>
                        </div>
                        <div className={`p-2 rounded-full bg-gray-100 transition-transform ${isTeamExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        </div>
                      </button>

                      {isTeamExpanded && (
                        <div className="mt-4 space-y-3">
                          {Object.entries(categorized).map(([category, members]) => {
                            const colors = categoryColors[category] || categoryColors['Team Members']
                            const isExpanded = expandedCategories[category] !== false
                            return (
                              <div key={category} className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all">
                                <button
                                  onClick={() => toggleCategory(category)}
                                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={`h-10 w-10 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center shadow-md`}>
                                      <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                      <h4 className="text-sm font-bold text-gray-900">{category}</h4>
                                      <p className="text-xs text-gray-500">{members.length} {members.length === 1 ? 'member' : 'members'}</p>
                                    </div>
                                  </div>
                                  <div className={`p-2 rounded-full ${colors.bg} transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                    <ChevronDown className={`h-4 w-4 ${colors.icon}`} />
                                  </div>
                                </button>
                                {isExpanded && (
                                  <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
                                    <div className="space-y-2">
                                      {members.map((member, index) => (
                                        <div key={index} className="p-3 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-all">
                                          <div className="flex items-start space-x-3">
                                            <Avatar className="h-10 w-10 ring-1 ring-gray-200">
                                              <AvatarFallback className={`bg-gradient-to-br ${colors.gradient} text-white text-sm font-bold`}>
                                                {member?.name ? member.name.split(' ').map(n => n[0]).join('') : '?'}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-bold text-gray-900 text-sm truncate">{member.name}</p>
                                              <p className={`text-xs font-medium ${colors.icon} mb-1 truncate`}>{member.role}</p>
                                              {member.skills && member.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                  {member.skills.map((skill, idx) => (
                                                    <Badge key={idx} variant="outline" className={`text-[10px] ${colors.bg} ${colors.border} ${colors.icon} font-medium`}>
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
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Contact Details */}
              {project.contact_details && (project.contact_details.email || project.contact_details.phone || project.contact_details.website) && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Get In Touch</h3>
                    <div className="space-y-3">
                      {project.contact_details.email && (
                        <a href={`mailto:${project.contact_details.email}`} className="flex items-center space-x-3 p-4 rounded-xl hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-200 group">
                          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Mail className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Email</p>
                            <p className="font-semibold text-gray-900 truncate">{project.contact_details.email}</p>
                          </div>
                        </a>
                      )}
                      {project.contact_details.phone && (
                        <a href={`tel:${project.contact_details.phone}`} className="flex items-center space-x-3 p-4 rounded-xl hover:bg-green-50 transition-all border-2 border-transparent hover:border-green-200 group">
                          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Phone className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Phone</p>
                            <p className="font-semibold text-gray-900">{project.contact_details.phone}</p>
                          </div>
                        </a>
                      )}
                      {project.contact_details.website && (
                        <a href={project.contact_details.website.startsWith('http') ? project.contact_details.website : `https://${project.contact_details.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-4 rounded-xl hover:bg-purple-50 transition-all border-2 border-transparent hover:border-purple-200 group">
                          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Globe className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Website</p>
                            <p className="font-semibold text-gray-900 truncate">{project.contact_details.website}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Project Stats */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Facts</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">Posted</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">Team Size</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {project.team_roles ? project.team_roles.length : project.team_members?.length || 0} members
                      </span>
                    </div>
                    {project.funding && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-600">Funding</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">{project.funding}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Related Projects */}
              {related.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Projects</h3>
                    <div className="space-y-3">
                      {related.map((rp) => (
                        <div 
                          key={rp.id} 
                          className="p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer border-2 border-gray-100 hover:border-blue-200 transition-all group"
                          onClick={() => navigate(`/projects/${rp.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-gray-900 truncate mr-2 group-hover:text-blue-600 transition-colors">{rp.title}</p>
                            <Badge variant="secondary" className="capitalize shrink-0">{rp.status}</Badge>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{rp.description}</p>
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
