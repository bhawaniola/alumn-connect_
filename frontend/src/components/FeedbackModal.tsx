import React, { useState } from 'react'
import { X, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: number
  studentName: string
  projectTitle: string
  onSuccess: () => void
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  studentName,
  projectTitle,
  onSuccess
}) => {
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedback.trim()) {
      setError('Please provide feedback before marking as completed')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://alumconnect-s4c7.onrender.com/api/project-applications/${applicationId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ feedback })
      })

      if (response.ok) {
        onSuccess()
        onClose()
        setFeedback('')
      } else {
        const data = await response.json()
        console.error('Backend error:', data)
        setError(data.error || 'Failed to submit feedback')
      }
    } catch (err) {
      console.error('Request error:', err)
      setError('An error occurred while submitting feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mark Project as Completed</h2>
                <p className="text-sm text-gray-500">Provide feedback for {studentName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Project Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-gray-700 mb-1">Project</p>
            <p className="text-lg font-semibold text-gray-900">{projectTitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Feedback for Student <span className="text-red-500">*</span>
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your feedback on the student's performance, contributions, and areas of growth..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={8}
                disabled={isSubmitting}
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                This feedback will be visible to the student and help them improve their skills.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !feedback.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
