#!/usr/bin/env python3
"""
Script to update StudentDashboard.tsx to show ongoing and completed projects in Recent Activity
"""

def update_student_dashboard():
    file_path = 'd:/AlumConnect/frontend/src/pages/StudentDashboard.tsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # The student dashboard already shows applied projects in the Recent Activity section
    # We just need to enhance it to distinguish between ongoing (active) and completed projects
    
    # 1. Update the Recent Activity section to show project status with different styling
    old_activity = """                      <div key={project.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Applied to {project.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(project.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={project.application_status === 'accepted' ? 'default' : 'secondary'} className="capitalize">
                          {project.application_status}
                        </Badge>
                      </div>"""
    
    new_activity = """                      <div key={project.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className={`w-3 h-3 rounded-full ${
                          project.status === 'completed' ? 'bg-green-500' : 
                          project.status === 'active' ? 'bg-blue-500 animate-pulse' : 
                          'bg-gray-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Applied to {project.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(project.applied_at).toLocaleDateString()} • {project.status === 'active' ? 'Ongoing' : project.status === 'completed' ? 'Completed' : project.status}
                          </p>
                        </div>
                        <Badge variant={project.application_status === 'accepted' ? 'default' : 'secondary'} className="capitalize">
                          {project.application_status}
                        </Badge>
                      </div>"""
    
    content = content.replace(old_activity, new_activity)
    
    # 2. Update the Applied Projects section to show project status
    old_applied = """                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900">{project.title}</p>
                        <p className="text-sm text-gray-500">{project.category}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={project.application_status === 'accepted' ? 'default' : 'secondary'} className="capitalize">
                          {project.application_status}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild className="hover:bg-gray-200">
                          <Link to={`/projects/${project.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>"""
    
    new_applied = """                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900">{project.title}</p>
                        <p className="text-sm text-gray-500">{project.category} • {project.status === 'active' ? 'Ongoing' : project.status === 'completed' ? 'Completed' : project.status}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={project.application_status === 'accepted' ? 'default' : 'secondary'} 
                          className={`capitalize ${
                            project.status === 'completed' ? 'bg-green-500' : 
                            project.status === 'active' ? 'bg-blue-500' : ''
                          }`}
                        >
                          {project.application_status}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild className="hover:bg-gray-200">
                          <Link to={`/projects/${project.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>"""
    
    content = content.replace(old_applied, new_applied)
    
    # Write the updated content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Successfully updated StudentDashboard.tsx")
    print("Changes applied:")
    print("  - Updated Recent Activity to show project status (ongoing/completed)")
    print("  - Added visual indicators for project status")
    print("  - Enhanced Applied Projects section with status badges")

if __name__ == '__main__':
    try:
        update_student_dashboard()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
