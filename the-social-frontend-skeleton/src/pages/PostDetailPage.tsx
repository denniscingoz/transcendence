import { useParams } from 'react-router-dom'
import { mockPosts, mockComments } from '../mocks/posts'

export function PostDetailPage() {
  const { postId } = useParams()

  const post = mockPosts.find((p) => p.Id === postId)
  const comments = mockComments.filter((comment) => comment.postId === postId)

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <img
            src={post.AuthorAvatarUrl || 'https://via.placeholder.com/40'}
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
                  'https://via.placeholder.com/40'
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