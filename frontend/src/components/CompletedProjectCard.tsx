import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { CheckCircle, Calendar, User } from 'lucide-react'

interface CompletedProject {
  application_id: number
  feedback: string
  completed_at: string
  applied_at: string
  project_id: number
  title: string
  description: string
  category: string
  alumni_name: string
}

interface CompletedProjectCardProps {
  project: CompletedProject
}

export const CompletedProjectCard: React.FC<CompletedProjectCardProps> = ({ project }) => {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
              <Badge variant="outline">{project.category}</Badge>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">{project.title}</CardTitle>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Info */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>By {project.alumni_name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Completed {new Date(project.completed_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Feedback Section */}
        {project.feedback && (
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-green-800">Feedback from Alumni</p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{project.feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
