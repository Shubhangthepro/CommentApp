import { User, Comment, Notification } from '../types'
import { generateId } from './utils'

// Mock data storage
let users: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    username: 'demo_user',
    createdAt: new Date().toISOString()
  }
]

let comments: Comment[] = [
  {
    id: '1',
    content: 'This is a sample comment to demonstrate the nested comment system. You can reply to this comment and create multiple levels of discussion.',
    authorId: '1',
    parentId: null,
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    author: {
      id: '1',
      username: 'demo_user'
    },
    likes: [],
    _count: { replies: 0 }
  }
]

let notifications: Notification[] = []
let currentUser: User | null = null

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApi = {
  // Auth
  async login(email: string, password: string) {
    await delay(500)
    
    const user = users.find(u => u.email === email)
    if (!user || password !== 'password') {
      throw new Error('Invalid credentials')
    }
    
    currentUser = user
    return {
      user,
      token: 'mock-jwt-token'
    }
  },

  async register(email: string, username: string, password: string) {
    await delay(500)
    
    if (users.some(u => u.email === email || u.username === username)) {
      throw new Error('User with this email or username already exists')
    }
    
    const user: User = {
      id: generateId(),
      email,
      username,
      createdAt: new Date().toISOString()
    }
    
    users.push(user)
    currentUser = user
    
    return {
      user,
      token: 'mock-jwt-token'
    }
  },

  // Comments
  async getComments(parentId?: string) {
    await delay(300)
    
    const filteredComments = comments
      .filter(c => c.parentId === (parentId || null) && !c.isDeleted)
      .map(comment => ({
        ...comment,
        _count: {
          replies: comments.filter(c => c.parentId === comment.id && !c.isDeleted).length
        }
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return {
      comments: filteredComments,
      pagination: {
        page: 1,
        limit: 20,
        total: filteredComments.length,
        pages: 1
      }
    }
  },

  async createComment(content: string, parentId?: string) {
    await delay(400)
    
    if (!currentUser) throw new Error('Unauthorized')
    
    const comment: Comment = {
      id: generateId(),
      content,
      authorId: currentUser.id,
      parentId: parentId || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: currentUser.id,
        username: currentUser.username
      },
      likes: [],
      _count: { replies: 0 }
    }
    
    comments.push(comment)
    
    // Create notification for parent comment author
    if (parentId) {
      const parentComment = comments.find(c => c.id === parentId)
      if (parentComment && parentComment.authorId !== currentUser.id) {
        const notification: Notification = {
          id: generateId(),
          userId: parentComment.authorId,
          commentId: parentComment.id,
          type: 'REPLY',
          message: `${currentUser.username} replied to your comment`,
          isRead: false,
          createdAt: new Date().toISOString(),
          comment: {
            id: parentComment.id,
            content: parentComment.content,
            author: {
              username: parentComment.author.username
            }
          }
        }
        notifications.push(notification)
      }
    }
    
    return comment
  },

  async updateComment(id: string, content: string) {
    await delay(300)
    
    if (!currentUser) throw new Error('Unauthorized')
    
    const comment = comments.find(c => c.id === id)
    if (!comment) throw new Error('Comment not found')
    if (comment.authorId !== currentUser.id) throw new Error('Forbidden')
    
    const createdAt = new Date(comment.createdAt)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60))
    
    if (diffInMinutes > 15) {
      throw new Error('Comment can only be edited within 15 minutes of posting')
    }
    
    comment.content = content
    comment.updatedAt = new Date().toISOString()
    
    return comment
  },

  async deleteComment(id: string) {
    await delay(300)
    
    if (!currentUser) throw new Error('Unauthorized')
    
    const comment = comments.find(c => c.id === id)
    if (!comment) throw new Error('Comment not found')
    if (comment.authorId !== currentUser.id) throw new Error('Forbidden')
    
    comment.isDeleted = true
    comment.deletedAt = new Date().toISOString()
    
    return { message: 'Comment deleted successfully' }
  },

  async restoreComment(id: string) {
    await delay(300)
    
    if (!currentUser) throw new Error('Unauthorized')
    
    const comment = comments.find(c => c.id === id)
    if (!comment) throw new Error('Comment not found')
    if (comment.authorId !== currentUser.id) throw new Error('Forbidden')
    
    if (!comment.isDeleted || !comment.deletedAt) {
      throw new Error('Comment cannot be restored')
    }
    
    const deletedAt = new Date(comment.deletedAt)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - deletedAt.getTime()) / (1000 * 60))
    
    if (diffInMinutes > 15) {
      throw new Error('Comment can only be restored within 15 minutes of deletion')
    }
    
    comment.isDeleted = false
    comment.deletedAt = null
    
    return comment
  },

  async likeComment(id: string) {
    await delay(200)
    
    if (!currentUser) throw new Error('Unauthorized')
    
    const comment = comments.find(c => c.id === id)
    if (!comment || comment.isDeleted) throw new Error('Comment not found')
    
    const existingLike = comment.likes.find(like => like.userId === currentUser!.id)
    
    if (existingLike) {
      // Unlike
      comment.likes = comment.likes.filter(like => like.userId !== currentUser!.id)
      return { liked: false }
    } else {
      // Like
      comment.likes.push({ userId: currentUser.id })
      
      // Create notification for comment author
      if (comment.authorId !== currentUser.id) {
        const notification: Notification = {
          id: generateId(),
          userId: comment.authorId,
          commentId: comment.id,
          type: 'LIKE',
          message: `${currentUser.username} liked your comment`,
          isRead: false,
          createdAt: new Date().toISOString(),
          comment: {
            id: comment.id,
            content: comment.content,
            author: {
              username: comment.author.username
            }
          }
        }
        notifications.push(notification)
      }
      
      return { liked: true }
    }
  },

  // Notifications
  async getNotifications() {
    await delay(300)
    
    if (!currentUser) throw new Error('Unauthorized')
    
    const userNotifications = notifications
      .filter(n => n.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    const unreadCount = userNotifications.filter(n => !n.isRead).length
    
    return {
      notifications: userNotifications,
      unreadCount
    }
  },

  async markNotificationsRead() {
    await delay(200)
    
    if (!currentUser) throw new Error('Unauthorized')
    
    notifications.forEach(n => {
      if (n.userId === currentUser!.id) {
        n.isRead = true
      }
    })
    
    return { message: 'All notifications marked as read' }
  },

  getCurrentUser() {
    return currentUser
  },

  setCurrentUser(user: User | null) {
    currentUser = user
  }
}