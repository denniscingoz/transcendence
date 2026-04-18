import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { mockPosts, mockComments, mockFeedComments, mockFeedPosts } from '../../mocks/posts'
import { usePost } from '../../hooks/usePost'
import { useComments, usePostComment } from '../../hooks/useComments'
import { useState } from 'react'
import { ProtectedPostThumb } from '../ui/ProtectedPostThumb'
import { PostDto } from '../../types/api'
import api from '../../api/axios'
import { useQueryClient } from '@tanstack/react-query'

type PostDetailModalProps = {
  postId: string
  onClose: () => void
}

export function PostDetailModal({
  postId,
  onClose,
}: PostDetailModalProps) {
  const { t } = useTranslation()
  const { data: post, isLoading: isPostLoading, error: postError } = usePost(postId)
  const { data: commentsData, isLoading: areCommentsLoading, error: commentsError } = useComments(postId)   
  const comments = commentsData?.items ?? []

  // const comments = allComments.filter((comment) => comment.postId === postId)
  const [content, setContent] = useState('')
  const postCommentMutation = usePostComment(postId)
  const [localPost, setLocalPost] = useState<PostDto | null>(null)
  
  const queryClient = useQueryClient()

  const handlePostComment = async () => {
  const trimmedContent = content.trim()
  if (!trimmedContent) return

  try {
    await postCommentMutation.mutateAsync(trimmedContent)
    setContent('')
  } catch (error) {
    console.error('Failed to post comment:', error)
  }
}
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])
  
 
  useEffect(() => {
    if (post) setLocalPost(post)
  }, [post])

  const toggleLike = async () => {
    if (!localPost) return

    const previousPost = localPost
    const wasLiked = previousPost.isLikedByCurrentUser

    setLocalPost({
      ...previousPost,
      isLikedByCurrentUser: !wasLiked,
      likesCount: wasLiked
        ? previousPost.likesCount - 1
        : previousPost.likesCount + 1,
    })

    try {
      if (wasLiked) {
        await api.delete(`/posts/${previousPost.id}/likes`)
      } else {
        await api.post(`/posts/${previousPost.id}/likes`)
      }
    } catch (error) {
      setLocalPost(previousPost)
      console.error('Failed to toggle like:', error)
    }
  }

  const displayPost = localPost ?? post

  const formatCount = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    return n.toString()
  }
   
  if (isPostLoading) return <div>{t('postdetail.loading')}</div>
  if (postError || !displayPost) return <div>{t('postdetail.postnotfound')}</div>
  if (areCommentsLoading) return <div>{t('postdetail.loading')}</div>
  if (commentsError) return <div>{t('postdetail.commentnotfound')}</div>


  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sm text-gray-500 hover:text-black"
        >
          {t('postdetail.close')}
        </button>

        <div className="flex items-center gap-3">
          <img
            src={displayPost.authorAvatarUrl ?  `${import.meta.env.VITE_API_BASE_URL}${displayPost.authorAvatarUrl}` : 'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'}
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold">{displayPost.authorFullName}</div>
            <div className="text-sm text-gray-500">@{displayPost.authorUsername}</div>
          </div>
        </div>
        <div className="w-full rounded-2xl object-cover">
        <ProtectedPostThumb fileUrl={displayPost.imageUrl} />
        </div>

        <p>{displayPost.content}</p>
       <button
          onClick={toggleLike}
          className="flex items-center gap-2 group"
        >
          {localPost?.isLikedByCurrentUser ? (
            <HeartFilledIcon className="w-7 h-7 text-red-500" />
          ) : (
            <HeartIcon className="w-7 h-7 text-gray-700 transition-colors group-hover:text-red-500" />
          )}
          <span className="text-sm text-gray-600">
            {formatCount(localPost?.likesCount ?? 0)}
          </span>
        </button>


        {/* Visualize comments */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start">
              <img
                src={
                  comment.authorProfileImageUrl ?  `${import.meta.env.VITE_API_BASE_URL}${comment.authorProfileImageUrl}` :
                  'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'
                }
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">{comment.fullName}</span>
                  <span className="text-sm text-gray-500">
                    @{comment.username}
                  </span>
                </div>
                <p>{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

          {/* {Enter and Click to Post Comment} */}
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder={t('postdetail.writeacomment')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handlePostComment()
              }
            }}
            disabled={postCommentMutation.isPending}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none"
          />
        
          <button
            type="button"
            onClick={handlePostComment}
            disabled={postCommentMutation.isPending || !content.trim()}
            className="bg-black text-white px-4 py-2 rounded-full disabled:opacity-50"
          >
            {postCommentMutation.isPending ? t('postdetail.posting') : t('postdetail.post')}
          </button>
        </div>

      </div>
    </div>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function HeartFilledIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
