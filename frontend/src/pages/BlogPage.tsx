import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { formatDate, truncateText } from '../lib/dataUtils'
import { BookOpen, ArrowRight, Loader2, Heart, Share2, Clock, Check } from 'lucide-react'
import { ProfileModal } from '../components/ProfileModal'

interface BlogPost {
  id: number
  title: string
  content: string
  category: string
  created_at: string
  updated_at: string
  author_name: string
  author_avatar?: string
  author_id: number
  likes_count?: number
  is_liked?: boolean
}

export const BlogPage: React.FC = () => {
  const { token } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>([])
  const [visibleCount, setVisibleCount] = useState(6)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [profileModalUserId, setProfileModalUserId] = useState<number | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  useEffect(() => {
    setDisplayedPosts(posts.slice(0, visibleCount))
  }, [posts, visibleCount])

  const fetchBlogPosts = async () => {
    try {
      // console.log('Fetching blog posts...')
      const response = await fetch('https://alumconnect-s4c7.onrender.com/api/blog')
      // console.log('Blog posts response:', response.status)
      if (response.ok) {
        const data = await response.json()
        // console.log('Blog posts data:', data)
        setPosts(data)
      } else {
        console.error('Failed to fetch blog posts:', response.status)
        setPosts([])
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }


  const loadMore = () => {
    setVisibleCount(prev => prev + 6)
  }

  const handleShare = async (postId: number) => {
    const url = `${window.location.origin}/blog/${postId}`
    
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(postId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedId(postId)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handleLike = async (postId: number) => {
    if (!token) {
      // console.log('No token available for liking')
      return
    }
    
    try {
      // console.log('Liking post:', postId)
      const response = await fetch(`https://alumconnect-s4c7.onrender.com/api/blog/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      
      // console.log('Like response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        // console.log('Like response data:', data)
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? {
                ...post,
                is_liked: data.is_liked,
                likes_count: data.likes_count
              }
            : post
        ))
      } else {
        console.error('Like request failed:', response.status)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <span className="text-lg text-gray-600">Loading articles...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
            Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover thought-provoking articles and insights from our alumni community
          </p>
        </div>

        {/* Blog Posts Grid */}
        {displayedPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {displayedPosts.map((post) => (
                <article key={post.id} className="group">
                  <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                    {/* Category Badge */}
                    <div className="p-6 pb-4">
                      <Badge 
                        variant="secondary" 
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 text-sm font-medium"
                      >
                        {post.category}
                      </Badge>
                </div>

                    {/* Content */}
                    <div className="px-6 pb-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {truncateText(post.content, 120)}
                      </p>

                      {/* Author Info */}
                <div 
                  className="flex items-center space-x-3 mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setProfileModalUserId(post.author_id)
                    setIsProfileModalOpen(true)
                  }}
                >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-semibold">
                            {post.author_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                       </AvatarFallback>
                     </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {post.author_name}
                          </p>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleLike(post.id)
                            }}
                            disabled={!token}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                              post.is_liked 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                            <span className="text-sm font-medium">{post.likes_count || 0}</span>
                          </button>
                          <button 
                            onClick={() => handleShare(post.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                              copiedId === post.id
                                ? 'bg-green-50 text-green-600'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {copiedId === post.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Share2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold" 
                          asChild
                        >
                  <Link to={`/blog/${post.id}`}>
                            Read
                            <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                      </div>
                    </div>
                  </div>
                </article>
          ))}
        </div>

            {/* Load More Button */}
            {visibleCount < posts.length && (
              <div className="text-center">
                <Button 
                  onClick={loadMore}
                  variant="outline"
                  className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-8 py-3 rounded-full font-semibold text-lg"
                >
                  Load More Articles
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No articles yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Be the first to share your insights and experiences with the community.
            </p>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold text-lg"
              asChild
            >
              <Link to="/create-blog">
                Write Your First Article
              </Link>
            </Button>
          </div>
        )}
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