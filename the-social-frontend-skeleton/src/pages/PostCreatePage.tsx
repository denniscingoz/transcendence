import { useState, useEffect } from 'react'
import { useAddFriend, useFriends, useRemoveFriend } from '../hooks/useFriends'
import type { CreatePostDto } from '../types/api'
import { useTranslation } from 'react-i18next'
import { BottomNav } from '../components/BottomNav'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { useSharePost, useUploadPostFile } from '../hooks/usePost'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'


type CreatePostForm = {
  caption: string
  postUrl: string
}

export function PostCreatePage() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const [selectedPostFile, setSelectedPostFile] = useState<File | null>(null)
	const [postPreviewUrl, setPostPreviewUrl] = useState<string>('')
 
	const postFileInputRef = useRef<HTMLInputElement | null>(null)
	const [saveError, setSaveError] = useState<string | null>(null)

	const [postForm, setPostForm] = useState<CreatePostForm>({
		caption: '',
		postUrl: '',
	})

  const handlePostPhotoClick = () => {
    postFileInputRef.current?.click()
  }

  const handlePostPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // optional client-side validation
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/') ) {
      alert('Please select an image or video file.')
      return
    }

    setSelectedPostFile(file)
    const previewUrl = URL.createObjectURL(file)
    setPostPreviewUrl(previewUrl)
  }

   const sharePost = useSharePost()
   const uploadPostFile = useUploadPostFile()

	async function handleSharePost() {
	  if (!selectedPostFile) {
	    return
	  }
	
	const payload: Partial<CreatePostDto> = {}
	setSaveError(null)
	try{
	  const uploadedFileId = await uploadPostFile.mutateAsync(selectedPostFile)
	  payload.imageFileId = uploadedFileId
	}catch (e:any)
	{
	  console.log("It is coming all the way to uploadPostFile and catched error")
		setSaveError(getApiErrorMessage(e))
		return
	}

	if (postForm.caption?.trim().length > 0) {
	  payload.content = postForm.caption.trim()
	}
	
	  await sharePost.mutateAsync(payload)
	  navigate('/profile')
	}

  function handleClose() {
	navigate(-1)
  }

  return (
	<div className=" bg-white">
	  <main className="mx-auto h-full max-w-2xl px-4 py-6">
		<div className="panel flex h-[85%] flex-col gap-4">
		  <div className="mb-8 flex items-start justify-between">
				<h1 className="text-2xl font-semibold text-text">{t('createpost.createpost')}</h1>

				<button
				  type="button"
				  onClick={handleClose}
				  className="btn-ghost flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-text hover:bg-gray-100"
				  aria-label="Close settings"
					>
				  ×
				</button>
			</div>
					{/* Select From Computer */}
				<button
                	type="button"
                	onClick={handlePostPhotoClick}
                	className="btn-ghost h-[40px] min-w-[140px] text-sm rounded-xl px-4"
              	>
                	{t('createpost.selectfromcomputer')}
              	</button>

              	<input
                	ref={postFileInputRef}
                	type="file"
                	accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                	className="hidden"
                	onChange={handlePostPreview}
              	/>
			{/* Post Preview Area */}
			<div className="card-gray ">

				{postPreviewUrl && selectedPostFile ? (
				  selectedPostFile.type.startsWith('image/') ? (
				    <img
				      src={postPreviewUrl}
				      alt={t('createpost.acceptedfiletypes')}
				      className="w-full h-full object-contain rounded-2xl"
				    />
				  ) : selectedPostFile.type.startsWith('video/') ? (
				    <video
				      src={postPreviewUrl}
				      controls
				      className="w-full h-full object-contain rounded-2xl"
				    />
				  ) : null
				) : (
				  <div className="py-28 text-center">
				    <p className="font-medium">{t('createpost.acceptedfiletypes')}</p>
				    <p className="font-light">
				      {t('createpost.imagetypes')} / {t('createpost.videotypes')}
				    </p>
				  </div>
				)}
			</div>
			
			{/* {Caption} */}
           	<div className="flex flex-col gap-4">
              <label htmlFor="caption" className="text-sm font-medium text-text">
                {t('createpost.writecaption')}
              </label>
              <textarea
                id="Caption"
                value={postForm.caption}
                onChange={(e) =>
                  setPostForm((prev) => ({ ...prev, caption: e.target.value }))
                }
                rows={4}
				maxLength={150}
                className="w-full rounded-xl border border-panel px-4 py-3 outline-none focus:border-black"
              />
			 
			 <div className= "flex flex-col md:flex-row md:gap-4">
			  <p className="ext-sm text-gray-500">
  				{postForm.caption.length}/150
				</p>
			 <button
				  type="button"
				  onClick={handleSharePost}
				  className="btn-ghost h-[40px] min-w-[140px] text-sm rounded-xl px-4 ml-auto"
				>
				  {t('createpost.share')}
				</button>
							
				<input
				  ref={postFileInputRef}
				  type="file"
				  accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
				  className="hidden"
				  onChange={handlePostPreview}
				/>
			</div>
			</div>
			{/* Error message reveal */}
            <div>
                {saveError && (
                  <div className="text-sm text-red-600 text-center">{saveError}</div>
                )}
            </div>
		</div>
	  </main>

	  <BottomNav onSearchClick={() => {}} />
	</div>
  )
}