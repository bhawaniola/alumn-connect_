import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'

export const CreateProjectPage: React.FC = () => {
  const { token, user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General',
    status: 'active',
    tags: '',
    team: '',
    skills_required: '',
    stipend: '',
    duration: '',
    location: '',
    work_type: 'remote',
    is_recruiting: true,
    images: '',
    project_links: '',
    jd_pdf: ''
  })
  const [positions, setPositions] = useState<Array<{
    title: string
    description: string
    required_skills: string
    count: number
  }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setForm(prev => ({ ...prev, [id]: value }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token) return
    setLoading(true)
    try {
      const requestData = {
        title: form.title,
        description: form.description,
        category: form.category,
        status: form.status,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        team_members: form.team ? form.team.split(',').map(t => t.trim()) : [],
        skills_required: form.skills_required ? form.skills_required.split(',').map(t => t.trim()) : [],
        stipend: form.stipend ? parseInt(form.stipend) : null,
        duration: form.duration || null,
        location: form.location || null,
        work_type: form.work_type,
        is_recruiting: form.is_recruiting,
        images: form.images ? form.images.split(',').map(t => t.trim()) : [],
        project_links: form.project_links ? form.project_links.split(',').map(t => t.trim()) : [],
        jd_pdf: form.jd_pdf || null,
        positions: positions.map(p => ({
          title: p.title,
          description: p.description,
          required_skills: p.required_skills ? p.required_skills.split(',').map(s => s.trim()) : [],
          count: p.count
        }))
      }
      console.log('Sending project data:', requestData)
      const res = await fetch('https://alumconnect-s4c7.onrender.com/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })
      if (res.ok) {
        navigate('/founders-dashboard')
      } else {
        const data = await res.json()
        console.error('Project creation failed:', data)
        setError(data.error || data.msg || 'Failed to create project')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access this page.</p>
      </div>
    )
  }

  if (user.role !== 'alumni') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Only alumni can create projects.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Create Project
          </h1>
          <p className="text-gray-600">Share an exciting project opportunity with students</p>
        </div>
        
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Project Details</CardTitle>
            <CardDescription className="text-gray-600">Provide comprehensive information about your project to attract the right candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">Project Title</Label>
                <Input 
                  id="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter a compelling project title"
                  className="h-12 text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">Project Description</Label>
                <Textarea 
                  id="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  rows={6} 
                  required 
                  placeholder="Describe your project in detail. What will students work on? What are the goals and outcomes?"
                  className="text-base leading-relaxed"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['General','Healthcare AI','Clean Tech','Education','FinTech','AgriTech'].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['active','completed','paused'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" value={form.tags} onChange={handleChange} placeholder="AI, React, Flask" />
              </div>
              <div>
                <Label htmlFor="team">Team Members (comma separated)</Label>
                <Input id="team" value={form.team} onChange={handleChange} placeholder="Name1, Name2" />
              </div>
              <div>
                <Label htmlFor="skills_required">Skills Required (comma separated)</Label>
                <Input id="skills_required" value={form.skills_required} onChange={handleChange} placeholder="React, Python, Machine Learning" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stipend">Stipend (₹)</Label>
                  <Input 
                    id="stipend" 
                    type="number" 
                    value={form.stipend} 
                    onChange={handleChange} 
                    placeholder="50000" 
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" value={form.duration} onChange={handleChange} placeholder="3 months" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location} onChange={handleChange} placeholder="Bangalore, India" />
                </div>
                <div>
                  <Label>Work Type</Label>
                  <Select value={form.work_type} onValueChange={(v) => setForm(p => ({ ...p, work_type: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Recruitment Status</Label>
                <Select 
                  value={form.is_recruiting ? 'recruiting' : 'not_recruiting'} 
                  onValueChange={(v) => setForm(p => ({ ...p, is_recruiting: v === 'recruiting' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recruiting">Currently Recruiting</SelectItem>
                    <SelectItem value="not_recruiting">Not Recruiting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="images">Project Images (comma-separated URLs)</Label>
                <Input 
                  id="images" 
                  value={form.images} 
                  onChange={handleChange} 
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" 
                />
              </div>
              <div>
                <Label htmlFor="project_links">Project Links (comma-separated URLs)</Label>
                <Input 
                  id="project_links" 
                  value={form.project_links} 
                  onChange={handleChange} 
                  placeholder="https://github.com/project, https://demo.example.com" 
                />
              </div>
              <div>
                <Label htmlFor="jd_pdf">Job Description PDF URL</Label>
                <Input 
                  id="jd_pdf" 
                  value={form.jd_pdf} 
                  onChange={handleChange} 
                  placeholder="https://example.com/jd.pdf" 
                />
              </div>
              
              {/* Positions Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Project Positions</h3>
                    <p className="text-sm text-gray-600">Add multiple positions like Developer, Designer, etc.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPositions([...positions, { title: '', description: '', required_skills: '', count: 1 }])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Position
                  </Button>
                </div>
                
                {positions.length > 0 && (
                  <div className="space-y-4">
                    {positions.map((position, index) => (
                      <Card key={index} className="p-4 bg-gray-50">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">Position {index + 1}</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setPositions(positions.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-sm">Role Type</Label>
                                <Select
                                  value={position.title}
                                  onValueChange={(value) => {
                                    const newPositions = [...positions]
                                    newPositions[index].title = value
                                    setPositions(newPositions)
                                  }}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Software Developer">Software Developer</SelectItem>
                                    <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                                    <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                                    <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                                    <SelectItem value="Mobile App Developer">Mobile App Developer</SelectItem>
                                    <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                                    <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                                    <SelectItem value="Machine Learning Engineer">Machine Learning Engineer</SelectItem>
                                    <SelectItem value="AI Engineer">AI Engineer</SelectItem>
                                    <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                                    <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                                    <SelectItem value="Product Designer">Product Designer</SelectItem>
                                    <SelectItem value="Graphic Designer">Graphic Designer</SelectItem>
                                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                                    <SelectItem value="Project Manager">Project Manager</SelectItem>
                                    <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                                    <SelectItem value="Consultant">Consultant</SelectItem>
                                    <SelectItem value="Marketing Specialist">Marketing Specialist</SelectItem>
                                    <SelectItem value="Content Writer">Content Writer</SelectItem>
                                    <SelectItem value="Research Analyst">Research Analyst</SelectItem>
                                    <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                                    <SelectItem value="Cybersecurity Analyst">Cybersecurity Analyst</SelectItem>
                                    <SelectItem value="Blockchain Developer">Blockchain Developer</SelectItem>
                                    <SelectItem value="Cloud Architect">Cloud Architect</SelectItem>
                                    <SelectItem value="Mentor">Mentor</SelectItem>
                                    <SelectItem value="Advisor">Advisor</SelectItem>
                                    <SelectItem value="Intern">Intern</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-sm">Number of Openings</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={position.count}
                                  onChange={(e) => {
                                    const newPositions = [...positions]
                                    newPositions[index].count = parseInt(e.target.value) || 1
                                    setPositions(newPositions)
                                  }}
                                  className="h-10"
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm">Description</Label>
                            <Textarea
                              value={position.description}
                              onChange={(e) => {
                                const newPositions = [...positions]
                                newPositions[index].description = e.target.value
                                setPositions(newPositions)
                              }}
                              placeholder="Describe the role and responsibilities"
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Required Skills (comma separated)</Label>
                            <Input
                              value={position.required_skills}
                              onChange={(e) => {
                                const newPositions = [...positions]
                                newPositions[index].required_skills = e.target.value
                                setPositions(newPositions)
                              }}
                              placeholder="React, TypeScript, CSS"
                              className="h-10"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                    Creating Project...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


