import { useState } from 'react'
import type { CreatePostDto } from '../types/api'
import { useTranslation } from 'react-i18next'
import { BottomNav } from '../components/BottomNav'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { useSharePost, useUploadPostFile } from '../hooks/usePost'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import { UploadProgressOverlay } from '../components/UploadProgressOverlay'


type CreatePostForm = {
  caption: string
  postUrl: string
}

const MAX_IMAGE_ASPECT_RATIO = 6

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const imageUrl = URL.createObjectURL(file)
		const image = new Image()

		image.onload = () => {
			const width = image.naturalWidth
			const height = image.naturalHeight
			URL.revokeObjectURL(imageUrl)
			resolve({ width, height })
		}

		image.onerror = () => {
			URL.revokeObjectURL(imageUrl)
			reject(new Error('Failed to read image dimensions.'))
		}

		image.src = imageUrl
	})
}

export function PostCreatePage() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const [selectedPostFile, setSelectedPostFile] = useState<File | null>(null)
	const [postPreviewUrl, setPostPreviewUrl] = useState<string>('')
	const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [isUploadComplete, setIsUploadComplete] = useState(false)
 
	const postFileInputRef = useRef<HTMLInputElement | null>(null)
	const [saveError, setSaveError] = useState<string | null>(null)

	const [postForm, setPostForm] = useState<CreatePostForm>({
		caption: '',
		postUrl: '',
	})

	const OVERLAY_REDIRECT_DELAY_MS = 800

  const handlePostPhotoClick = () => {
    postFileInputRef.current?.click()
  }

	const handlePostPreview = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // optional client-side validation
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/') ) {
      alert('Please select an image or video file.')
      return
    }

		if (file.type.startsWith('image/')) {
			try {
				const { width, height } = await getImageDimensions(file)
				const isTooWide = width > height * MAX_IMAGE_ASPECT_RATIO
				const isTooTall = height > width * MAX_IMAGE_ASPECT_RATIO

				if (isTooWide || isTooTall) {
					setSaveError('Image ratio is not acceptable. Width and height cannot exceed a 6:1 ratio.')
					e.target.value = ''
					return
				}
			} catch {
				setSaveError('Could not validate selected image.')
				e.target.value = ''
				return
			}
		}

		setSaveError(null)
    setSelectedPostFile(file)
		if (postPreviewUrl) {
			URL.revokeObjectURL(postPreviewUrl)
		}
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
	  setIsUploadOverlayOpen(true)
	  setUploadProgress(0)
	  setIsUploadComplete(false)

	  try {
	    const uploadedFileId = await uploadPostFile.mutateAsync({
	      file: selectedPostFile,
	      onProgress: (progress) => {
	        // Keep some headroom until the backend confirms the full workflow succeeded.
	        setUploadProgress(Math.min(progress, 98))
	      },
	    })
	    payload.imageFileId = uploadedFileId

	    if (postForm.caption?.trim().length > 0) {
	      payload.content = postForm.caption.trim()
	    }

	    await sharePost.mutateAsync(payload)

	    setUploadProgress(100)
	    setIsUploadComplete(true)

	    window.setTimeout(() => {
	      navigate('/profile')
	    }, OVERLAY_REDIRECT_DELAY_MS)
	  } catch (e: any) {
	    setIsUploadOverlayOpen(false)
	    setUploadProgress(0)
	    setIsUploadComplete(false)
	    setSaveError(getApiErrorMessage(e))
	  }
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
                id="caption"
                value={postForm.caption}
                onChange={(e) =>
                  setPostForm((prev) => ({ ...prev, caption: e.target.value }))
                }
                rows={4}
				maxLength={150}
                className="w-full rounded-xl border border-panel px-4 py-3 outline-none focus:border-black"
              />
			 
			 <div className= "flex flex-col md:flex-row md:gap-4">
			  <p className="text-sm text-gray-500">
  				{postForm.caption.length}/150
				</p>
			 <button
				  type="button"
				  onClick={handleSharePost}
				  disabled={isUploadOverlayOpen || sharePost.isPending || uploadPostFile.isPending || !selectedPostFile}
				  className="btn-ghost h-[40px] min-w-[140px] text-sm rounded-xl px-4 ml-auto"
				>
				  {t('createpost.share')}
				</button>
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

	  <UploadProgressOverlay
		open={isUploadOverlayOpen}
		progress={uploadProgress}
		isComplete={isUploadComplete}
		title="Uploading post"
		subtitle="Please keep this screen open while we upload your media."
		completionText="Post shared"
	  />
	</div>
  )
}