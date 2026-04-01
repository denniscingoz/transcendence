// import { useParams } from 'react-router-dom'
// import { mockPosts, mockComments } from '../mocks/posts'
// import { usePost } from '../hooks/usePost'

// export function PostDetailPage() {
//   const { postId } = useParams()

//   const { data: post, isLoading, error } = usePost(postId)
//   const comments = mockComments.filter((comment) => comment.postId === postId)

//   if (!post) {
//     return <div>Post not found</div>
//   }

//   if (isLoading) return <div>Loading...</div>
  
//   if (error || !post) return <div>Post not found.</div>

//   return (
//     <div className="min-h-screen bg-white p-6">
//       <div className="max-w-2xl mx-auto space-y-6">
//         <div className="flex items-center gap-3">
//           <img
//             src={post.AuthorAvatarUrl || 'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'}
//             alt=""
//             className="w-12 h-12 rounded-full object-cover"
//           />
//           <div>
//             <div className="font-semibold">{post.AuthorFullName}</div>
//             <div className="text-sm text-gray-500">@{post.AuthorUsername}</div>
//           </div>
//         </div>

//         <img
//           src={post.ImageUrl}
//           alt=""
//           className="w-full rounded-2xl object-cover"
//         />

//         <p>{post.Content}</p>
//         <p>Likes: {post.LikesCount}</p>


//         <div className="space-y-4">
//           {comments.map((comment) => (
//             <div key={comment.Id} className="flex gap-3 items-start">
//               <img
//                 src={
//                   comment.AuthorProfileImageUrl ||
//                   'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'
//                 }
//                 alt=""
//                 className="w-10 h-10 rounded-full object-cover"
//               />

//               <div>
//                 <div className="flex gap-2 items-center">
//                   <span className="font-semibold">{comment.FullName}</span>
//                   <span className="text-sm text-gray-500">
//                     @{comment.Username}
//                   </span>
//                 </div>

//                 <p>{comment.Content}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//                 <div className="flex gap-3 items-center">
//           <input
//             type="text"
//             placeholder="Write a comment..."
//             className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none"
//           />
//           <button className="bg-black text-white px-4 py-2 rounded-full">
//             Post
//           </button>
//         </div>

//       </div>
//     </div>
//   )
// }

// export function NoProfilePhoto({ className }: { className?: string }) {
//   return (
//     <svg
//       className={className}
//       viewBox="0 0 465 515.25"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//       aria-hidden="true"
//     >
//       <path
//         d="M446.77,515.25h-6.52c-136.44-.66-278.98-.66-415.5,0h-6.38c-.2-60.13,24.58-121.94,66.19-165.89,17.59-18.58,37.98-33.36,61.08-43.94,7.03-3.22,14.43-1.44,18.43,5.32,14.57,24.58,40.66,39.1,68.78,38.99,28.2-.11,53.99-14.81,68.52-39.41,3.66-6.19,11.03-8,17.38-5.17,79.05,35.28,128.23,125.82,128.02,210.1Z"
//         fill="currentColor"
//       />
//       <circle cx="232.56" cy="192.62" r="106.65" fill="currentColor" />
//     </svg>
//   )
// }