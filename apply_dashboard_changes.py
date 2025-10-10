#!/usr/bin/env python3
"""
Script to update AlumniDashboard.tsx to show ongoing and completed projects in Recent Activity
"""

import re

def update_alumni_dashboard():
    file_path = 'd:/AlumConnect/frontend/src/pages/AlumniDashboard.tsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update the interface
    content = content.replace(
        "type: 'mentorship' | 'project_application'",
        "type: 'mentorship' | 'project_application' | 'project'"
    )
    
    # 2. Update the Promise.all to include projects
    content = content.replace(
        "const [mentorshipRes, applicationsRes] = await Promise.all([",
        "const [mentorshipRes, applicationsRes, projectsRes] = await Promise.all(["
    )
    
    content = content.replace(
        "fetch('https://alumconnect-s4c7.onrender.com/api/alumni/project-applications', { headers: { Authorization: `Bearer ${token}` } })\n        ])",
        "fetch('https://alumconnect-s4c7.onrender.com/api/alumni/project-applications', { headers: { Authorization: `Bearer ${token}` } }),\n          fetch('https://alumconnect-s4c7.onrender.com/api/alumni/projects', { headers: { Authorization: `Bearer ${token}` } })\n        ])"
    )
    
    # 3. Add projects processing
    projects_code = """
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          // Add ongoing and completed projects
          for (const p of projectsData) {
            if (p.status === 'active' || p.status === 'completed') {
              activities.push({
                id: p.id,
                type: 'project',
                title: p.title,
                description: p.description.length > 100 ? p.description.substring(0, 100) + '...' : p.description,
                status: p.status,
                created_at: p.created_at
              })
            }
          }
        }
"""
    
    content = content.replace(
        "        // Sort desc by created_at and keep recent ones",
        projects_code + "\n        // Sort desc by created_at and keep recent ones"
    )
    
    # 4. Update the key to avoid duplicates
    content = content.replace(
        '<div key={activity.id} className="flex items-start space-x-3',
        '<div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3'
    )
    
    # 5. Update the icon background color logic
    old_bg = """                      <div className={`p-2 rounded-full ${
                        activity.type === 'mentorship' 
                          ? 'bg-purple-100 group-hover:bg-purple-200' 
                          : 'bg-blue-100 group-hover:bg-blue-200'
                      } transition-colors duration-200`}>"""
    
    new_bg = """                      <div className={`p-2 rounded-full ${
                        activity.type === 'mentorship' 
                          ? 'bg-purple-100 group-hover:bg-purple-200' 
                          : activity.type === 'project'
                          ? activity.status === 'completed' ? 'bg-green-100 group-hover:bg-green-200' : 'bg-blue-100 group-hover:bg-blue-200'
                          : 'bg-blue-100 group-hover:bg-blue-200'
                      } transition-colors duration-200`}>"""
    
    content = content.replace(old_bg, new_bg)
    
    # 6. Update the icon rendering
    old_icon = """                        {activity.type === 'mentorship' ? (
                          <Users className={`h-4 w-4 ${
                            activity.type === 'mentorship' ? 'text-purple-600' : 'text-blue-600'
                          }`} />
                        ) : (
                          <Briefcase className="h-4 w-4 text-blue-600" />
                        )}"""
    
    new_icon = """                        {activity.type === 'mentorship' ? (
                          <Users className="h-4 w-4 text-purple-600" />
                        ) : activity.type === 'project' ? (
                          activity.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Briefcase className="h-4 w-4 text-blue-600" />
                          )
                        ) : (
                          <Briefcase className="h-4 w-4 text-blue-600" />
                        )}"""
    
    content = content.replace(old_icon, new_icon)
    
    # 7. Update the badge rendering
    old_badge = """                          <Badge 
                            variant={activity.status === 'pending' ? 'secondary' : 'default'}
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>"""
    
    new_badge = """                          <Badge 
                            variant={
                              activity.status === 'pending' ? 'secondary' : 
                              activity.status === 'completed' ? 'default' :
                              activity.status === 'active' ? 'default' : 'secondary'
                            }
                            className={`text-xs ${
                              activity.status === 'completed' ? 'bg-green-500' :
                              activity.status === 'active' ? 'bg-blue-500' : ''
                            }`}
                          >
                            {activity.status === 'active' ? 'ongoing' : activity.status}
                          </Badge>"""
    
    content = content.replace(old_badge, new_badge)
    
    # Write the updated content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Successfully updated AlumniDashboard.tsx")
    print("Changes applied:")
    print("  - Added 'project' type to RecentActivity interface")
    print("  - Added projects fetch to Promise.all")
    print("  - Added logic to process ongoing and completed projects")
    print("  - Updated UI to display project icons and badges")

if __name__ == '__main__':
    try:
        update_alumni_dashboard()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
