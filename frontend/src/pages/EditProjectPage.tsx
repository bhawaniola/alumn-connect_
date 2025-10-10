import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface PositionForm {
  id?: number
  title: string
  description: string
  count: number
  is_active: boolean
  stipend?: number
  duration?: string
  location?: string
  required_skills?: string[]
}

interface ProjectForm {
  title: string
  description: string
  category: string
  status: string
  images?: string[]
  links?: { label: string, url: string }[]
  jd_url?: string
  positions: PositionForm[]
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

export const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token, user, isLoading } = useAuth()
  const [form, setForm] = useState<ProjectForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagesText, setImagesText] = useState('')
  const [linksText, setLinksText] = useState('')
  const [partnersText, setPartnersText] = useState('')
  const [highlightsText, setHighlightsText] = useState('')
  const [teamRolesText, setTeamRolesText] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects/${id}`)
        if (res.ok) {
          const p = await res.json()
          const loadedForm: ProjectForm = {
            title: p.title,
            description: p.description,
            category: p.category,
            status: p.status,
            images: p.images || [],
            links: p.project_links || [],
            jd_url: p.jd_pdf || '',
            positions: (p.positions || []).map((pos: any) => ({ 
              id: pos.id, 
              title: pos.title, 
              description: pos.description, 
              count: pos.count, 
              is_active: pos.is_active,
              stipend: pos.stipend,
              duration: pos.duration,
              location: pos.location,
              required_skills: pos.required_skills || []
            })),
            contact_details: p.contact_details || {},
            team_roles: p.team_roles || [],
            partners: p.partners || [],
            funding: p.funding || '',
            highlights: p.highlights || []
          }
          setForm(loadedForm)
          setImagesText((loadedForm.images || []).join('\n'))
          setLinksText((loadedForm.links || []).map(l => `${l.label}|${l.url}`).join('\n'))
          setPartnersText((loadedForm.partners || []).join('\n'))
          setHighlightsText((loadedForm.highlights || []).join('\n'))
          setTeamRolesText((loadedForm.team_roles || []).map(tr => `${tr.name}|${tr.role}|${(tr.skills || []).join(',')}`).join('\n'))
        }
      } catch (e) {
        console.error('Failed to load project', e)
      }
    }
    load()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to edit this project.</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const updatePosition = (idx: number, patch: Partial<PositionForm>) => {
    setForm({ ...form, positions: form.positions.map((p, i) => i === idx ? { ...p, ...patch } : p) })
  }

  const addPosition = () => {
    setForm({ ...form, positions: [...form.positions, { title: '', description: '', count: 1, is_active: true, required_skills: [] }] })
  }

  const removePosition = (idx: number) => {
    setForm({ ...form, positions: form.positions.filter((_, i) => i !== idx) })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          project_links: form.links,
          jd_pdf: form.jd_url
        })
      })
      if (res.ok) {
        navigate(`/projects/${id}`)
      } else {
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const data = await res.json()
          setError(data.error || data.msg || 'Failed to update project')
        } else {
          setError(await res.text())
        }
      }
    } catch (e) {
      console.error('Failed to save project', e)
      setError('Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Edit Project</h1>
          <p className="text-gray-600">Update project details and openings</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Project</CardTitle>
            <CardDescription className="text-gray-600">Keep information current to attract the right candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={6} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Job Description URL (PDF)</Label>
                <Input value={form.jd_url || ''} onChange={(e) => setForm({ ...form, jd_url: e.target.value })} placeholder="https://...pdf" />
              </div>

              <div className="space-y-2">
                <Label>Images (one per line or comma-separated)</Label>
                <Textarea
                  rows={3}
                  value={imagesText}
                  onChange={(e) => {
                    const text = e.target.value
                    setImagesText(text)
                    const tokens = text
                      .split(/[\n,]+/)
                      .flatMap(part => part.split(/\s+/))
                      .map(s => s.trim())
                      .filter(Boolean)
                    setForm({ ...form, images: tokens })
                  }}
                  placeholder={"https://img1.jpg\nhttps://img2.png"}
                />
              </div>

              <div className="space-y-2">
                <Label>Links (one per line: label|url, label,url, or url)</Label>
                <Textarea
                  rows={4}
                  value={linksText}
                  onChange={(e) => {
                    const text = e.target.value
                    setLinksText(text)
                    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
                    const parsed: { label: string, url: string }[] = []
                    for (const line of lines) {
                      let label: string | undefined
                      let url: string | undefined
                      if (line.includes('|')) {
                        const parts = line.split('|')
                        label = parts[0]
                        url = parts.slice(1).join('|')
                      } else if (line.includes(',')) {
                        const parts = line.split(',')
                        label = parts[0]
                        url = parts.slice(1).join(',')
                      } else {
                        url = line
                        label = 'Link'
                      }
                      if (url) parsed.push({ label: (label || 'Link').trim(), url: url.trim() })
                    }
                    setForm({ ...form, links: parsed })
                  }}
                  placeholder={"Website|https://example.com\nGitHub,https://github.com/org/repo\nhttps://docs.example.com"}
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Details</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Input 
                      placeholder="Email" 
                      value={form.contact_details?.email || ''} 
                      onChange={(e) => setForm({ ...form, contact_details: { ...form.contact_details, email: e.target.value } })} 
                    />
                  </div>
                  <div>
                    <Input 
                      placeholder="Phone" 
                      value={form.contact_details?.phone || ''} 
                      onChange={(e) => setForm({ ...form, contact_details: { ...form.contact_details, phone: e.target.value } })} 
                    />
                  </div>
                  <div>
                    <Input 
                      placeholder="Website" 
                      value={form.contact_details?.website || ''} 
                      onChange={(e) => setForm({ ...form, contact_details: { ...form.contact_details, website: e.target.value } })} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Team Roles (one per line: name|role|skills)</Label>
                <Textarea
                  rows={4}
                  value={teamRolesText}
                  onChange={(e) => {
                    const text = e.target.value
                    setTeamRolesText(text)
                    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
                    const parsed = lines.map(line => {
                      const parts = line.split('|')
                      return {
                        name: parts[0]?.trim() || '',
                        role: parts[1]?.trim() || '',
                        skills: parts[2] ? parts[2].split(',').map(s => s.trim()).filter(Boolean) : []
                      }
                    }).filter(tr => tr.name && tr.role)
                    setForm({ ...form, team_roles: parsed })
                  }}
                  placeholder={"John Doe|Advisor|AI,ML\nJane Smith|Design Lead|UI/UX,Figma"}
                />
              </div>

              <div className="space-y-2">
                <Label>Partners (one per line)</Label>
                <Textarea
                  rows={3}
                  value={partnersText}
                  onChange={(e) => {
                    const text = e.target.value
                    setPartnersText(text)
                    const partners = text.split('\n').map(p => p.trim()).filter(Boolean)
                    setForm({ ...form, partners })
                  }}
                  placeholder={"Google\nMicrosoft\nAWS"}
                />
              </div>

              <div className="space-y-2">
                <Label>Funding</Label>
                <Input 
                  value={form.funding || ''} 
                  onChange={(e) => setForm({ ...form, funding: e.target.value })} 
                  placeholder="e.g., Seed Round - $500K"
                />
              </div>

              <div className="space-y-2">
                <Label>Highlights (one per line)</Label>
                <Textarea
                  rows={4}
                  value={highlightsText}
                  onChange={(e) => {
                    const text = e.target.value
                    setHighlightsText(text)
                    const highlights = text.split('\n').map(h => h.trim()).filter(Boolean)
                    setForm({ ...form, highlights })
                  }}
                  placeholder={"Featured in TechCrunch\n10,000+ users\nAward-winning design"}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Open Positions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addPosition}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </div>
                {form.positions.map((pos, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-gray-200 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Title</Label>
                        <Input value={pos.title} onChange={(e) => updatePosition(idx, { title: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Count</Label>
                        <Input type="number" value={pos.count} onChange={(e) => updatePosition(idx, { count: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Description</Label>
                      <Textarea value={pos.description} onChange={(e) => updatePosition(idx, { description: e.target.value })} rows={3} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label>Stipend (₹)</Label>
                        <Input type="number" value={pos.stipend || ''} onChange={(e) => updatePosition(idx, { stipend: Number(e.target.value) || undefined })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Duration</Label>
                        <Input value={pos.duration || ''} onChange={(e) => updatePosition(idx, { duration: e.target.value })} placeholder="e.g., 3 months" />
                      </div>
                      <div className="space-y-1">
                        <Label>Location</Label>
                        <Input value={pos.location || ''} onChange={(e) => updatePosition(idx, { location: e.target.value })} placeholder="e.g., Remote" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Required Skills (comma-separated)</Label>
                      <Input 
                        value={(pos.required_skills || []).join(', ')} 
                        onChange={(e) => updatePosition(idx, { required_skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={pos.is_active} onChange={(e) => updatePosition(idx, { is_active: e.target.checked })} />
                        Active
                      </label>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removePosition(idx)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  {!pos.is_active && (
                    <p className="text-sm text-red-600">This position is no more active.</p>
                  )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EditProjectPage


