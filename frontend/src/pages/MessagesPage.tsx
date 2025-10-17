import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Input } from '../components/ui/input'
import { formatDate } from '../lib/dataUtils'
import { MessageCircle, Search, Plus, Loader2, Send, ArrowLeft } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { ProfileModal } from '../components/ProfileModal'

interface Conversation {
  id: number
  other_user_id: number
  other_user_name: string
  other_user_email: string
  other_user_role: string
  other_user_avatar?: string
  last_message?: string
  last_message_time?: string
  unread_count: number
  is_online?: boolean
}

interface User {
  id: number
  name: string
  email: string
  role: string
  avatar?: string
  department?: string
  graduation_year?: number
  current_company?: string
  current_position?: string
  location?: string
  bio?: string
  linkedin?: string
  github?: string
  website?: string
  hall?: string
  branch?: string
}

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  created_at: string
  is_read: boolean
}

export const MessagesPage: React.FC = () => {
  const { token, user, isLoading } = useAuth()
  const { id } = useParams<{ id: string }>()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewChat, setShowNewChat] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedGraduationYear, setSelectedGraduationYear] = useState<string>('all')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const conversationsPollingRef = React.useRef<NodeJS.Timeout | null>(null)
  const [profileModalUserId, setProfileModalUserId] = useState<number | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  useEffect(() => {
    if (token) {
      fetchData()
      
      // Poll conversations list every 2 seconds
      conversationsPollingRef.current = setInterval(() => {
        fetchConversations()
      }, 2000)
    }

    return () => {
      if (conversationsPollingRef.current) {
        clearInterval(conversationsPollingRef.current)
      }
    }
  }, [token])

  const fetchConversations = async () => {
    try {
      const response = await fetch('https://alumconnect-s4c7.onrender.com/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const conversationsData = await response.json()
        setConversations(conversationsData)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  // Handle URL parameter for conversation ID (but keep it inline)
  useEffect(() => {
    if (id && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === parseInt(id))
      if (conversation) {
        selectConversation(conversation)
      }
    }
  }, [id, conversations])

  // Poll for new messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`https://alumconnect-s4c7.onrender.com/api/messages/conversations/${selectedConversation.id}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (response.ok) {
            const messagesData = await response.json()
            setMessages(messagesData)
          }
        } catch (error) {
          console.error('Error polling messages:', error)
        }
      }, 2000)
    }

    // Cleanup on unmount or when conversation changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [selectedConversation, token])

  const fetchData = async () => {
    try {
      // console.log('Fetching messages data...')
      // Fetch conversations and available users in parallel
      const [conversationsRes, usersRes] = await Promise.all([
        fetch('https://alumconnect-s4c7.onrender.com/api/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('https://alumconnect-s4c7.onrender.com/api/messages/available-users', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ])

      // console.log('Conversations response:', conversationsRes.status)
      // console.log('Users response:', usersRes.status)

      if (conversationsRes.ok) {
        const conversationsData = await conversationsRes.json()
        // console.log('Conversations data:', conversationsData)
        setConversations(conversationsData)
      } else {
        console.error('Failed to fetch conversations:', conversationsRes.status)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        // console.log('Available users data:', usersData)
        setAvailableUsers(usersData)
      } else {
        console.error('Failed to fetch available users:', usersRes.status)
      }
    } catch (error) {
      console.error('Error fetching messages data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startNewConversation = async (otherUserId: number) => {
    try {
      console.log('Starting conversation with user:', otherUserId)
      const response = await fetch('https://alumconnect-s4c7.onrender.com/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ other_user_id: otherUserId })
      })

      // console.log('Start conversation response:', response.status)
      if (response.ok) {
        const newConversation = await response.json()
        // console.log('New conversation created:', newConversation)
        // Find the conversation in our list or create a new one
        const otherUser = availableUsers.find(u => u.id === otherUserId)
        const conversation = conversations.find(c => c.other_user_id === otherUserId) || {
          id: newConversation.id,
          other_user_id: otherUserId,
          other_user_name: otherUser?.name || 'Unknown',
          other_user_email: otherUser?.email || '',
          other_user_role: otherUser?.role || 'alumni',
          last_message: '',
          last_message_time: '',
          unread_count: 0,
          is_online: false
        }
        setSelectedConversation(conversation)
        setShowNewChat(false)
        // Update URL without navigation
        window.history.pushState({}, '', `/messages/${newConversation.id}`)
        // Refresh conversations list
        fetchConversations()
      } else {
        console.error('Failed to start conversation:', response.status)
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
    }
  }

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setMessagesLoading(true)
    try {
      const response = await fetch(`https://alumconnect-s4c7.onrender.com/api/messages/conversations/${conversation.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const messagesData = await response.json()
        setMessages(messagesData)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setMessagesLoading(false)
    }
    // Update URL without navigation
    window.history.pushState({}, '', `/messages/${conversation.id}`)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const response = await fetch(`https://alumconnect-s4c7.onrender.com/api/messages/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage.trim() })
      })

      if (response.ok) {
        const newMsg = await response.json()
        setMessages(prev => [...prev, newMsg])
        setNewMessage('')
        // Immediately update conversations list
        fetchConversations()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // removed getUserDisplayInfo (inlined rendering below)

  const getRoleBadge = (role: string) => {
    if (role === 'alumni') {
      return <Badge variant="default" className="text-xs bg-blue-600">Founder</Badge>
    } else {
      return <Badge variant="secondary" className="text-xs bg-green-600 text-white">Student</Badge>
    }
  }

  const openProfileModal = (userId: number) => {
    setProfileModalUserId(userId)
    setIsProfileModalOpen(true)
  }

  const closeProfileModal = () => {
    setIsProfileModalOpen(false)
    setProfileModalUserId(null)
  }

  const filteredUsers = availableUsers.filter(u => {
    if (u.id === user?.id) return false
    
    // Search term filter
    const searchMatch = !searchTerm || 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.current_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.current_position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.hall?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Department filter
    const departmentMatch = selectedDepartment === 'all' || 
      u.department === selectedDepartment
    
    // Graduation year filter
    const yearMatch = selectedGraduationYear === 'all' || 
      (u.graduation_year && u.graduation_year.toString() === selectedGraduationYear)
    
    return searchMatch && departmentMatch && yearMatch
  })

  // Get unique departments and graduation years for filter options
  const departments = Array.from(new Set(
    availableUsers
      .map(u => u.department)
      .filter(Boolean)
  )).sort()

  const graduationYears = Array.from(new Set(
    availableUsers
      .map(u => u.graduation_year)
      .filter(Boolean)
  )).sort((a, b) => b! - a!) // Sort descending

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <span className="text-lg text-gray-600">Loading messages...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access messages.</p>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] bg-gray-100">
      <div className="flex flex-col md:flex-row h-[80vh]">
        {/* Left Sidebar - Conversations List */}
        <div className={`${
          selectedConversation ? 'hidden md:flex' : 'flex'
        } w-full md:w-1/3 bg-white border-r border-gray-200 flex-col`}>
          {/* Header */}
          <div className="p-3 md:p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Messages</h1>
              <Button 
                onClick={() => setShowNewChat(!showNewChat)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {showNewChat && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Department</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Graduation Year</label>
                    <select
                      value={selectedGraduationYear}
                      onChange={(e) => setSelectedGraduationYear(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Passout Years</option>
                      {graduationYears.map(year => (
                        <option key={year} value={year?.toString()}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : showNewChat ? (
              <div className="p-2">
                {filteredUsers.map((userObj) => (
                  <div
                    key={userObj.id}
                    className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100 mb-2"
                    onClick={() => startNewConversation(userObj.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div onClick={(e) => { e.stopPropagation(); openProfileModal(userObj.id); }}>
                        <Avatar className="h-10 w-10 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
                          <AvatarImage 
                            src={userObj.avatar ? `https://alumconnect-s4c7.onrender.com/api/profile/picture/${userObj.avatar}` : undefined}
                            alt={userObj.name}
                          />
                          <AvatarFallback className={`${
                            userObj.role === 'alumni' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          } text-sm font-semibold`}>
                            {userObj.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm md:text-base">{userObj.name}</p>
                        {userObj.role === 'alumni' ? (
                          <>
                            <p className="text-xs md:text-sm text-gray-500 truncate">
                              {userObj.current_position && userObj.current_company
                                ? `${userObj.current_position} at ${userObj.current_company}`
                                : (userObj.department || 'Founder')}
                            </p>
                            {!!userObj.graduation_year && (
                              <p className="text-xs md:text-sm text-gray-500 truncate">Class of {userObj.graduation_year}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-xs md:text-sm text-gray-500 truncate">
                              {userObj.department || 'Student'}
                            </p>
                            {!!userObj.graduation_year && (
                              <p className="text-xs md:text-sm text-gray-500 truncate">Class of {userObj.graduation_year}</p>
                            )}
                          </>
                        )}
                      </div>
                      {getRoleBadge(userObj.role)}
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && searchTerm && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No users found</p>
                  </div>
                )}
                {filteredUsers.length === 0 && !searchTerm && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No available users</p>
                  </div>
                )}
              </div>
            ) : conversations.length > 0 ? (
              <div className="p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                      selectedConversation?.id === conversation.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div onClick={(e) => { e.stopPropagation(); openProfileModal(conversation.other_user_id); }}>
                          <Avatar className="h-10 w-10 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
                            <AvatarImage 
                              src={conversation.other_user_avatar ? `https://alumconnect-s4c7.onrender.com/api/profile/picture/${conversation.other_user_avatar}` : undefined}
                              alt={conversation.other_user_name}
                            />
                            <AvatarFallback className={`${
                              conversation.other_user_role === 'alumni' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            } text-sm font-semibold`}>
                              {conversation.other_user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        {conversation.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 truncate text-sm md:text-base">
                              {conversation.other_user_name}
                            </p>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              conversation.other_user_role === 'alumni' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {conversation.other_user_role === 'alumni' ? 'Founder' : 'Student'}
                            </span>
                          </div>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        {conversation.last_message && (
                          <p className="text-xs md:text-sm text-gray-500 truncate">
                            {conversation.last_message}
                          </p>
                        )}
                        {conversation.last_message_time && (
                          <p className="text-xs text-gray-400">
                            {formatDate(conversation.last_message_time)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-600 mb-4 text-xs md:text-sm">
                  Start a conversation with other users in the community
                </p>
                <Button 
                  onClick={() => setShowNewChat(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Chat
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className={`${
          !selectedConversation ? 'hidden md:flex' : 'flex'
        } flex-1 flex-col w-full`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedConversation(null)
                        setMessages([])
                        window.history.pushState({}, '', '/messages')
                      }}
                      className="md:hidden text-gray-500 hover:text-gray-700 p-1"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div onClick={() => openProfileModal(selectedConversation.other_user_id)}>
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
                        <AvatarImage 
                          src={selectedConversation.other_user_avatar ? `https://alumconnect-s4c7.onrender.com/api/profile/picture/${selectedConversation.other_user_avatar}` : undefined}
                          alt={selectedConversation.other_user_name}
                        />
                        <AvatarFallback className={`${
                          selectedConversation.other_user_role === 'alumni' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        } text-xs md:text-sm font-semibold`}>
                          {selectedConversation.other_user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                        {selectedConversation.other_user_name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500">
                        {selectedConversation.other_user_role === 'alumni' ? 'Founder' : 'Student'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedConversation(null)
                      setMessages([])
                      window.history.pushState({}, '', '/messages')
                    }}
                    className="hidden md:flex text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.sender_id === user?.id
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-2xl ${
                              isOwnMessage
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            <p className="text-xs md:text-sm break-words">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center px-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                      <p className="text-gray-600 text-xs md:text-sm">
                        Start the conversation by sending a message below.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-3 md:p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    className="flex-1 text-sm md:text-base"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center px-4">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <MessageCircle className="h-8 w-8 md:h-12 md:w-12 text-gray-400" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Welcome to Messages</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6 md:mb-8 text-sm md:text-base">
                  Connect with alumni and students in the community. Select a conversation or start a new chat.
                </p>
                <Button 
                  onClick={() => setShowNewChat(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {profileModalUserId && (
        <ProfileModal
          userId={profileModalUserId}
          isOpen={isProfileModalOpen}
          onClose={closeProfileModal}
        />
      )}
    </div>
  )
}