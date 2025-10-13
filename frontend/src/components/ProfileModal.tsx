import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { GraduationCap, Building, MapPin, Briefcase, Globe, Code, X, Phone, Home, Loader2, FileText, Download } from 'lucide-react'

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
}

interface ProfileModalProps {
  userId: number
  isOpen: boolean
  onClose: () => void
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ userId, isOpen, onClose }) => {
  const { token } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/users/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
      else {
        // THIS IS THE MISSING FIX: Handle HTTP errors (like 401, 404, 500)
        alert(`Error: The server responded with status ${res.status}. Please try again.`);
        onClose();
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Show an alert for network errors (backend down)
      alert('Error: Could not connect to the server. Please try again later.');
      // Close the modal since it can't load anything
      onClose();
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && userId) {

      fetchProfile()
    }
  }, [userId, isOpen, token])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : profile ? (
          <>
            {/* Header Section */}
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-8 text-white">
                <Button
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-0"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={profile.avatar ? `https://alumconnect-s4c7.onrender.com/api/profile/picture/${profile.avatar}` : undefined}
                      alt={profile.name}
                    />
                    <AvatarFallback className="text-2xl bg-white text-blue-600">
                      {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                    <p className="text-blue-100 mb-4">{profile.email}</p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {profile.role === 'alumni' ? 'Alumni' : 'Student'}
                      </Badge>
                      {profile.graduation_year && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          Class of {profile.graduation_year}
                        </Badge>
                      )}
                      {profile.department && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {profile.department}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Bio & Contact Card */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
                      )}
                      <div className="space-y-3">
                        {profile.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-blue-600" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                        {profile.website && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4 text-blue-600" />
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {profile.website}
                            </a>
                          </div>
                        )}
                        {profile.linkedin && (
                          <div className="flex items-center gap-2 text-sm">
                            <Code className="h-4 w-4 text-blue-600" />
                            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                        {profile.github && (
                          <div className="flex items-center gap-2 text-sm">
                            <Code className="h-4 w-4 text-blue-600" />
                            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              GitHub Profile
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* CV/Resume Card */}
                  {profile.cv_pdf && (
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Resume / CV
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
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
                              onClick={() => window.open(`https://alumconnect-s4c7.onrender.com/api/profile/cv/${profile.cv_pdf}`, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Professional Information */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Professional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      {profile.department && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                          <div className="p-2 rounded-full bg-blue-100">
                            <GraduationCap className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Department</p>
                            <p className="text-sm text-muted-foreground">{profile.department}</p>
                          </div>
                        </div>
                      )}
                      {profile.hall && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                          <div className="p-2 rounded-full bg-purple-100">
                            <Home className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Hall</p>
                            <p className="text-sm text-muted-foreground">{profile.hall}</p>
                          </div>
                        </div>
                      )}
                      {profile.branch && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                          <div className="p-2 rounded-full bg-green-100">
                            <Code className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Branch</p>
                            <p className="text-sm text-muted-foreground">{profile.branch}</p>
                          </div>
                        </div>
                      )}
                      {profile.current_company && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                          <div className="p-2 rounded-full bg-orange-100">
                            <Building className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Company</p>
                            <p className="text-sm text-muted-foreground">{profile.current_company}</p>
                          </div>
                        </div>
                      )}
                      {profile.current_position && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50">
                          <div className="p-2 rounded-full bg-indigo-100">
                            <Briefcase className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Position</p>
                            <p className="text-sm text-muted-foreground">{profile.current_position}</p>
                          </div>
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-pink-50">
                          <div className="p-2 rounded-full bg-pink-100">
                            <MapPin className="h-4 w-4 text-pink-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Location</p>
                            <p className="text-sm text-muted-foreground">{profile.location}</p>
                          </div>
                        </div>
                      )}
                      {profile.work_preference && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50">
                          <div className="p-2 rounded-full bg-teal-100">
                            <Globe className="h-4 w-4 text-teal-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Work Preference</p>
                            <p className="text-sm text-muted-foreground capitalize">{profile.work_preference}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Skills Section */}
                  {profile.skills && profile.skills.length > 0 && (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Skills & Expertise</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3">
                          {profile.skills.map((skill, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                              <div className={`w-2 h-2 rounded-full ${skill.type === 'technical' ? 'bg-blue-500' :
                                  skill.type === 'soft' ? 'bg-green-500' : 'bg-purple-500'
                                }`}></div>
                              <span className="text-sm font-medium">{skill.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {skill.proficiency}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Languages Section */}
                  {profile.languages && profile.languages.length > 0 && (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Languages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3">
                          {profile.languages.map((language, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-green-50 to-teal-50 border border-green-200">
                              <span className="text-sm font-medium">{language.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {language.proficiency}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Achievements Section */}
                  {profile.achievements && profile.achievements.length > 0 && (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Achievements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {profile.achievements.map((achievement, i) => (
                            <div key={i} className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                              <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                              {achievement.description && (
                                <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {achievement.type}
                                </Badge>
                                {achievement.issuer && (
                                  <Badge variant="outline" className="text-xs">
                                    {achievement.issuer}
                                  </Badge>
                                )}
                                {achievement.date_earned && (
                                  <Badge variant="outline" className="text-xs">
                                    {new Date(achievement.date_earned).toLocaleDateString()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Unable to load profile.</p>
          </div>
        )}
      </div>
    </div>
  )
}
