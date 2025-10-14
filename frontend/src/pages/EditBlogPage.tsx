import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Loader2 } from 'lucide-react'
import { RichTextEditor } from '../components/ui/rich-text-editor'

interface BlogPost {
  id: number
  title: string
  content: string
  category: string
  author_id: number
  images?: string[]
  pdfs?: string[]
}

export const EditBlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token, user, isLoading } = useAuth()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/blog/${id}`)
        if (res.ok) {
          const data = await res.json()
          setPost({ id: data.id, title: data.title, content: data.content, category: data.category, author_id: data.author_id, images: data.images || [], pdfs: data.pdfs || [] })
        }
      } catch (e) {
        console.error('Failed to load blog', e)
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
        <p className="text-muted-foreground">Please log in to edit this blog.</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (user.id !== post.author_id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">You are not authorized to edit this blog.</p>
      </div>
    )
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/blog/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: post.title, 
          category: post.category, 
          content: post.content
        })
      })
      if (res.ok) {
        navigate(`/blog/${post.id}`)
        return
      }
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        setError(data.error || data.msg || `${res.status} ${res.statusText}`)
      } else {
        setError(await res.text())
      }
    } catch (e) {
      console.error('Failed to save blog', e)
      setError('Failed to update blog post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Edit Blog Post
          </h1>
          <p className="text-gray-600">Update your article</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Make Changes</CardTitle>
            <CardDescription className="text-gray-600">Use the toolbar to format content and insert images</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">Blog Title</Label>
                <Input 
                  id="title" 
                  value={post.title} 
                  onChange={(e) => setPost({ ...post, title: e.target.value })} 
                  required 
                  placeholder="Enter title"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Category</Label>
                <Select value={post.category} onValueChange={(v) => setPost({ ...post, category: v })}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['General', 'Technology', 'Career', 'Startup', 'Research', 'Personal', 'Industry Insights'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Content</Label>
                <RichTextEditor
                  value={post.content}
                  onChange={(html) => setPost({ ...post, content: html })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Images</Label>
                {(post.images || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No images yet</p>
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {(post.images || []).map((url, i) => (
                      <li key={i} className="truncate"><a className="text-blue-600 hover:underline" href={url} target="_blank" rel="noreferrer">{url}</a></li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center gap-2">
                  <Input type="file" accept="image/png,image/jpeg,image/jpg,image/gif" onChange={async (e) => {
                    if (!e.target.files || !e.target.files[0] || !id || !token) return
                    setUploadingImage(true)
                    try {
                      const fd = new FormData()
                      fd.append('image', e.target.files[0])
                      const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/blog/${id}/images`, {
                        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd
                      })
                      if (res.ok) {
                        const data = await res.json()
                        setPost(prev => prev ? { ...prev, images: data.images } : prev)
                      }
                    } finally {
                      setUploadingImage(false)
                    }
                  }} />
                  {uploadingImage && <span className="text-sm text-muted-foreground">Uploading image...</span>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">PDFs</Label>
                {(post.pdfs || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No PDFs yet</p>
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {(post.pdfs || []).map((url, i) => (
                      <li key={i} className="truncate"><a className="text-blue-600 hover:underline" href={url} target="_blank" rel="noreferrer">{url}</a></li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center gap-2">
                  <Input type="file" accept="application/pdf" onChange={async (e) => {
                    if (!e.target.files || !e.target.files[0] || !id || !token) return
                    setUploadingPdf(true)
                    try {
                      const fd = new FormData()
                      fd.append('pdf', e.target.files[0])
                      const res = await fetch(`https://alumconnect-s4c7.onrender.com/api/blog/${id}/pdfs`, {
                        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd
                      })
                      if (res.ok) {
                        const data = await res.json()
                        setPost(prev => prev ? { ...prev, pdfs: data.pdfs } : prev)
                      }
                    } finally {
                      setUploadingPdf(false)
                    }
                  }} />
                  {uploadingPdf && <span className="text-sm text-muted-foreground">Uploading PDF...</span>}
                </div>
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

export default EditBlogPage


