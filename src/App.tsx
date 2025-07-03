import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { AuthForm } from './components/AuthForm'
import { CommentForm } from './components/CommentForm'
import { CommentList } from './components/CommentList'
import { Button } from './components/ui/Button'
import { MessageSquare, LogOut, Bell } from 'lucide-react'
import { useState } from 'react'

function AppContent() {
  const { user, logout, loading } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCommentSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Comment App</h1>
            <p className="text-gray-600 mt-2">Join the conversation and share your thoughts</p>
          </div>
          <AuthForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Comment App</h1>
              <p className="text-xs text-gray-500">Scalable Discussion Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user.username}!</span>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Start a Discussion</h2>
          </div>
          <CommentForm onSuccess={handleCommentSuccess} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b bg-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <span>Comments</span>
              </h2>
              <div className="text-sm text-gray-500">
                Real-time discussion with nested replies
              </div>
            </div>
          </div>
          <div key={refreshKey}>
            <CommentList />
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Built with React, TypeScript, and Tailwind CSS</p>
          <p className="mt-1">Features: Nested comments, real-time updates, 15-min edit window</p>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
  )
}

export default App