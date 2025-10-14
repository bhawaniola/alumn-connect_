import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { RichTextEditor } from '../components/ui/rich-text-editor'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const CreateBlogPage: React.FC = () => {
  const { token, user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    category: 'General',
    content: ''
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
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
        category: form.category,
        content: form.content
      }
      console.log('Sending blog data:', requestData)
      const res = await fetch('https://alumconnect-s4c7.onrender.com/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })
      if (res.ok) {
        const created = await res.json()
        const postId = created.id
        // Upload images
        for (const f of imageFiles) {
          const fd = new FormData()
          fd.append('image', f)
          await fetch(`https://alumconnect-s4c7.onrender.com/api/blog/${postId}/images`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd
          })
        }
        // Upload PDFs
        for (const f of pdfFiles) {
          const fd = new FormData()
          fd.append('pdf', f)
          await fetch(`https://alumconnect-s4c7.onrender.com/api/blog/${postId}/pdfs`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd
          })
        }
        navigate('/founders-dashboard')
      } else {
        const data = await res.json()
        console.error('Blog creation failed:', data)
        setError(data.error || data.msg || 'Failed to create blog post')
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
        <p className="text-muted-foreground">Only alumni can write blog posts.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create Blog Post
          </h1>
          <p className="text-gray-600">Share your insights and experiences with the community</p>
        </div>
        
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Write Your Story</CardTitle>
            <CardDescription className="text-gray-600">Craft a compelling blog post that resonates with your audience</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">Blog Title</Label>
                <Input 
                  id="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter an engaging title for your blog post"
                  className="h-12 text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm(p => ({ ...p, category: v }))}>
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
                <Label htmlFor="content" className="text-base font-semibold">Content</Label>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => setForm(prev => ({ ...prev, content: html }))}
                />
                <p className="text-sm text-gray-500">Tip: Use the toolbar to format text and insert images/links</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Images (upload one or more)</Label>
                <Input type="file" accept="image/png,image/jpeg,image/jpg,image/gif" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">PDFs (upload one or more)</Label>
                <Input type="file" accept="application/pdf" multiple onChange={(e) => setPdfFiles(Array.from(e.target.files || []))} />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                    Publishing...
                  </>
                ) : (
                  'Publish Blog Post'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


