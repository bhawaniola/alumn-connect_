import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { GooeyNav } from '../../components/ui/gooey-nav'
import { Sheet, SheetContent, SheetTrigger } from '../../components/ui/sheet'
import { Menu, GraduationCap, Users, BookOpen, MessageCircle, LogOut, User } from 'lucide-react'
import logoImage from '../../images/name.png'

export const Header: React.FC = () => {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)

  // Fetch profile avatar when user logs in
  useEffect(() => {
    const fetchAvatar = async () => {
      if (user && token) {
        try {
          const res = await fetch('https://alumconnect-s4c7.onrender.com/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.ok) {
            const profile = await res.json()
            setProfileAvatar(profile.avatar)
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
        }
      } else {
        setProfileAvatar(null)
      }
    }
    fetchAvatar()
  }, [user, token])

  const navigationItems = [
    { label: 'Founder Connect', href: '/alumni-connect' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
  ]

  // Show different navigation based on user role and current page
  const getNavigationItems = () => {
    if (!user) {
      return navigationItems
    }
    
    if (user.role === 'alumni') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Messages', href: '/messages' },
        { label: 'My Projects', href: '/alumni/projects' },
        { label: 'My Blogs', href: '/alumni/blogs' },
        { label: 'Mentees', href: '/alumni/mentees' },
      ]
    } else if (user.role === 'student') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Messages', href: '/messages' },
        { label: 'Founder Connect', href: '/alumni-connect' },
        { label: 'Blog', href: '/blog' },
      ]
    }
    
    return navigationItems
  }

  const getMobileNavigationItems = () => {
    if (!user) {
      return [
        { name: 'Alumni Connect', href: '/alumni-connect', icon: Users },
        { name: 'Blog', href: '/blog', icon: BookOpen },
        { name: 'About', href: '/about', icon: GraduationCap },
      ]
    }
    
    if (user.role === 'alumni') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: GraduationCap },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
        { name: 'My Projects', href: '/alumni/projects', icon: Users },
        { name: 'My Blogs', href: '/alumni/blogs', icon: BookOpen },
        { name: 'Mentees', href: '/alumni/mentees', icon: Users },
      ]
    } else if (user.role === 'student') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: GraduationCap },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
        { name: 'Alumni Connect', href: '/alumni-connect', icon: Users },
        { name: 'Blog', href: '/blog', icon: BookOpen },
      ]
    }
    
    return [
      { name: 'Founder Connect', href: '/alumni-connect', icon: Users },
      { name: 'Blog', href: '/blog', icon: BookOpen },
      { name: 'About', href: '/about', icon: GraduationCap },
    ]
  }

  return (
    <>
      {/* Click outside handler for the profile menu */}
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-18 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-xl bg-gradient-to-br shadow-sm">
            <img
              src={logoImage}
              alt="Logo"
              className="h-16 w-64 object-cover rounded-full"
            />
            </div>
          </Link>

          {/* Desktop Navigation with GooeyNav */}
           <div className="hidden md:flex">
             <GooeyNav 
               items={getNavigationItems()}
               animationTime={300}
               particleCount={6}
               particleDistances={[40, 15]}
               particleR={50}
               timeVariance={100}
               initialActiveIndex={0}
             />
           </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full p-0"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={profileAvatar ? `https://alumconnect-s4c7.onrender.com/api/profile/picture/${profileAvatar}` : undefined} 
                      alt={user.name} 
                    />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
                
                {isProfileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    onMouseLeave={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="mr-3 h-5 w-5 text-gray-400" />
                        Your Profile
                      </Link>
                      {/* <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="mr-3 h-5 w-5 text-gray-400" />
                        Settings
                      </Link> */}
                      <button
                        onClick={() => {
                          logout()
                          setIsProfileMenuOpen(false)
                          navigate('/')
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="mr-3 h-5 w-5 text-red-400" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
               <div className="flex items-center space-x-3">
                 <Button variant="ghost" className="text-gray-700 hover:bg-gray-100" asChild>
                   <Link to="/login">Login</Link>
                 </Button>
                 <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm border-0" asChild>
                   <Link to="/register">Get Started</Link>
                 </Button>
               </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                 <Button variant="ghost" size="icon" className="md:hidden text-gray-700 hover:bg-gray-100">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {getMobileNavigationItems().map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                       className="flex items-center space-x-2 text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  {!user && (
                    <div className="flex flex-col space-y-2 pt-4 border-t">
                       <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" asChild>
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0" asChild>
                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
    </>
  )
}