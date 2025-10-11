import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { WavesBackground } from '../components/ui/waves-background'
import { BGPattern } from '../components/ui/bg-pattern'
import { Briefcase, Search, Filter, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

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
  created_by_name: string
  created_by_email: string
  has_applied?: boolean
  is_recruiting?: boolean
}

export const ProjectsPage: React.FC = () => {
  const { token, user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAvailability, setSelectedAvailability] = useState('all')
  const [selectedRecruitment, setSelectedRecruitment] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    filterProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, searchTerm, selectedCategory, selectedAvailability, selectedRecruitment])

  const fetchProjects = async () => {
    try {
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('https://alumconnect-s4c7.onrender.com/api/projects', {
        headers
      })
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    // Filter by search term (searches across title, description, tags, team members, skills, and creator name)
    if (searchTerm.trim()) {
      filtered = filtered.filter(project => {
        const searchLower = searchTerm.toLowerCase().trim()
        
        // Search in title
        const titleMatch = project.title?.toLowerCase().includes(searchLower) || false
        
        // Search in description
        const descMatch = project.description?.toLowerCase().includes(searchLower) || false
        
        // Search in tags
        const tagMatch = Array.isArray(project.tags) && project.tags.length > 0 
          ? project.tags.some(tag => tag && String(tag).toLowerCase().includes(searchLower))
          : false
        
        // Search in team members
        const memberMatch = Array.isArray(project.team_members) && project.team_members.length > 0
          ? project.team_members.some(member => member && String(member).toLowerCase().includes(searchLower))
          : false
        
        // Search in skills required
        const skillMatch = Array.isArray(project.skills_required) && project.skills_required.length > 0
          ? project.skills_required.some(skill => skill && String(skill).toLowerCase().includes(searchLower))
          : false
        
        // Search in creator name
        const creatorMatch = project.created_by_name?.toLowerCase().includes(searchLower) || false
        
        // Search in category
        const categoryMatch = project.category?.toLowerCase().includes(searchLower) || false
        
        return titleMatch || descMatch || tagMatch || memberMatch || skillMatch || creatorMatch || categoryMatch
      })
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory)
    }

    // Filter by availability (only for students)
    if (user?.role === 'student' && selectedAvailability !== 'all') {
      if (selectedAvailability === 'available') {
        filtered = filtered.filter(project => !project.has_applied)
      } else if (selectedAvailability === 'not_available') {
        filtered = filtered.filter(project => project.has_applied)
      }
    }

    // Filter by recruitment status
    if (selectedRecruitment !== 'all') {
      if (selectedRecruitment === 'recruiting') {
        filtered = filtered.filter(project => project.is_recruiting !== false)
      } else if (selectedRecruitment === 'not_recruiting') {
        filtered = filtered.filter(project => project.is_recruiting === false)
      }
    }

    setFilteredProjects(filtered)
  }

  const getUniqueCategories = () => {
    const categories = projects.map(project => project.category)
    return Array.from(new Set(categories))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading projects...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 relative">
      {/* Grid Background Pattern */}
      <BGPattern 
        variant="grid" 
        size={30} 
        fill="#e5e7eb" 
        mask="fade-edges"
        className="opacity-10 blur-[90%]"
      />
      
      {/* Waves Background */}
      <WavesBackground 
        className="fixed inset-0 z-0 opacity-30" 
        color="#e5e7eb" 
        waveCount={2}
        speed={15}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Projects</h1>
          <p className="text-xl text-muted-foreground">
            Discover innovative projects from our talented students and alumni
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title, description, tags, skills, members, or creator..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {getUniqueCategories().map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedRecruitment} onValueChange={setSelectedRecruitment}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Recruitment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="recruiting">Currently Recruiting</SelectItem>
              <SelectItem value="not_recruiting">Not Recruiting</SelectItem>
            </SelectContent>
          </Select>
          {user?.role === 'student' && (
            <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="not_available">Already Applied</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <Badge 
                        variant={project.status === 'active' ? 'default' : 'secondary'}
                        className="px-3 py-1 text-sm"
                      >
                        {project.status}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1 text-sm">
                        {project.category}
                      </Badge>
                      {project.is_recruiting !== false ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300 px-3 py-1 text-sm">
                          Recruiting
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 px-3 py-1 text-sm">
                          Not Recruiting
                        </Badge>
                      )}
                      {user?.role === 'student' && project.has_applied && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 px-3 py-1 text-sm">
                          Applied
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                    <CardDescription className="text-base line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/projects/${project.id}`} className="flex items-center gap-2">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8">
                  {/* Tags Section */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Skills Section */}
                  {project.skills_required && project.skills_required.length > 0 && (
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {project.skills_required.slice(0, 4).map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {skill}
                          </Badge>
                        ))}
                        {project.skills_required.length > 4 && (
                          <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                            +{project.skills_required.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}