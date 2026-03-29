import { useEffect } from 'react'
import { mockPosts, mockComments, mockFeedComments, mockFeedPosts } from '../../mocks/posts'
import { usePost } from '../../hooks/usePost'
import { useComments } from '../../hooks/useComments'

type PostDetailModalProps = {
  postId: string
  onClose: () => void
}

export function PostDetailModal({
  postId,
  onClose,
}: PostDetailModalProps) {
  const { data: post, isLoading: isPostLoading, error: postError } = usePost(postId)
  const { data: commentsData, isLoading: areCommentsLoading, error: commentsError } = useComments(postId)   
  const comments = commentsData?.Items ?? []

  // const comments = allComments.filter((comment) => comment.postId === postId)

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
  
  if (isPostLoading) return <div>Loading...</div>
  
  if (isPostLoading || !post) return <div>Post not found.</div>

  if (areCommentsLoading) return <div>Loading...</div>
  
  if (commentsError || !post) return <div>Comments not found.</div>


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
          Close
        </button>

        <div className="flex items-center gap-3">
          <img
            src={post.AuthorAvatarUrl || 'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'}
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold">{post.AuthorFullName}</div>
            <div className="text-sm text-gray-500">@{post.AuthorUsername}</div>
          </div>
        </div>

        <img
          src={post.ImageUrl}
          alt=""
          className="w-full rounded-2xl object-cover"
        />

        <p>{post.Content}</p>
        <p>Likes: {post.LikesCount}</p>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.Id} className="flex gap-3 items-start">
              <img
                src={
                  comment.AuthorProfileImageUrl ||
                  'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'
                }
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">{comment.FullName}</span>
                  <span className="text-sm text-gray-500">
                    @{comment.Username}
                  </span>
                </div>
                <p>{comment.Content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Write a comment..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none"
          />
          <button className="bg-black text-white px-4 py-2 rounded-full">
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
