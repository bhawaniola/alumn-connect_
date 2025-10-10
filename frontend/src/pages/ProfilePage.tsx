import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { GraduationCap, Building, MapPin, Briefcase, Award, Globe, Code, MessageCircle, Edit, Save, X, Plus, Trash2, Home, Calendar, Phone, Camera, FileText, Upload, Download } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface Skill {
  name: string
  type: 'technical' | 'soft' | 'language'
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

interface Achievement {
  title: string
  description?: string
  type: 'award' | 'certification' | 'project' | 'publication' | 'other'
  date_earned?: string
  issuer?: string
}

interface Language {
  name: string
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native'
}

interface PastProject {
  title: string
  description?: string
  technologies?: string[]
  year?: string
}

interface Profile {
  id: number
  name: string
  email: string
  role: 'student' | 'alumni'
  graduation_year?: number
  department?: string
  avatar?: string
  bio?: string
  hall?: string
  branch?: string
  current_company?: string
  current_position?: string
  location?: string
  work_preference?: 'onsite' | 'remote' | 'hybrid'
  skills?: Skill[]
  achievements?: Achievement[]
  languages?: Language[]
  phone?: string
  website?: string
  linkedin?: string
  github?: string
  cv_pdf?: string
  // Student-specific fields
  program?: string
  joining_year?: number
  institute?: string
  specialization?: string
  past_projects?: PastProject[]
}

export const ProfilePage: React.FC = () => {
  const { token, user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Profile | null>(null)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('https://alumconnect-s4c7.onrender.com/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        } else if (user) {
          // Fallback to context user if API is unavailable
          setProfile({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            graduation_year: user.graduation_year,
            department: user.department,
            skills: [],
            achievements: [],
            languages: []
          })
        }
      } finally {
        setLoading(false)
      }
    }
    if (token) {
      load()
    } else if (user) {
      // No token (e.g., after hard refresh), still show from context
      setProfile({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        graduation_year: user.graduation_year,
        department: user.department,
        skills: [],
        achievements: [],
        languages: []
      })
      setLoading(false)
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleEdit = () => {
    setEditForm(profile)
    setEditing(true)
  }

  const handleCancel = () => {
    setEditForm(null)
    setEditing(false)
  }

  const handleSave = async () => {
    if (!editForm || !token) return
    
    setSaving(true)
    try {
      const res = await fetch('https://alumconnect-s4c7.onrender.com/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })
      
      if (res.ok) {
        setProfile(editForm)
        setEditing(false)
        setEditForm(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !token) return

    setUploadingPicture(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('https://alumconnect-s4c7.onrender.com/api/profile/upload-picture', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (res.ok) {
        // Reload profile to get updated avatar
        const profileRes = await fetch('https://alumconnect-s4c7.onrender.com/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
        }
      }
    } catch (error) {
      console.error('Error uploading picture:', error)
    } finally {
      setUploadingPicture(false)
    }
  }

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !token) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file')
      return
    }

    setUploadingCV(true)
    try {
      const formData = new FormData()
      formData.append('cv', file)

      const res = await fetch('https://alumconnect-s4c7.onrender.com/api/profile/cv', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (res.ok) {
        // Reload profile to get updated CV
        const profileRes = await fetch('https://alumconnect-s4c7.onrender.com/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
        }
        alert('CV uploaded successfully!')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to upload CV')
      }
    } catch (error) {
      console.error('Error uploading CV:', error)
      alert('Error uploading CV')
    } finally {
      setUploadingCV(false)
    }
  }

  const handleDeleteCV = async () => {
    if (!token || !confirm('Are you sure you want to delete your CV?')) return

    try {
      const res = await fetch('https://alumconnect-s4c7.onrender.com/api/profile/cv', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.ok) {
        // Reload profile
        const profileRes = await fetch('https://alumconnect-s4c7.onrender.com/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
        }
        alert('CV deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting CV:', error)
      alert('Error deleting CV')
    }
  }

  const addSkill = () => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      skills: [...(editForm.skills || []), { name: '', type: 'technical', proficiency: 'intermediate' }]
    })
  }

  const removeSkill = (index: number) => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      skills: editForm.skills?.filter((_, i) => i !== index) || []
    })
  }

  const addAchievement = () => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      achievements: [...(editForm.achievements || []), { title: '', type: 'award' }]
    })
  }

  const removeAchievement = (index: number) => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      achievements: editForm.achievements?.filter((_, i) => i !== index) || []
    })
  }

  const addLanguage = () => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      languages: [...(editForm.languages || []), { name: '', proficiency: 'intermediate' }]
    })
  }

  const removeLanguage = (index: number) => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      languages: editForm.languages?.filter((_, i) => i !== index) || []
    })
  }

  const addPastProject = () => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      past_projects: [...(editForm.past_projects || []), { title: '', description: '', technologies: [], year: '' }]
    })
  }

  const removePastProject = (index: number) => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      past_projects: editForm.past_projects?.filter((_, i) => i !== index) || []
    })
  }

  const updatePastProject = (index: number, field: keyof PastProject, value: string | string[]) => {
    if (!editForm) return
    const updated = [...(editForm.past_projects || [])]
    updated[index] = { ...updated[index], [field]: value }
    setEditForm({
      ...editForm,
      past_projects: updated
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Unable to load profile.</p>
      </div>
    )
  }

  const currentProfile = editing ? editForm : profile
  if (!currentProfile) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Header Section */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={currentProfile.avatar ? `https://alumconnect-s4c7.onrender.com/api/profile/picture/${currentProfile.avatar}` : undefined} 
                    alt={currentProfile.name} 
                  />
                  <AvatarFallback className="text-2xl bg-white text-blue-600">
                    {currentProfile.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePictureUpload}
                    className="hidden"
                    id="profile-picture-upload"
                    disabled={uploadingPicture}
                  />
                  <label 
                    htmlFor="profile-picture-upload"
                    className="inline-block cursor-pointer"
                  >
                    <div className="rounded-full h-8 w-8 p-0 bg-white text-blue-600 hover:bg-gray-100 flex items-center justify-center shadow-md border border-gray-200">
                      {uploadingPicture ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{currentProfile.name}</h1>
                <p className="text-blue-100 mb-4">{currentProfile.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {currentProfile.role === 'alumni' ? 'Founder' : 'Student'}
                  </Badge>
                  {currentProfile.graduation_year && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      Class of {currentProfile.graduation_year}
                    </Badge>
                  )}
                  {currentProfile.department && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {currentProfile.department}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!editing ? (
                  <Button onClick={handleEdit} className="bg-white text-blue-600 hover:bg-gray-100">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel} className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-white text-blue-600 hover:bg-gray-100">
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Bio & Contact Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {/* <User className="h-5 w-5" /> */}
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={currentProfile.bio || ''}
                        onChange={(e) => setEditForm({...currentProfile, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="bg-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={currentProfile.phone || ''}
                        onChange={(e) => setEditForm({...currentProfile, phone: e.target.value})}
                        placeholder="Phone number"
                        className="bg-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={currentProfile.website || ''}
                        onChange={(e) => setEditForm({...currentProfile, website: e.target.value})}
                        placeholder="Personal website"
                        className="bg-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={currentProfile.linkedin || ''}
                        onChange={(e) => setEditForm({...currentProfile, linkedin: e.target.value})}
                        placeholder="LinkedIn profile"
                        className="bg-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="github">GitHub</Label>
                      <Input
                        id="github"
                        value={currentProfile.github || ''}
                        onChange={(e) => setEditForm({...currentProfile, github: e.target.value})}
                        placeholder="GitHub profile"
                        className="bg-white/50"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {currentProfile.bio && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{currentProfile.bio}</p>
                    )}
                    <div className="space-y-3">
                      {currentProfile.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-blue-600" />
                          <span>{currentProfile.phone}</span>
                        </div>
                      )}
                      {currentProfile.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <a href={currentProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {currentProfile.website}
                          </a>
                        </div>
                      )}
                      {currentProfile.linkedin && (
                        <div className="flex items-center gap-2 text-sm">
                          <Code className="h-4 w-4 text-blue-600" />
                          <a href={currentProfile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                      {currentProfile.github && (
                        <div className="flex items-center gap-2 text-sm">
                          <Code className="h-4 w-4 text-blue-600" />
                          <a href={currentProfile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            GitHub Profile
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 space-y-2">
                      <Link to='/messages'>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
            </CardContent>
          </Card>

          {/* CV/Resume Card - Only for Students */}
          {user?.role === 'student' && (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Resume / CV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentProfile.cv_pdf ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">CV Document</p>
                          <p className="text-sm text-gray-500">PDF Format</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          onClick={() => window.open(`https://alumconnect-s4c7.onrender.com/api/profile/cv/${currentProfile.cv_pdf}`, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={handleDeleteCV}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete CV
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-white rounded-lg border-2 border-dashed border-blue-300">
                    <FileText className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">Upload your CV/Resume (PDF only)</p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleCVUpload}
                      className="hidden"
                      id="cv-upload"
                      disabled={uploadingCV}
                    />
                    <label htmlFor="cv-upload">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={uploadingCV}
                        asChild
                      >
                        <span>
                          {uploadingCV ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload CV
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {/* <Briefcase className="h-5 w-5" /> */}
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {editing ? (
                  <>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={currentProfile.department || ''}
                        onChange={(e) => setEditForm({...currentProfile, department: e.target.value})}
                        placeholder="Department"
                        className="bg-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hall">Hall</Label>
                      <Input
                        id="hall"
                        value={currentProfile.hall || ''}
                        onChange={(e) => setEditForm({...currentProfile, hall: e.target.value})}
                        placeholder="Hall of Residence"
                        className="bg-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="branch">Branch</Label>
                      <Input
                        id="branch"
                        value={currentProfile.branch || ''}
                        onChange={(e) => setEditForm({...currentProfile, branch: e.target.value})}
                        placeholder="Branch/Stream"
                        className="bg-white/50"
                      />
                    </div>
                    {/* Student-specific fields */}
                    {currentProfile.role === 'student' && (
                      <>
                        <div>
                          <Label htmlFor="program">Program *</Label>
                          <Select
                            value={currentProfile.program || ''}
                            onValueChange={(value) => setEditForm({...currentProfile, program: value})}
                          >
                            <SelectTrigger className="bg-white/50">
                              <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B.Tech">B.Tech</SelectItem>
                              <SelectItem value="M.Tech">M.Tech</SelectItem>
                              <SelectItem value="PhD">PhD</SelectItem>
                              <SelectItem value="Dual Degree">Dual Degree</SelectItem>
                              <SelectItem value="Integrated M.Sc">Integrated M.Sc</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="institute">Institute *</Label>
                          <Input
                            id="institute"
                            value={currentProfile.institute || ''}
                            onChange={(e) => setEditForm({...currentProfile, institute: e.target.value})}
                            placeholder="e.g., IIT Kharagpur"
                            className="bg-white/50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="joining_year">Year of Joining *</Label>
                          <Input
                            id="joining_year"
                            type="number"
                            value={currentProfile.joining_year || ''}
                            onChange={(e) => setEditForm({...currentProfile, joining_year: parseInt(e.target.value)})}
                            placeholder="e.g., 2020"
                            className="bg-white/50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input
                            id="specialization"
                            value={currentProfile.specialization || ''}
                            onChange={(e) => setEditForm({...currentProfile, specialization: e.target.value})}
                            placeholder="e.g., Computer Science, AI/ML"
                            className="bg-white/50"
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Alumni-specific fields */}
                    {currentProfile.role === 'alumni' && (
                      <>
                        <div>
                          <Label htmlFor="current_company">Current Company</Label>
                          <Input
                            id="current_company"
                            value={currentProfile.current_company || ''}
                            onChange={(e) => setEditForm({...currentProfile, current_company: e.target.value})}
                            placeholder="Current Company"
                            className="bg-white/50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="current_position">Current Position</Label>
                          <Input
                            id="current_position"
                            value={currentProfile.current_position || ''}
                            onChange={(e) => setEditForm({...currentProfile, current_position: e.target.value})}
                            placeholder="Current Position"
                            className="bg-white/50"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={currentProfile.location || ''}
                        onChange={(e) => setEditForm({...currentProfile, location: e.target.value})}
                        placeholder="Location"
                        className="bg-white/50"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="work_preference">Work Preference</Label>
                      <Select
                        value={currentProfile.work_preference || ''}
                        onValueChange={(value) => setEditForm({...currentProfile, work_preference: value as 'onsite' | 'remote' | 'hybrid'})}
                      >
                        <SelectTrigger className="bg-white/50">
                          <SelectValue placeholder="Select work preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="onsite">Onsite</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    {currentProfile.department && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                        <div className="p-2 rounded-full bg-blue-100">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Department</p>
                          <p className="text-sm text-muted-foreground">{currentProfile.department}</p>
                        </div>
                      </div>
                    )}
                    {currentProfile.hall && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                        <div className="p-2 rounded-full bg-purple-100">
                          <Home className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Hall</p>
                          <p className="text-sm text-muted-foreground">{currentProfile.hall}</p>
                        </div>
                      </div>
                    )}
                    {currentProfile.branch && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                        <div className="p-2 rounded-full bg-green-100">
                          <Code className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Branch</p>
                          <p className="text-sm text-muted-foreground">{currentProfile.branch}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Student-specific display fields */}
                    {currentProfile.role === 'student' && (
                      <>
                        {currentProfile.program && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50">
                            <div className="p-2 rounded-full bg-cyan-100">
                              <GraduationCap className="h-4 w-4 text-cyan-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Program</p>
                              <p className="text-sm text-muted-foreground">{currentProfile.program}</p>
                            </div>
                          </div>
                        )}
                        {currentProfile.institute && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50">
                            <div className="p-2 rounded-full bg-amber-100">
                              <Building className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Institute</p>
                              <p className="text-sm text-muted-foreground">{currentProfile.institute}</p>
                            </div>
                          </div>
                        )}
                        {currentProfile.joining_year && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-lime-50">
                            <div className="p-2 rounded-full bg-lime-100">
                              <Calendar className="h-4 w-4 text-lime-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Joining Year</p>
                              <p className="text-sm text-muted-foreground">{currentProfile.joining_year}</p>
                            </div>
                          </div>
                        )}
                        {currentProfile.specialization && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50">
                            <div className="p-2 rounded-full bg-rose-100">
                              <Award className="h-4 w-4 text-rose-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Specialization</p>
                              <p className="text-sm text-muted-foreground">{currentProfile.specialization}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Alumni-specific display fields */}
                    {currentProfile.role === 'alumni' && (
                      <>
                        {currentProfile.current_company && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                            <div className="p-2 rounded-full bg-orange-100">
                              <Building className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Company</p>
                              <p className="text-sm text-muted-foreground">{currentProfile.current_company}</p>
                            </div>
                          </div>
                        )}
                        {currentProfile.current_position && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50">
                            <div className="p-2 rounded-full bg-indigo-100">
                              <Briefcase className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Position</p>
                              <p className="text-sm text-muted-foreground">{currentProfile.current_position}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {currentProfile.location && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-pink-50">
                        <div className="p-2 rounded-full bg-pink-100">
                          <MapPin className="h-4 w-4 text-pink-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{currentProfile.location}</p>
                        </div>
                      </div>
                    )}
                    {currentProfile.work_preference && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50">
                        <div className="p-2 rounded-full bg-teal-100">
                          <Globe className="h-4 w-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Work Preference</p>
                          <p className="text-sm text-muted-foreground capitalize">{currentProfile.work_preference}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {/* <Code className="h-5 w-5" /> */}
                  Skills & Expertise
                </CardTitle>
                {editing && (
                  <Button size="sm" onClick={addSkill} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Skill
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    {currentProfile.skills?.map((skill, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 border rounded-lg bg-white/50">
                        <Input
                          value={skill.name}
                          onChange={(e) => {
                            const newSkills = [...(currentProfile.skills || [])]
                            newSkills[index] = { ...skill, name: e.target.value }
                            setEditForm({...currentProfile, skills: newSkills})
                          }}
                          placeholder="Skill name"
                          className="flex-1"
                        />
                        <Select
                          value={skill.type}
                          onValueChange={(value) => {
                            const newSkills = [...(currentProfile.skills || [])]
                            newSkills[index] = { ...skill, type: value as 'technical' | 'soft' | 'language' }
                            setEditForm({...currentProfile, skills: newSkills})
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="soft">Soft</SelectItem>
                            <SelectItem value="language">Language</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={skill.proficiency}
                          onValueChange={(value) => {
                            const newSkills = [...(currentProfile.skills || [])]
                            newSkills[index] = { ...skill, proficiency: value as 'beginner' | 'intermediate' | 'advanced' | 'expert' }
                            setEditForm({...currentProfile, skills: newSkills})
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline" onClick={() => removeSkill(index)} className="text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {currentProfile.skills?.map((skill, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                        <div className={`w-2 h-2 rounded-full ${
                          skill.type === 'technical' ? 'bg-blue-500' : 
                          skill.type === 'soft' ? 'bg-green-500' : 'bg-purple-500'
                        }`}></div>
                        <span className="text-sm font-medium">{skill.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {skill.proficiency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Languages Section */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {/* <Globe className="h-5 w-5" /> */}
                  Languages
                </CardTitle>
                {editing && (
                  <Button size="sm" onClick={addLanguage} className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Language
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    {currentProfile.languages?.map((language, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 border rounded-lg bg-white/50">
                        <Input
                          value={language.name}
                          onChange={(e) => {
                            const newLanguages = [...(currentProfile.languages || [])]
                            newLanguages[index] = { ...language, name: e.target.value }
                            setEditForm({...currentProfile, languages: newLanguages})
                          }}
                          placeholder="Language name"
                          className="flex-1"
                        />
                        <Select
                          value={language.proficiency}
                          onValueChange={(value) => {
                            const newLanguages = [...(currentProfile.languages || [])]
                            newLanguages[index] = { ...language, proficiency: value as 'beginner' | 'intermediate' | 'advanced' | 'native' }
                            setEditForm({...currentProfile, languages: newLanguages})
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="native">Native</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline" onClick={() => removeLanguage(index)} className="text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {currentProfile.languages?.map((language, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-green-50 to-teal-50 border border-green-200">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">{language.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {language.proficiency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievements Section */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {/* <Award className="h-5 w-5" /> */}
                  Achievements
                </CardTitle>
                {editing && (
                  <Button size="sm" onClick={addAchievement} className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Achievement
                  </Button>
                )}
              </CardHeader>
                <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    {currentProfile.achievements?.map((achievement, index) => (
                      <div key={index} className="space-y-2 p-3 border rounded-lg">
                        <div className="flex gap-2 items-center">
                          <Input
                            value={achievement.title}
                            onChange={(e) => {
                              const newAchievements = [...(currentProfile.achievements || [])]
                              newAchievements[index] = { ...achievement, title: e.target.value }
                              setEditForm({...currentProfile, achievements: newAchievements})
                            }}
                            placeholder="Achievement title"
                            className="flex-1"
                          />
                          <Select
                            value={achievement.type}
                            onValueChange={(value) => {
                              const newAchievements = [...(currentProfile.achievements || [])]
                              newAchievements[index] = { ...achievement, type: value as 'award' | 'certification' | 'project' | 'publication' | 'other' }
                              setEditForm({...currentProfile, achievements: newAchievements})
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="award">Award</SelectItem>
                              <SelectItem value="certification">Certification</SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                              <SelectItem value="publication">Publication</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" onClick={() => removeAchievement(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={achievement.description || ''}
                          onChange={(e) => {
                            const newAchievements = [...(currentProfile.achievements || [])]
                            newAchievements[index] = { ...achievement, description: e.target.value }
                            setEditForm({...currentProfile, achievements: newAchievements})
                          }}
                          placeholder="Description"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Input
                            value={achievement.date_earned || ''}
                            onChange={(e) => {
                              const newAchievements = [...(currentProfile.achievements || [])]
                              newAchievements[index] = { ...achievement, date_earned: e.target.value }
                              setEditForm({...currentProfile, achievements: newAchievements})
                            }}
                            placeholder="Date earned (YYYY-MM-DD)"
                            type="date"
                            className="flex-1"
                          />
                          <Input
                            value={achievement.issuer || ''}
                            onChange={(e) => {
                              const newAchievements = [...(currentProfile.achievements || [])]
                              newAchievements[index] = { ...achievement, issuer: e.target.value }
                              setEditForm({...currentProfile, achievements: newAchievements})
                            }}
                            placeholder="Issuer"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentProfile.achievements?.map((achievement, i) => (
                      <div key={i} className="p-4 border rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-yellow-100">
                            <Award className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">{achievement.title}</span>
                              <Badge variant="outline" className="text-xs bg-white/50">
                                {achievement.type}
                              </Badge>
                            </div>
                            {achievement.description && (
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{achievement.description}</p>
                            )}
                            <div className="flex gap-4 text-xs text-gray-500">
                              {achievement.date_earned && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {achievement.date_earned}
                                </span>
                              )}
                              {achievement.issuer && (
                                <span className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {achievement.issuer}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </CardContent>
              </Card>

            {/* Past Projects Section - Only for Students */}
            {currentProfile.role === 'student' && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Past Projects
                  </CardTitle>
                  {editing && (
                    <Button size="sm" onClick={addPastProject} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Project
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="space-y-4">
                      {currentProfile.past_projects?.map((project, index) => (
                        <div key={index} className="space-y-3 p-4 border rounded-lg bg-gray-50">
                          <div className="flex gap-2 items-start">
                            <div className="flex-1 space-y-3">
                              <Input
                                value={project.title}
                                onChange={(e) => updatePastProject(index, 'title', e.target.value)}
                                placeholder="Project title"
                                className="bg-white"
                              />
                              <Textarea
                                value={project.description || ''}
                                onChange={(e) => updatePastProject(index, 'description', e.target.value)}
                                placeholder="Project description"
                                rows={2}
                                className="bg-white"
                              />
                              <div className="flex gap-2">
                                <Input
                                  value={project.year || ''}
                                  onChange={(e) => updatePastProject(index, 'year', e.target.value)}
                                  placeholder="Year (e.g., 2023)"
                                  className="bg-white w-32"
                                />
                                <Input
                                  value={project.technologies?.join(', ') || ''}
                                  onChange={(e) => updatePastProject(index, 'technologies', e.target.value.split(',').map(t => t.trim()))}
                                  placeholder="Technologies (comma-separated)"
                                  className="bg-white flex-1"
                                />
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => removePastProject(index)} className="text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!currentProfile.past_projects || currentProfile.past_projects.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-4">No past projects added yet. Click "Add Project" to get started.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentProfile.past_projects?.map((project, i) => (
                        <div key={i} className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{project.title}</h4>
                            {project.year && (
                              <Badge variant="outline" className="text-xs bg-white/50">
                                {project.year}
                              </Badge>
                            )}
                          </div>
                          {project.description && (
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{project.description}</p>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.map((tech, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {(!currentProfile.past_projects || currentProfile.past_projects.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-4">No past projects to display.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

