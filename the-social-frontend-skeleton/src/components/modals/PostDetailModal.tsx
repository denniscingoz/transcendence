import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { mockPosts, mockComments, mockFeedComments, mockFeedPosts } from '../../mocks/posts'
import { usePost } from '../../hooks/usePost'
import { useComments, usePostComment } from '../../hooks/useComments'
import { useState } from 'react'
import { ProtectedPostThumb } from '../ui/ProtectedPostThumb'

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

  const handlePostComment = () => {
    const trimmedContent = content.trim()

    if (!trimmedContent) return

    postCommentMutation.mutate(trimmedContent, {
      onSuccess: () => {
        setContent('')
      },
    })
  }


  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  if (!post) {
    return null
  }
  
  if (isPostLoading) return <div>{t('postdetail.loading')}</div>
  
  if (isPostLoading || !post) return <div>{t('postdetail.postnotfound')}</div>

  if (areCommentsLoading) return <div>{t('postdetail.loading')}</div>
  
  if (commentsError || !post) return <div>{t('postdetail.commentnotfound')}</div>


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
            src={post?.authorAvatarUrl ?  `${import.meta.env.VITE_API_BASE_URL}${post.authorAvatarUrl}` : 'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'}
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold">{post.authorFullName}</div>
            <div className="text-sm text-gray-500">@{post.authorUsername}</div>
          </div>
        </div>
        <div className="w-full rounded-2xl object-cover">
        <ProtectedPostThumb fileUrl={post.imageUrl} />
        </div>

        <p>{post.content}</p>
        <p>{t('postdetail.likes')}: {post.likesCount}</p>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start">
              <img
                src={
                  comment.authorProfileImageUrl ||
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

        {/* <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Write a comment..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none"
          />
          <button className="bg-black text-white px-4 py-2 rounded-full">
            Post
          </button>
        </div> */}
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder={t('postdetail.writeacomment')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
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
