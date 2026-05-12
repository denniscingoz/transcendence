import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMyProfile, useUpdateProfile, useChangePassword, useUploadAvatar } from '../hooks/useProfile'
import type { UpdateProfileDto, ChangePasswordDto } from '../types/api'
import { useRef } from 'react'
import { UploadProgressOverlay } from '../components/UploadProgressOverlay'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import { UnknownProfileAvatar } from '../components/icons/UnknownProfileAvatar'
import { XCircleIcon } from '../components/icons/XCircleIcon'

type EditProfileForm = {
  fullName: string
  username: string
  bio: string
  AvatarUrl: string
}

const DUMMY_PROFILE_FORM: EditProfileForm = {
  fullName: '',
  username: '',
  bio: '',
  AvatarUrl:'',
}

export function EditProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    data: myProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useMyProfile()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const uploadAvatar = useUploadAvatar()
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState('')
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [overlayProgress, setOverlayProgress] = useState(0)
  const [isOverlayComplete, setIsOverlayComplete] = useState(false)
  const [overlayTitle, setOverlayTitle] = useState('Saving changes')
  const [overlaySubtitle, setOverlaySubtitle] = useState('Please wait while we update your profile.')
  const [overlayCompletionText, setOverlayCompletionText] = useState('Saved')

  const [profileForm, setProfileForm] = useState<EditProfileForm>({
    fullName: '',
    username: '',
    bio: '',
    AvatarUrl: '',
  })
  const [originalProfileForm, setOriginalProfileForm] = useState<EditProfileForm | null>(null)


  const [passwordForm, setPasswordForm] = useState<ChangePasswordDto>({
    currentPassword: '',
    newPassword: '',
  })

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const isAnyProfileActionPending =
    updateProfile.isPending || uploadAvatar.isPending || changePassword.isPending

  useEffect(() => {
    if (!isOverlayOpen || isOverlayComplete || !isAnyProfileActionPending) {
      return
    }

    const id = window.setInterval(() => {
      setOverlayProgress(prev => (prev < 90 ? prev + 5 : prev))
    }, 140)

    return () => {
      window.clearInterval(id)
    }
  }, [isOverlayOpen, isOverlayComplete, isAnyProfileActionPending])

  function startOverlay(mode: 'save' | 'password') {
    setIsOverlayOpen(true)
    setIsOverlayComplete(false)
    setOverlayProgress(12)

    if (mode === 'save') {
      setOverlayTitle('Saving changes')
      setOverlaySubtitle('Please wait while we update your profile.')
      setOverlayCompletionText('Profile updated')
      return
    }

    setOverlayTitle('Changing password')
    setOverlaySubtitle('Please wait while we update your password.')
    setOverlayCompletionText('Password changed')
  }

  function failAndCloseOverlay() {
    setIsOverlayOpen(false)
    setIsOverlayComplete(false)
    setOverlayProgress(0)
  }

  function completeAndCloseOverlay() {
    setOverlayProgress(100)
    setIsOverlayComplete(true)

    window.setTimeout(() => {
      setIsOverlayOpen(false)
      setIsOverlayComplete(false)
      setOverlayProgress(0)
    }, 650)
  }

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // optional client-side validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    setSelectedAvatarFile(file)
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreviewUrl(previewUrl)
  }

  useEffect(() => {
    if (!myProfile) return

    const mappedProfile: EditProfileForm = {
      fullName: myProfile.fullName || DUMMY_PROFILE_FORM.fullName,
      username: myProfile.username || DUMMY_PROFILE_FORM.username,
      bio: myProfile.bio ?? DUMMY_PROFILE_FORM.bio,
      AvatarUrl: myProfile.avatarUrl ?? '',
    }

    setProfileForm(mappedProfile)
    setOriginalProfileForm(mappedProfile)
  }, [myProfile])

  useEffect(() => {
    if (!isProfileError || myProfile || originalProfileForm) return
    setProfileForm(DUMMY_PROFILE_FORM)
    setOriginalProfileForm(DUMMY_PROFILE_FORM)
  }, [isProfileError, myProfile, originalProfileForm])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!originalProfileForm) return

    startOverlay('save')

    const payload: Partial<UpdateProfileDto> = {}

    if (profileForm.fullName !== originalProfileForm.fullName) {
      payload.fullName = profileForm.fullName
    }

    if (profileForm.username !== originalProfileForm.username) {
      payload.username = profileForm.username
    }

    if (profileForm.bio !== originalProfileForm.bio) {
      payload.bio = profileForm.bio.length > 0 ? profileForm.bio : null
    }

    if (selectedAvatarFile) {
      setSaveError(null)
      try {
      const uploadedAvatarUrl = await uploadAvatar.mutateAsync(selectedAvatarFile)
      payload.avatarUrl = uploadedAvatarUrl
      }catch (e: any)
      {
        setSaveError(getApiErrorMessage(e))
        failAndCloseOverlay()
        return
      }
    }

    if (!selectedAvatarFile && profileForm.AvatarUrl !== originalProfileForm.AvatarUrl) {
      payload.avatarUrl = profileForm.AvatarUrl.length > 0 ? profileForm.AvatarUrl : null
    }

    if (Object.keys(payload).length === 0) {
      failAndCloseOverlay()
      return
    }

    try {
      const updated = await updateProfile.mutateAsync(payload)
      setOriginalProfileForm({
        fullName: updated.fullName,
        username: updated.username,
        bio: updated.bio ?? '',
        AvatarUrl: updated.avatarUrl ?? '',
      })
      setProfileForm({
        fullName: updated.fullName,
        username: updated.username,
        bio: updated.bio ?? '',
        AvatarUrl: updated.avatarUrl ?? '',
      })
      setSelectedAvatarFile(null)
      setAvatarPreviewUrl('')
      completeAndCloseOverlay()
    } catch (e: any) {
      setSaveError(getApiErrorMessage(e))
      failAndCloseOverlay()
    }
  }

async function handleChangePassword(e: React.FormEvent) {
  e.preventDefault()

  if (!passwordForm.currentPassword || !passwordForm.newPassword) {
    return
  }

  startOverlay('password')

  setPasswordError('')

  try {
    await changePassword.mutateAsync({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })

    setPasswordForm({
      currentPassword: '',
      newPassword: '',
    })
    completeAndCloseOverlay()
  } catch (e: any) {
    setPasswordError(getApiErrorMessage(e))
    failAndCloseOverlay()
    return
  }
}

  function handleDiscard() {
    navigate(-1)
  }
  
  function handleClose() {
    navigate(-1)
  }

  if (isProfileLoading) {
    return (
      <div className="min-h-[calc(100dvh-250px)] bg-bg px-4 py-8 pb-32">
        <div className="mx-auto max-w-3xl text-text">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100dvh-250px)] bg-bg px-4 py-8 pb-32">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {/* {Form with Bio, Name, Username, AvatarUrl && and includes close x with Edit header} */}
        <form
          onSubmit={handleSaveProfile}
          className="panel rounded-2xl border border-panel p-6 shadow-sm"
        >
          
        {/* {Close x and Edit header} */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-text">{t('editprofile.editprofile')}</h1>
            
            <button 
              type="button"
              onClick={handleClose}
              className="group flex items-center justify-center rounded-full"
              aria-label="Close Edit Profile"
            >
              <XCircleIcon className="h-12 w-12" />
            </button>
          </div>
            
        {/* {AvatarUrl} */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              
              {
                avatarPreviewUrl || profileForm.AvatarUrl ? 
                <img
                src={avatarPreviewUrl || `${import.meta.env.VITE_API_BASE_URL}${profileForm.AvatarUrl }`}
                  alt="Profile avatar"
                  className="h-24 w-24 rounded-full object-cover ring-2 ring-panel"
                  />
                  : (<UnknownProfileAvatar className="h-24 w-24 rounded-full object-cover ring-2 ring-panel"/>)
              }
              <button
                type="button"
                onClick={handleChangePhotoClick}
                className="btn-ghost h-[40px] min-w-[140px] text-sm rounded-xl px-4"
              >
                {t('editprofile.changephoto')}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

          {/* {Bio} */}
            <div className="flex flex-col gap-2">
              <label htmlFor="bio" className="text-sm font-medium text-text">
                {t('editprofile.bio')}
              </label>
              <textarea
                id="bio"
                value={profileForm.bio}
                maxLength={150}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                rows={4}
                className="w-full rounded-xl border border-panel px-4 py-3 outline-none focus:border-black"
              />
            </div>

          {/* {FullName} */}
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="text-sm font-medium text-text">
                {t('editprofile.fullname')}
              </label>
              <input
                id="fullName"
                type="text"
                value={profileForm.fullName}
                maxLength={50}
                minLength={1}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="h-11 w-full rounded-xl border border-panel px-4 outline-none focus:border-black"
              />
            </div>

          {/* {Username} */}
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium text-text">
                {t('editprofile.username')}
              </label>
              <input
                id="username"
                type="text"
                value={profileForm.username}
                maxLength={15}
                minLength={6}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, username: e.target.value }))
                }
                className="h-11 w-full rounded-xl border border-panel px-4 outline-none focus:border-black"
              />
            </div>
        
            {/* Error message reveal */}
            <div>
                {saveError && (
                  <div className="text-sm text-red-600 text-center">{saveError}</div>
                )}
            </div>
        
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-ghost rounded-xl px-5 py-2 text-sm"
                disabled={updateProfile.isPending || uploadAvatar.isPending}
              >
                {updateProfile.isPending ? t('editprofile.saving') : t('editprofile.savechanges')}
              </button>

              <button
                type="button"
                onClick={handleDiscard}
                className="btn-ghost rounded-xl px-5 py-2 text-sm font-medium"
              >
                {t('editprofile.discard')}
              </button>
            </div>
          </div>
        </form>

        <form
          onSubmit={handleChangePassword}
          className="panel rounded-2xl border border-panel p-6 shadow-sm"
        >
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-text"> {t('editprofile.changepassword')}</h2>

            <div className="flex flex-col gap-2">
              <label htmlFor="oldPassword" className="text-sm font-medium text-text">
                {t('editprofile.oldpassword')}
              </label>
              <input
                id="oldPassword"
                type="password"
                value={passwordForm.currentPassword}
                maxLength={50}
                minLength={8}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-panel px-4 outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-text">
                {t('editprofile.newpassword')}
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                maxLength={50}
                minLength={8}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-panel px-4 outline-none focus:border-black"
              />
            </div>

                {/*Password Error Message reveall  */}
             <div>
                {passwordError && (
                  <div className="text-sm text-red-600 text-center">{passwordError}</div>
                )}
            </div>   
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-ghost rounded-xl px-5 py-2 text-sm font-medium"
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? t('common.loading') : t('editprofile.changepassword')}
              </button>

              <button
                type="button"
                onClick={handleDiscard}
                className="btn-ghost rounded-xl px-5 py-2 text-sm font-medium"
              >
                 {t('editprofile.discard')}
              </button>
            </div>
          </div>
        </form>
      </div>

      <UploadProgressOverlay
        open={isOverlayOpen}
        progress={overlayProgress}
        isComplete={isOverlayComplete}
        title={overlayTitle}
        subtitle={overlaySubtitle}
        completionText={overlayCompletionText}
      />
    </div>
  )
}