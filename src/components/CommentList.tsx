import { useComments } from '../hooks/useComments'
import { Comment } from './Comment'
import { Button } from './ui/Button'
import { Loader2 } from 'lucide-react'

interface CommentListProps {
  parentId?: string
  level?: number
}

export function CommentList({ parentId, level = 0 }: CommentListProps) {
  const { comments, loading, error, mutate } = useComments(parentId)

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Failed to load comments</p>
        <Button onClick={() => mutate()} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {level === 0 ? 'No comments yet. Be the first to comment!' : 'No replies yet.'}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {comments.map((comment) => (
        <div key={comment.id}>
          <Comment
            comment={comment}
            onUpdate={mutate}
            level={level}
          />
          {comment._count.replies > 0 && (
            <CommentList parentId={comment.id} level={level + 1} />
          )}
        </div>
      ))}
    </div>
  )
}