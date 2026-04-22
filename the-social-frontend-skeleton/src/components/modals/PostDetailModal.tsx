import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePost, useDeletePost } from '../../hooks/usePost'
import { useComments, usePostComment, useDeleteComment } from '../../hooks/useComments'
import { ProtectedPostThumbContent } from '../ui/ProtectedPostThumb'
import { PostDto } from '../../types/api'
import api from '../../api/axios'
import { useMyProfile } from '../../hooks/useProfile'
import { LikesModal } from './LikesModal'

type PostDetailModalProps = {
  postId: string
  onClose: () => void
}

export function PostDetailModal({
  postId,
  onClose,
}: PostDetailModalProps) {
  const { t } = useTranslation()

  const [content, setContent] = useState('')
  const [localPost, setLocalPost] = useState<PostDto | null>(null)
  const [isPostDeleted, setIsPostDeleted] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false)

  const postCommentMutation = usePostComment(postId)
  const deleteCommentMutation = useDeleteComment(postId)
  const deletePostMutation = useDeletePost()
  const isDeletingPost = deletePostMutation.isPending
  const shouldLoadPost = !isDeletingPost && !isPostDeleted

  const { data: myProfileResponse } = useMyProfile()
  const currentUserId = myProfileResponse?.id

  const { data: post, isLoading: isPostLoading, error: postError } = usePost(postId, shouldLoadPost)
  const isOwner = !!post && !!currentUserId && post.authorId === currentUserId

  const {
    data: commentsData,
    isLoading: areCommentsLoading,
    error: commentsError,
  } = useComments(postId, 12, null, !isDeletingPost && !isPostDeleted)
  const comments = commentsData?.items ?? []

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

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId)
    try {
      await deleteCommentMutation.mutateAsync(commentId)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    } finally {
      setDeletingCommentId(null)
    }
  }

  const handleDeletePost = async () => {
    setIsPostDeleted(true)
    try {
      await deletePostMutation.mutateAsync(postId)
      onClose()
    } catch (error) {
      setIsPostDeleted(false)
      console.error('Failed to delete post:', error)
    }
  }

  const openLikesModal = () => {
    if (!isOwner) return
    setIsLikesModalOpen(true)
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
        <div>
          <button
            onClick={onClose}
            className="btn-ghost absolute right-6 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-text hover:bg-gray-100"
            >
            ×
          </button>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <img
            src={displayPost.authorAvatarUrl ? `${import.meta.env.VITE_API_BASE_URL}${displayPost.authorAvatarUrl}` : 'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />

          <div>
            <div className="font-semibold">{displayPost.authorFullName}</div>
            <div className="text-sm text-gray-500">@{displayPost.authorUsername}</div>
          </div>

          <div className="ml-auto">
            {isOwner && (
              <button
                onClick={handleDeletePost}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:opacity-80"
              >
                {t('postdetail.delete')}
              </button>
            )}
          </div>
        </div>

        <div className="w-full rounded-2xl object-cover">
          <ProtectedPostThumbContent fileUrl={displayPost.imageUrl} contentType={displayPost.contentType} />
        </div>

        <p>{displayPost.content}</p>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLike}
            className="group flex items-center gap-2"
          >
            {localPost?.isLikedByCurrentUser ? (
              <HeartFilledIcon className="h-7 w-7 text-red-500" />
            ) : (
              <HeartIcon className="h-7 w-7 text-gray-700 transition-colors group-hover:text-red-500" />
            )}
            <span className="text-sm text-gray-600">
              {formatCount(localPost?.likesCount ?? 0)}
            </span>
          </button>

          <button
            type="button"
            onClick={openLikesModal}
            disabled={!isOwner}
            className={`text-sm ${isOwner ? 'text-gray-600 hover:underline' : 'cursor-default text-gray-400'}`}
          >
            {(localPost?.likesCount ?? 0) > 1 ? t('postdetail.likes') : t('postdetail.like')}
          </button>
        </div>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <img
                src={
                  comment.authorProfileImageUrl
                    ? `${import.meta.env.VITE_API_BASE_URL}${comment.authorProfileImageUrl}`
                    : 'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'
                }
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{comment.fullName}</span>
                  <span className="text-sm text-gray-500">@{comment.username}</span>
                  {comment.authorId === currentUserId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deleteCommentMutation.isPending}
                      className="ml-auto text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
                      aria-label="Delete comment"
                      title="Delete comment"
                    >
                      {deletingCommentId === comment.id ? '...' : 'x'}
                    </button>
                  )}
                </div>
                <p>{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
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
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 outline-none"
          />

          <button
            type="button"
            onClick={handlePostComment}
            disabled={postCommentMutation.isPending || !content.trim()}
            className="rounded-full bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {postCommentMutation.isPending ? t('postdetail.posting') : t('postdetail.post')}
          </button>
        </div>
      </div>

      {isLikesModalOpen && (
        <LikesModal
          postId={postId}
          onClose={() => setIsLikesModalOpen(false)}
        />
      )}
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
