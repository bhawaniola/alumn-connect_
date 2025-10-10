import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { LandingPage } from './pages/LandingPage'
import { AboutPage } from './pages/AboutPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { AlumniConnectPage } from './pages/AlumniConnectPage'
import { BlogPage } from './pages/BlogPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { StudentDashboard } from './pages/StudentDashboard'
import { AlumniDashboard } from './pages/AlumniDashboard'
import { ProfilePage } from './pages/ProfilePage'
import { CreateProjectPage } from './pages/CreateProjectPage'
import { CreateBlogPage } from './pages/CreateBlogPage'
import { AlumniMenteesPage } from './pages/AlumniMenteesPage'
import { AlumniProjectsPage } from './pages/AlumniProjectsPage'
import { AlumniBlogsPage } from './pages/AlumniBlogsPage'
import { EditBlogPage } from './pages/EditBlogPage'
import { AllBlogsPage } from './pages/AllBlogsPage'
import { MessagesPage } from './pages/MessagesPage'
import { ChatPage } from './pages/ChatPage'
import { AlumniProjectApplicationsPage } from './pages/AlumniProjectApplicationsPage'
import { ProjectApplicationsPage } from './pages/ProjectApplicationsPage'
import { StudentApplicationsPage } from './pages/StudentApplicationsPage'
import { DashboardRouter } from './pages/DashboardRouter'
import { MentorsPage } from './pages/MentorsPage'
import { FindMentorsPage } from './pages/FindMentorsPage'
import { AuthProvider } from './contexts/AuthContext'
import Team from './pages/Team'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import { EditProjectPage } from './pages/EditProjectPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/alumni/projects/:id/edit" element={<EditProjectPage />} />
            <Route path="/mentors" element={<MentorsPage />} />
            <Route path="/find-mentors" element={<FindMentorsPage />} />
            <Route path="/alumni-connect" element={<AlumniConnectPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />
            <Route path="/alumni/blogs/:id/edit" element={<EditBlogPage />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student/applications" element={<StudentApplicationsPage />} />
            <Route path="/founders-dashboard" element={<AlumniDashboard />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/alumni/create-project" element={<CreateProjectPage />} />
            <Route path="/alumni/create-blog" element={<CreateBlogPage />} />
            <Route path="/alumni/mentees" element={<AlumniMenteesPage />} />
            <Route path="/alumni/projects" element={<AlumniProjectsPage />} />
            <Route path="/alumni/projects/:id/applications" element={<ProjectApplicationsPage />} />
            <Route path="/alumni/blogs" element={<AlumniBlogsPage />} />
            <Route path="/all-blogs" element={<AllBlogsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:id" element={<ChatPage />} />
            <Route path="/alumni/project-applications" element={<AlumniProjectApplicationsPage />} />
            <Route path="/team" element={<Team />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App