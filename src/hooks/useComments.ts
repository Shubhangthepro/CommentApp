import useSWR from 'swr'
import { Comment } from '../types'
import { mockApi } from '../lib/mockApi'

interface CommentsResponse {
  comments: Comment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const fetcher = (parentId?: string) => mockApi.getComments(parentId)

export function useComments(parentId?: string) {
  const { data, error, mutate } = useSWR<CommentsResponse>(
    ['comments', parentId],
    () => fetcher(parentId),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    comments: data?.comments || [],
    pagination: data?.pagination,
    loading: !error && !data,
    error,
    mutate,
  }
}

export function useCreateComment() {
  const createComment = async (content: string, parentId?: string) => {
    return await mockApi.createComment(content, parentId)
  }

  return { createComment }
}

export function useUpdateComment() {
  const updateComment = async (id: string, content: string) => {
    return await mockApi.updateComment(id, content)
  }

  return { updateComment }
}

export function useDeleteComment() {
  const deleteComment = async (id: string) => {
    return await mockApi.deleteComment(id)
  }

  return { deleteComment }
}

export function useLikeComment() {
  const likeComment = async (id: string) => {
    return await mockApi.likeComment(id)
  }

  return { likeComment }
}