import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePost, useDeletePost } from '../../hooks/usePost'
import { useComments, usePostComment, useDeleteComment } from '../../hooks/useComments'
import { ProtectedPostThumbContent } from '../ui/ProtectedPostThumb'
import { PostDto } from '../../types/api'
import api from '../../api/axios'
import { useMyProfile } from '../../hooks/useProfile'
import { LikesModal } from './LikesModal'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { UnknownProfileAvatar } from '../icons/UnknownProfileAvatar'
import { HeartFilledIcon } from '../icons/HeartFilledIcon'
import { HeartIcon } from '../icons/HeatIcon'
import { XCircleIcon } from '../icons/XCircleIcon'

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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useComments(postId, 12, !isDeletingPost && !isPostDeleted)
  const comments = useMemo(
    () => commentsData?.pages.flatMap((page) => page.items) ?? [],
    [commentsData]
  )

  const loadMoreComments = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return
    }
    void fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const commentsSentinelRef = useInfiniteScroll({
    enabled: !!hasNextPage && !areCommentsLoading && !isFetchingNextPage,
    onLoadMore: loadMoreComments,
    rootMargin: '150px',
  })

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
      className="fixed top-0 inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
    >
      {/* It is for outer click closing */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel top-5 bottom-5 relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 space-y-6"
      >
        {/* Close Button */}
        <div>
          <button
            onClick={onClose}
            className="group absolute right-6 top-4 flex items-center justify-center text-xl leading-none text-text"
          >
            <XCircleIcon/>
          </button>
        </div>
    

        {/* User Top Information */}
        <div className="flex items-center gap-4 pt-2">
          {displayPost.authorAvatarUrl ? <img
            src={`${import.meta.env.VITE_API_BASE_URL}${displayPost.authorAvatarUrl}`}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
            : (<UnknownProfileAvatar className="h-10 w-10 rounded-full object-cover"/> ) }
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

          {/* Post */}
        <div className="w-full rounded-2xl object-cover">
          <ProtectedPostThumbContent fileUrl={displayPost.imageUrl} contentType={displayPost.contentType} />
        </div>
        {/* Post Caption */}
        <p>{displayPost.content}</p>

        {/* Like */}
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
          
        {/* Existing Comments */}
       <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              {/* Comment Owner Avatar */}
             {  comment.authorProfileImageUrl ?
             <img
                src={`${import.meta.env.VITE_API_BASE_URL}${comment.authorProfileImageUrl}`}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
              : (<UnknownProfileAvatar className="h-10 w-10 rounded-full object-cover"/> ) }

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {/* Comment Owner Full Name */}
                  <span className="font-semibold">{comment.fullName}</span>
                  {/* Comment Owner UserName */} 
                  <span className="text-sm text-gray-500">@{comment.username}</span>

                  {/* Comment Owner can Delete X button */} 
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
                {/* Comment CONTENT */} 
                <p
                  className="whitespace-pre-wrap"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {comment.content}
                </p>
              </div>
            </div>
          ))}

          {isFetchingNextPage && (
            <div className="py-2 text-center text-sm text-gray-500">Loading more comments...</div>
          )}

          {hasNextPage && <div ref={commentsSentinelRef} className="h-1 w-full" aria-hidden="true" />}
        </div>

          {/* Comment Input Bar */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder={t('postdetail.writeacomment')}
            value={content}
            maxLength={100}
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