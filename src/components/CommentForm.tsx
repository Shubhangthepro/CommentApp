import { useState } from 'react'
import { useCreateComment } from '../hooks/useComments'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'
import toast from 'react-hot-toast'

interface CommentFormProps {
  parentId?: string
  onSuccess?: () => void
  placeholder?: string
}

export function CommentForm({ parentId, onSuccess, placeholder = "Write a comment..." }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createComment } = useCreateComment()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await createComment(content.trim(), parentId)
      setContent('')
      toast.success('Comment posted!')
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={1000}
        className="resize-none"
      />
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {content.length}/1000
        </span>
        <Button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          size="sm"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  )
}