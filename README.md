# IIT KGP AlumConnect

A comprehensive digital platform designed to showcase ongoing and completed startup projects from IIT Kharagpur, strengthen alumni-student collaboration, and provide knowledge-sharing opportunities.

## 🚀 Features

### Public Features
- **Landing Page**: Beautiful hero section with featured projects and alumni success stories
- **About Page**: Comprehensive information about the platform and its mission
- **Project Showcase**: Browse and discover innovative projects from students and alumni
- **Alumni Connect**: Connect with successful alumni for mentorship and opportunities
- **Blog & Insights**: Access knowledge and experiences from the alumni community

### Authentication
- **Secure Login/Register**: JWT-based authentication system
- **Role-based Access**: Separate experiences for students and alumni
- **Profile Management**: Comprehensive user profiles with skills and interests

### Student Features
- **Student Dashboard**: Personalized dashboard with applications and opportunities
- **Project Applications**: Apply for internships and mentorship opportunities
- **Mentorship Matching**: Connect with alumni based on interests and skills
- **Mentor Availability Filter**: Filter mentors by availability status
- **CV/Resume Upload**: Upload and manage CV in PDF format

### Alumni Features
- **Alumni Dashboard**: Manage projects, mentorship, and community engagement
- **Project Management**: Showcase and manage your projects
- **Mentorship System**: Offer guidance and opportunities to students
- **Blog Publishing**: Share insights and experiences with the community
- **Availability Toggle**: Control when you're available for mentorship requests

## ⭐ Alumni Availability Feature

### Overview
Alumni can mark themselves as available/unavailable for mentorship, and students can filter mentors based on their availability status.

### For Alumni - How to Toggle Availability:
1. Click **"Edit Profile"** button
2. Scroll to the **"About"** section
3. Find **"Mentorship Availability"** toggle at the bottom
4. Click the toggle switch to change availability
5. Click **"Save Changes"** to update
6. The badge in the profile header updates immediately

**Features:**
- ✅ Modern iOS-style toggle (green when available, gray when not)
- ✅ Clear visual feedback with status badges
- ✅ One-click toggle, no complex forms
- ✅ Full control over when to receive mentorship requests

### For Students - How to Find Available Mentors:
1. Navigate to **"Find Mentors"** page
2. Use the **"Availability"** filter dropdown:
   - "All Alumni" - Show all mentors
   - "Available for Mentorship" - Show only available mentors
   - "Not Available" - Show unavailable mentors
3. See availability badges on each mentor card:
   - Green "✓ Available" badge = mentor is accepting requests
   - Gray "Not Available" badge = mentor is not currently available

### Backend API Endpoints:

#### Get Available Alumni Only
```bash
GET /api/alumni?availability=available
Authorization: Bearer <token>
```

#### Update Alumni Availability
```bash
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_available": true  // or false
}
```

### Database Schema:
- **Column**: `is_available` (BOOLEAN, DEFAULT 1) in `users` table
- **Default**: All alumni are available by default

### Benefits:
- **For Students**: Easily find mentors who are currently available for mentorship
- **For Alumni**: Control when they want to be approached for mentorship
- **Better Experience**: Reduces unsuccessful mentorship requests to busy alumni
- **Transparency**: Clear visibility of mentor availability status

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful, accessible components
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Flask** (Python) for the API server
- **SQLite** for database
- **JWT** for authentication
- **Flask-CORS** for cross-origin requests

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Database Migration (For Existing Databases)
If you're upgrading from an older version, run the migration script to add the availability column:

```bash
cd backend
python add_availability_column.py
```

This will:
- Add the `is_available` column to the users table
- Set all existing alumni to available by default

## 🎨 Design Features

- **Modern UI/UX**: Clean, minimal design with beautiful hover animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: Built with accessibility in mind using shadcn/ui components
- **Dark Mode Ready**: Prepared for dark mode implementation
- **Component Library**: Consistent design system with reusable components

## 🏗️ Project Structure

```
AlumConnect/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   └── layout/       # Layout components
│   │   ├── pages/            # Page components
│   │   │   ├── ProfilePage.tsx        # Profile with availability toggle
│   │   │   ├── FindMentorsPage.tsx    # Mentor discovery with filters
│   │   │   ├── StudentDashboard.tsx   # Student dashboard
│   │   │   └── AlumniDashboard.tsx    # Alumni dashboard
│   │   ├── contexts/         # React contexts
│   │   └── lib/              # Utility functions
│   └── package.json
├── backend/
│   ├── app.py                          # Flask application with all routes
│   ├── requirements.txt                # Python dependencies
│   ├── seed_data.py                    # Database seeding script
│   ├── add_availability_column.py      # Migration script
│   └── launchpad.db                    # SQLite database (created on first run)
└── README.md
```

## 🔧 Development

### Running the Development Server

1. **Start the Backend**:
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```
   The backend will run on `http://localhost:5001`

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Profile Management
- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update user profile (protected)
- `POST /api/profile/upload-picture` - Upload profile picture
- `POST /api/profile/cv` - Upload CV (students only)
- `DELETE /api/profile/cv` - Delete CV

#### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project (alumni only)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Alumni & Mentorship
- `GET /api/alumni` - Get all alumni (with availability filter)
- `POST /api/mentorship-requests` - Send mentorship request
- `GET /api/alumni/mentorship-requests` - Get received requests (alumni)
- `PUT /api/mentorship-requests/:id` - Accept/decline request

#### Blog
- `GET /api/blog` - Get all blog posts
- `POST /api/blog` - Create blog post (alumni only)
- `GET /api/blog/:id` - Get blog post details

## 🎯 Key Features Implemented

### ✅ Completed
- [x] Modern React frontend with TypeScript
- [x] Beautiful landing page with hero section
- [x] Responsive navigation with mobile menu
- [x] Authentication system (login/register)
- [x] User dashboards for students and alumni
- [x] Project showcase pages
- [x] Blog system
- [x] Alumni connect system
- [x] Flask backend with JWT authentication
- [x] SQLite database with proper schema
- [x] CORS configuration for frontend-backend communication
- [x] **Alumni availability toggle feature**
- [x] **Mentor filtering by availability**
- [x] **Profile picture upload**
- [x] **CV/Resume upload for students**
- [x] **Skills and achievements management**
- [x] **Project status tracking (ongoing/completed)**

### 🚧 Future Enhancements
- [ ] Real-time messaging system
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Availability schedule (e.g., available on weekends only)
- [ ] Automatic availability toggle based on calendar integration
- [ ] Notification system when alumni become available
- [ ] "Busy until" date feature

## 🎨 UI/UX Highlights

- **Hover Animations**: Smooth transitions and hover effects throughout the interface
- **Card-based Design**: Clean, modern card layouts for content organization
- **Gradient Backgrounds**: Beautiful gradient overlays for visual appeal
- **Icon Integration**: Consistent iconography using Lucide React
- **Typography**: Clear hierarchy with proper font weights and sizes
- **Color Scheme**: Professional color palette with primary and secondary colors
- **Toggle Switches**: Modern iOS-style toggles for settings
- **Status Badges**: Color-coded badges for quick status identification

## 🔐 Security Features

- JWT-based authentication
- Password hashing with Werkzeug
- CORS configuration for secure API access
- Input validation and sanitization
- Protected routes for authenticated users
- File upload validation (size and type)
- Secure file storage

## 📱 Responsive Design

The platform is fully responsive and works seamlessly across:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🧪 Testing

### Manual Testing Checklist

#### Alumni Availability Feature:
- [x] Alumni can see availability toggle in edit mode
- [x] Toggle switch changes state on click
- [x] Save button updates the backend
- [x] Profile header badge reflects current status
- [x] Students can see availability badge on mentor cards
- [x] Filter works correctly on Find Mentors page
- [x] Default value is "available" for new alumni
- [x] Changes persist after page refresh

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎓 About IIT KGP

The Indian Institute of Technology Kharagpur is one of India's premier engineering institutions, known for its excellence in education, research, and innovation. The AlumConnect platform aims to strengthen the connection between current students and alumni while showcasing the innovative spirit of the IIT KGP community.

---

Built with ❤️ for the IIT KGP community
