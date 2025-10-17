import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { ProfileModal } from '../components/ProfileModal'
import { 
  Loader2, 
  Search, 
  Building, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Filter,
  X,
  UserPlus,
  Mail,
  Linkedin,
  Github
} from 'lucide-react'
import { Textarea } from '../components/ui/textarea'

interface Alumni {
  id: number
  name: string
  email: string
  graduation_year?: number
  department?: string
  hall?: string
  branch?: string
  bio?: string
  current_company?: string
  current_position?: string
  location?: string
  work_preference?: string
  linkedin?: string
  github?: string
  years_of_experience?: number
  domain?: string
  tech_skills?: string[]
  is_available?: boolean
}

export const FindMentorsPage: React.FC = () => {
  const { token } = useAuth()
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [filteredAlumni, setFilteredAlumni] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlumni, setSelectedAlumni] = useState<number | null>(null)
  const [showMentorshipModal, setShowMentorshipModal] = useState(false)
  const [mentorshipAlumniId, setMentorshipAlumniId] = useState<number | null>(null)
  const [mentorshipMessage, setMentorshipMessage] = useState('')
  const [sendingRequest, setSendingRequest] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [workPreferenceFilter, setWorkPreferenceFilter] = useState<string>('all')
  const [experienceFilter, setExperienceFilter] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const res = await fetch('https://alumconnect-s4c7.onrender.com/api/alumni', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setAlumni(data)
          setFilteredAlumni(data)
        }
      } catch (error) {
        console.error('Error fetching alumni:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAlumni()
  }, [token])

  // Apply filters
  useEffect(() => {
    let filtered = [...alumni]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.current_company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.current_position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(a => a.department === departmentFilter)
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(a => a.location === locationFilter)
    }

    // Company filter
    if (companyFilter !== 'all') {
      filtered = filtered.filter(a => a.current_company === companyFilter)
    }

    // Year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(a => a.graduation_year?.toString() === yearFilter)
    }

    // Domain filter
    if (domainFilter !== 'all') {
      filtered = filtered.filter(a => a.domain === domainFilter)
    }

    // Work preference filter
    if (workPreferenceFilter !== 'all') {
      filtered = filtered.filter(a => a.work_preference === workPreferenceFilter)
    }

    // Experience filter
    if (experienceFilter !== 'all') {
      if (experienceFilter === '0-2') {
        filtered = filtered.filter(a => a.years_of_experience !== undefined && a.years_of_experience <= 2)
      } else if (experienceFilter === '3-5') {
        filtered = filtered.filter(a => a.years_of_experience !== undefined && a.years_of_experience >= 3 && a.years_of_experience <= 5)
      } else if (experienceFilter === '6-10') {
        filtered = filtered.filter(a => a.years_of_experience !== undefined && a.years_of_experience >= 6 && a.years_of_experience <= 10)
      } else if (experienceFilter === '10+') {
        filtered = filtered.filter(a => a.years_of_experience !== undefined && a.years_of_experience > 10)
      }
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      if (availabilityFilter === 'available') {
        filtered = filtered.filter(a => a.is_available === true)
      } else if (availabilityFilter === 'unavailable') {
        filtered = filtered.filter(a => a.is_available === false)
      }
    }

    setFilteredAlumni(filtered)
  }, [searchQuery, departmentFilter, locationFilter, companyFilter, yearFilter, domainFilter, workPreferenceFilter, experienceFilter, availabilityFilter, alumni])

  const clearFilters = () => {
    setSearchQuery('')
    setDepartmentFilter('all')
    setLocationFilter('all')
    setCompanyFilter('all')
    setYearFilter('all')
    setDomainFilter('all')
    setWorkPreferenceFilter('all')
    setExperienceFilter('all')
    setAvailabilityFilter('all')
  }

  const handleRequestMentorship = (alumniId: number) => {
    setMentorshipAlumniId(alumniId)
    setShowMentorshipModal(true)
  }

  const sendMentorshipRequest = async () => {
    if (!mentorshipMessage.trim() || !mentorshipAlumniId) return

    setSendingRequest(true)
    try {
      const res = await fetch('https://alumconnect-s4c7.onrender.com/api/mentorship/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          alumni_id: mentorshipAlumniId,
          message: mentorshipMessage
        })
      })

      if (res.ok) {
        alert('Mentorship request sent successfully!')
        setShowMentorshipModal(false)
        setMentorshipMessage('')
        setMentorshipAlumniId(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to send request')
      }
    } catch (error) {
      console.error('Error sending mentorship request:', error)
      alert('Failed to send request')
    } finally {
      setSendingRequest(false)
    }
  }

  // Get unique values for filters
  const departments = Array.from(new Set(alumni.map(a => a.department).filter(Boolean)))
  const years = Array.from(new Set(alumni.map(a => a.graduation_year).filter(Boolean))).sort((a, b) => b! - a!)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="relative mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 leading-tight">
            Find Mentors
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with experienced alumni who can guide you in your career journey
          </p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
        </div>

        {/* Filters Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-purple-600" />
                <CardTitle>Filters</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-600 hover:text-gray-900">
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, company, position, or bio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Department */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Graduation Year */}
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Graduation Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Passout Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year!.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Experience */}
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience</SelectItem>
                  <SelectItem value="0-2">0-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="6-10">6-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>

              {/* Availability */}
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alumni</SelectItem>
                  <SelectItem value="available">Available for Mentorship</SelectItem>
                  <SelectItem value="unavailable">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-purple-600">{filteredAlumni.length}</span> of{' '}
            <span className="font-semibold">{alumni.length}</span> alumni
          </p>
        </div>

        {/* Alumni Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredAlumni.length === 0 ? (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No alumni found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters to see more results</p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((alumnus) => (
              <Card 
                key={alumnus.id} 
                className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-purple-200">
                      <AvatarImage 
                        src={alumnus.email ? `https://alumconnect-s4c7.onrender.com/api/profile/picture/${alumnus.email}` : undefined}
                        alt={alumnus.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                        {alumnus.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 truncate">{alumnus.name}</h3>
                      {alumnus.current_position && (
                        <p className="text-sm text-gray-600 truncate">{alumnus.current_position}</p>
                      )}
                      {alumnus.current_company && (
                        <p className="text-sm text-purple-600 font-medium truncate">{alumnus.current_company}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  {/* Info badges */}
                  <div className="flex flex-wrap gap-2">
                    {alumnus.is_available !== undefined && (
                      <Badge 
                        variant={alumnus.is_available ? "default" : "secondary"} 
                        className={`text-xs ${alumnus.is_available ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
                      >
                        {alumnus.is_available ? '✓ Available' : 'Not Available'}
                      </Badge>
                    )}
                    {alumnus.graduation_year && (
                      <Badge variant="secondary" className="text-xs">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Class of {alumnus.graduation_year}
                      </Badge>
                    )}
                    {alumnus.department && (
                      <Badge variant="secondary" className="text-xs">
                        {alumnus.department}
                      </Badge>
                    )}
                  </div>

                  {/* Additional info */}
                  <div className="space-y-2 text-sm">
                    {alumnus.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-purple-500" />
                        <span className="truncate">{alumnus.location}</span>
                      </div>
                    )}
                    {alumnus.domain && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        <span className="truncate">{alumnus.domain}</span>
                      </div>
                    )}
                    {alumnus.years_of_experience !== undefined && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="h-4 w-4 text-green-500" />
                        <span>{alumnus.years_of_experience} years experience</span>
                      </div>
                    )}
                  </div>

                  {/* Bio preview */}
                  {alumnus.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">{alumnus.bio}</p>
                  )}

                  {/* Tech skills */}
                  {alumnus.tech_skills && alumnus.tech_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {alumnus.tech_skills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {alumnus.tech_skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{alumnus.tech_skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Social links */}
                  <div className="flex gap-2 pt-2">
                    {alumnus.linkedin && (
                      <a 
                        href={alumnus.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <Linkedin className="h-4 w-4 text-blue-600" />
                      </a>
                    )}
                    {alumnus.github && (
                      <a 
                        href={alumnus.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <Github className="h-4 w-4 text-gray-700" />
                      </a>
                    )}
                    {alumnus.email && (
                      <a 
                        href={`mailto:${alumnus.email}`}
                        className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                      >
                        <Mail className="h-4 w-4 text-purple-600" />
                      </a>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => setSelectedAlumni(alumnus.id)}
                      variant="outline"
                      className="flex-1 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                    >
                      View Profile
                    </Button>
                    <Button 
                      onClick={() => handleRequestMentorship(alumnus.id)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Request Mentorship
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedAlumni && (
        <ProfileModal
          userId={selectedAlumni}
          isOpen={!!selectedAlumni}
          onClose={() => setSelectedAlumni(null)}
        />
      )}

      {/* Mentorship Request Modal */}
      {showMentorshipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowMentorshipModal(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Request Mentorship</h2>
              <Button
                onClick={() => setShowMentorshipModal(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-4">
              Send a mentorship request to connect with this alumni. Include a brief message about why you'd like their guidance.
            </p>
            <Textarea
              placeholder="Write your message here..."
              value={mentorshipMessage}
              onChange={(e) => setMentorshipMessage(e.target.value)}
              rows={5}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => setShowMentorshipModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={sendMentorshipRequest}
                disabled={!mentorshipMessage.trim() || sendingRequest}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {sendingRequest ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
