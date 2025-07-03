import { useState } from 'react'
import { formatTimeAgo, canEditComment } from '../lib/utils'
import { useAuth } from '../hooks/useAuth'
import { useUpdateComment, useDeleteComment, useLikeComment } from '../hooks/useComments'
import { CommentForm } from './CommentForm'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'
import { Heart, MessageCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { Comment as CommentType } from '../types'

interface CommentProps {
  comment: CommentType
  onUpdate?: () => void
  level?: number
}

export function Comment({ comment, onUpdate, level = 0 }: CommentProps) {
  const { user } = useAuth()
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showMenu, setShowMenu] = useState(false)
  
  const { updateComment } = useUpdateComment()
  const { deleteComment } = useDeleteComment()
  const { likeComment } = useLikeComment()

  const isAuthor = user?.id === comment.authorId
  const isLiked = comment.likes.some(like => like.userId === user?.id)
  const canEdit = isAuthor && canEditComment(new Date(comment.createdAt))

  const handleLike = async () => {
    try {
      await likeComment(comment.id)
      onUpdate?.()
    } catch (error) {
      toast.error('Failed to like comment')
    }
  }

  const handleEdit = async () => {
    if (!editContent.trim()) return
    
    try {
      await updateComment(comment.id, editContent.trim())
      setIsEditing(false)
      toast.success('Comment updated!')
      onUpdate?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update comment')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    try {
      await deleteComment(comment.id)
      toast.success('Comment deleted!')
      onUpdate?.()
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const marginLeft = Math.min(level * 24, 96) // Max 4 levels of nesting

  return (
    <div className="border-l-2 border-gray-100" style={{ marginLeft: `${marginLeft}px` }}>
      <div className="pl-4 py-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {comment.author.username[0].toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-medium text-sm">{comment.author.username}</span>
              <span className="text-gray-500 text-xs ml-2">
                {formatTimeAgo(new Date(comment.createdAt))}
              </span>
            </div>
          </div>
          
          {isAuthor && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 bg-white border rounded-md shadow-lg z-10">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setIsEditing(true)
                        setShowMenu(false)
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDelete()
                      setShowMenu(false)
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              maxLength={1000}
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleEdit}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 mb-3 whitespace-pre-wrap">{comment.content}</p>
        )}

        <div className="flex items-center space-x-4 text-sm">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{comment.likes.length}</span>
          </button>
          
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Reply</span>
          </button>
          
          {comment._count.replies > 0 && (
            <span className="text-gray-500">
              {comment._count.replies} {comment._count.replies === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>

        {isReplying && (
          <div className="mt-3">
            <CommentForm
              parentId={comment.id}
              onSuccess={() => {
                setIsReplying(false)
                onUpdate?.()
              }}
              placeholder={`Reply to ${comment.author.username}...`}
            />
          </div>
        )}
      </div>
    </div>
  )
}